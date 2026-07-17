import type { MoneyCents } from './PaymentLink';

export const PayoutAccountType = {
  MOBILE_MONEY: 'MOBILE_MONEY',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
} as const;

export type PayoutAccountType =
  (typeof PayoutAccountType)[keyof typeof PayoutAccountType];

export interface CreateMobileMoneyPayoutInput {
  accountType: 'MOBILE_MONEY';
  debitAccount: string;
  pispiAccountId: string;
  holderName: string;
  phoneNumber: string;
  amount: MoneyCents;
  currency?: string;
  reference: string;
  description?: string;
}

export interface CreateBankAccountPayoutInput {
  accountType: 'BANK_ACCOUNT';
  debitAccount: string;
  iban: string;
  holderName: string;
  bic?: string;
  countryCode?: string;
  amount: MoneyCents;
  currency?: string;
  reference: string;
  description?: string;
}

export type CreatePayoutInput =
  | CreateMobileMoneyPayoutInput
  | CreateBankAccountPayoutInput;

export interface PayoutResult {
  providerPayoutId?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PayoutStatusSnapshot {
  providerPayoutId: string;
  status: string;
  [key: string]: unknown;
}
