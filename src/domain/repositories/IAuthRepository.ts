import type { LoginCredentials, MerchantSession } from '../entities/MerchantSession';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<MerchantSession>;
}
