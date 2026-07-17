import type { PaymentLink, PublicPaymentLink } from '../../domain/entities/PaymentLink';
import { PaymentLinkStatus } from '../../domain/entities/PaymentLink';
import { formatDateTime, formatXofFromCents } from '../../shared/utils/money';

export interface PaymentLinkViewModel {
  id: string;
  token: string;
  url: string;
  amountLabel: string;
  amountCents: number;
  currency: string;
  description: string;
  status: PaymentLink['status'];
  statusLabel: string;
  expiresAtLabel: string;
  paidAtLabel: string;
  createdAtLabel: string;
  qrPayload: string | null;
  svg?: string;
  merchantName?: string;
  isActive: boolean;
  canCancel: boolean;
}

export interface PublicPaymentLinkViewModel {
  token: string;
  url: string;
  amountLabel: string;
  amountCents: number;
  currency: string;
  description: string;
  status: PublicPaymentLink['status'];
  statusLabel: string;
  expiresAtLabel: string;
  merchantName: string;
  qrPayload: string | null;
  svg?: string;
  instructions: string;
  isPayable: boolean;
}

const STATUS_LABELS: Record<PaymentLink['status'], string> = {
  ACTIVE: 'Actif',
  PAID: 'Payé',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
};

export function toPaymentLinkViewModel(link: PaymentLink): PaymentLinkViewModel {
  return {
    id: link.id,
    token: link.token,
    url: link.url,
    amountLabel: formatXofFromCents(link.amount),
    amountCents: link.amount,
    currency: link.currency,
    description: link.description?.trim() || 'Sans description',
    status: link.status,
    statusLabel: STATUS_LABELS[link.status],
    expiresAtLabel: formatDateTime(link.expiresAt),
    paidAtLabel: formatDateTime(link.paidAt),
    createdAtLabel: formatDateTime(link.createdAt),
    qrPayload: link.qrPayload,
    svg: link.svg,
    merchantName: link.merchantName,
    isActive: link.status === PaymentLinkStatus.ACTIVE,
    canCancel: link.status === PaymentLinkStatus.ACTIVE,
  };
}

export function toPublicPaymentLinkViewModel(
  link: PublicPaymentLink,
): PublicPaymentLinkViewModel {
  return {
    token: link.token,
    url: link.url,
    amountLabel: formatXofFromCents(link.amount),
    amountCents: link.amount,
    currency: link.currency,
    description: link.description?.trim() || '',
    status: link.status,
    statusLabel: STATUS_LABELS[link.status],
    expiresAtLabel: formatDateTime(link.expiresAt),
    merchantName: link.merchantName,
    qrPayload: link.qrPayload,
    svg: link.svg,
    instructions:
      link.instructions ??
      'Scannez le QR avec votre application de paiement (Wave, Orange Money, Free Money, PI-SPI).',
    isPayable: link.status === PaymentLinkStatus.ACTIVE,
  };
}

export function summarizeLinks(links: PaymentLink[]): {
  active: number;
  paid: number;
  expired: number;
  cancelled: number;
  total: number;
} {
  return links.reduce(
    (acc, link) => {
      acc.total += 1;
      if (link.status === PaymentLinkStatus.ACTIVE) acc.active += 1;
      if (link.status === PaymentLinkStatus.PAID) acc.paid += 1;
      if (link.status === PaymentLinkStatus.EXPIRED) acc.expired += 1;
      if (link.status === PaymentLinkStatus.CANCELLED) acc.cancelled += 1;
      return acc;
    },
    { active: 0, paid: 0, expired: 0, cancelled: 0, total: 0 },
  );
}
