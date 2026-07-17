import type { PaymentProviderType } from './PaymentLink';

export interface PaymentProvider {
  type: PaymentProviderType;
  label: string;
  available: boolean;
  reason?: string;
}

export interface PaymentProvidersResponse {
  providers: PaymentProvider[];
}
