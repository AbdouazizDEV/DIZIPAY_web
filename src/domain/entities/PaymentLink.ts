export const PaymentLinkStatus = {
  ACTIVE: 'ACTIVE',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentLinkStatus =
  (typeof PaymentLinkStatus)[keyof typeof PaymentLinkStatus];

/** Montant API en centimes XOF (150000 = 1 500 XOF). */
export type MoneyCents = number;

export interface PaymentLink {
  id: string;
  token: string;
  url: string;
  amount: MoneyCents;
  currency: string;
  description: string | null;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  paidAt: string | null;
  transactionId: string | null;
  qrPayload: string | null;
  svg?: string;
  merchantName?: string;
  createdAt: string;
}

export interface PublicPaymentLink {
  token: string;
  amount: MoneyCents;
  currency: string;
  description: string | null;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  paidAt: string | null;
  merchantName: string;
  merchantType?: string;
  qrPayload: string | null;
  svg?: string;
  url: string;
  instructions?: string;
}

export interface PaymentLinkStatusSnapshot {
  token: string;
  status: PaymentLinkStatus;
  transactionStatus: string | null;
  amount: MoneyCents;
  currency: string;
  paidAt: string | null;
}

export interface CreatePaymentLinkInput {
  amount: MoneyCents;
  description?: string;
  expiresInMinutes?: number;
  includeSvg?: boolean;
}

export type PaymentProviderType = 'PSPI' | 'WAVE';

export interface PayPaymentLinkInput {
  clientPhone?: string;
  qrCode?: string;
  clientAlias?: string;
  /** Défaut API : PSPI */
  paymentProvider?: PaymentProviderType;
}

export interface PayPaymentLinkResult {
  status: PaymentLinkStatus;
  transactionStatus?: string;
  message?: string;
  [key: string]: unknown;
}
