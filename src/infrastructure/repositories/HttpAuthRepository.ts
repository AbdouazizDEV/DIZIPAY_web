import type { AxiosInstance } from 'axios';
import type { LoginCredentials, MerchantSession } from '../../domain/entities/MerchantSession';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';

interface LoginResponseDto {
  access_token: string;
  token_type: 'Bearer' | string;
  merchantId?: string;
}

export class HttpAuthRepository implements IAuthRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async login(credentials: LoginCredentials): Promise<MerchantSession> {
    const { data } = await this.http.post<LoginResponseDto>('/auth/login', credentials);
    if (!data.merchantId) {
      throw new Error('Ce compte n’est pas associé à un marchand.');
    }
    return {
      accessToken: data.access_token,
      tokenType: 'Bearer',
      merchantId: data.merchantId,
    };
  }
}
