import type { AxiosInstance } from 'axios';
import type {
  CreatePayoutInput,
  PayoutResult,
  PayoutStatusSnapshot,
} from '../../domain/entities/Payout';
import type { IPayoutRepository } from '../../domain/repositories/IPayoutRepository';

export class HttpPayoutRepository implements IPayoutRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async create(input: CreatePayoutInput): Promise<PayoutResult> {
    const { data } = await this.http.post<PayoutResult>('/payouts', input);
    return data;
  }

  async getStatus(providerPayoutId: string): Promise<PayoutStatusSnapshot> {
    const { data } = await this.http.get<PayoutStatusSnapshot>(
      `/payouts/${providerPayoutId}/status`,
    );
    return data;
  }
}
