import type {
  CreatePaymentLinkInput,
  PayPaymentLinkInput,
  PayPaymentLinkResult,
  PaymentLink,
  PaymentLinkStatusSnapshot,
  PublicPaymentLink,
} from '../entities/PaymentLink';

export interface IPaymentLinkRepository {
  create(input: CreatePaymentLinkInput): Promise<PaymentLink>;
  list(): Promise<PaymentLink[]>;
  cancel(token: string): Promise<PaymentLink>;
  getPublic(token: string): Promise<PublicPaymentLink>;
  getStatus(token: string): Promise<PaymentLinkStatusSnapshot>;
  pay(token: string, input: PayPaymentLinkInput): Promise<PayPaymentLinkResult>;
}