import type { PaymentProvider } from '../entities/PaymentProvider';

export interface IPaymentProviderRepository {
  listProviders(): Promise<PaymentProvider[]>;
}
