import type { AxiosInstance } from 'axios';
import type { PaymentProvider } from '../../domain/entities/PaymentProvider';
import type { IPaymentProviderRepository } from '../../domain/repositories/IPaymentProviderRepository';

interface PaymentProvidersDto {
  providers: PaymentProvider[];
}

export class HttpPaymentProviderRepository implements IPaymentProviderRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async listProviders(): Promise<PaymentProvider[]> {
    const { data } = await this.http.get<PaymentProvidersDto>('/payment-providers');
    return data.providers ?? [];
  }
}
