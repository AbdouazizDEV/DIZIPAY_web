import type {
  CreatePayoutInput,
  PayoutResult,
  PayoutStatusSnapshot,
} from '../entities/Payout';

export interface IPayoutRepository {
  create(input: CreatePayoutInput): Promise<PayoutResult>;
  getStatus(providerPayoutId: string): Promise<PayoutStatusSnapshot>;
}
