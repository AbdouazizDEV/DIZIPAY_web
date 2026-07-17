import { useQuery } from '@tanstack/react-query';
import { getServices } from '../../infrastructure/repositories/container';
import { toPaymentProviderViewModel } from '../mappers/paymentProviderMapper';

export const paymentProviderKeys = {
  all: ['payment-providers'] as const,
  list: () => [...paymentProviderKeys.all, 'list'] as const,
};

export function usePaymentProviders() {
  const { paymentProviderRepository } = getServices();

  return useQuery({
    queryKey: paymentProviderKeys.list(),
    queryFn: () => paymentProviderRepository.listProviders(),
    select: (providers) => providers.map(toPaymentProviderViewModel),
    staleTime: 60_000,
  });
}
