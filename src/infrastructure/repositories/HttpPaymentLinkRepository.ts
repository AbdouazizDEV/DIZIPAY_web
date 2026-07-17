import type { AxiosInstance } from 'axios';
import type {
  CreatePaymentLinkInput,
  PayPaymentLinkInput,
  PayPaymentLinkResult,
  PaymentLink,
  PaymentLinkStatusSnapshot,
  PublicPaymentLink,
} from '../../domain/entities/PaymentLink';
import type { IPaymentLinkRepository } from '../../domain/repositories/IPaymentLinkRepository';

export class HttpPaymentLinkRepository implements IPaymentLinkRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async create(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    const { data } = await this.http.post<PaymentLink>('/payment-links', input);
    return data;
  }

  async list(): Promise<PaymentLink[]> {
    const { data } = await this.http.get<PaymentLink[]>('/payment-links');
    return data;
  }

  async cancel(token: string): Promise<PaymentLink> {
    const { data } = await this.http.post<PaymentLink>(`/payment-links/${token}/cancel`);
    return data;
  }

  async getPublic(token: string): Promise<PublicPaymentLink> {
    const { data } = await this.http.get<PublicPaymentLink>(`/payment-links/${token}`);
    return data;
  }

  async getStatus(token: string): Promise<PaymentLinkStatusSnapshot> {
    const { data } = await this.http.get<PaymentLinkStatusSnapshot>(
      `/payment-links/${token}/status`,
    );
    return data;
  }

  async pay(token: string, input: PayPaymentLinkInput): Promise<PayPaymentLinkResult> {
    const { data } = await this.http.post<PayPaymentLinkResult>(
      `/payment-links/${token}/pay`,
      input,
    );
    return data;
  }
}
