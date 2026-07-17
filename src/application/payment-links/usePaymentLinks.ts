import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreatePaymentLinkInput, PayPaymentLinkInput } from '../../domain/entities/PaymentLink';
import { PaymentLinkStatus } from '../../domain/entities/PaymentLink';
import { getServices } from '../../infrastructure/repositories/container';
import {
  summarizeLinks,
  toPaymentLinkViewModel,
  toPublicPaymentLinkViewModel,
} from '../mappers/paymentLinkMapper';

export const paymentLinkKeys = {
  all: ['payment-links'] as const,
  list: () => [...paymentLinkKeys.all, 'list'] as const,
  detail: (token: string) => [...paymentLinkKeys.all, 'detail', token] as const,
  public: (token: string) => [...paymentLinkKeys.all, 'public', token] as const,
  status: (token: string) => [...paymentLinkKeys.all, 'status', token] as const,
};

export function usePaymentLinks() {
  const { paymentLinkRepository } = getServices();
  return useQuery({
    queryKey: paymentLinkKeys.list(),
    queryFn: () => paymentLinkRepository.list(),
    select: (links) => ({
      links: links.map(toPaymentLinkViewModel),
      summary: summarizeLinks(links),
      raw: links,
    }),
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();
  const { paymentLinkRepository } = getServices();

  return useMutation({
    mutationFn: (input: CreatePaymentLinkInput) => paymentLinkRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.list() });
    },
  });
}

export function useCancelPaymentLink() {
  const queryClient = useQueryClient();
  const { paymentLinkRepository } = getServices();

  return useMutation({
    mutationFn: (token: string) => paymentLinkRepository.cancel(token),
    onSuccess: (_data, token) => {
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.list() });
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.detail(token) });
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.status(token) });
    },
  });
}

export function useMerchantPaymentLink(token: string | undefined) {
  const { paymentLinkRepository } = getServices();
  return useQuery({
    queryKey: paymentLinkKeys.detail(token ?? ''),
    enabled: Boolean(token),
    queryFn: async () => {
      const links = await paymentLinkRepository.list();
      const found = links.find((l) => l.token === token);
      if (!found) {
        throw Object.assign(new Error('Lien introuvable'), { status: 404 });
      }
      return found;
    },
    select: toPaymentLinkViewModel,
  });
}

export function usePublicPaymentLink(token: string | undefined) {
  const { paymentLinkRepository } = getServices();
  return useQuery({
    queryKey: paymentLinkKeys.public(token ?? ''),
    enabled: Boolean(token),
    queryFn: () => paymentLinkRepository.getPublic(token!),
    select: toPublicPaymentLinkViewModel,
    retry: (failureCount, error) => {
      const status = (error as { status?: number }).status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

const TERMINAL: ReadonlySet<string> = new Set([
  PaymentLinkStatus.PAID,
  PaymentLinkStatus.EXPIRED,
  PaymentLinkStatus.CANCELLED,
]);

export function usePaymentLinkStatus(
  token: string | undefined,
  options?: { enabled?: boolean; pollMs?: number },
) {
  const { paymentLinkRepository } = getServices();
  const enabled = Boolean(token) && (options?.enabled ?? true);
  const pollMs = options?.pollMs ?? 4000;

  return useQuery({
    queryKey: paymentLinkKeys.status(token ?? ''),
    enabled,
    queryFn: () => paymentLinkRepository.getStatus(token!),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL.has(status)) return false;
      return pollMs;
    },
  });
}

export function usePayPaymentLink(token: string) {
  const queryClient = useQueryClient();
  const { paymentLinkRepository } = getServices();

  return useMutation({
    mutationFn: (input: PayPaymentLinkInput) => paymentLinkRepository.pay(token, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.public(token) });
      void queryClient.invalidateQueries({ queryKey: paymentLinkKeys.status(token) });
    },
  });
}
