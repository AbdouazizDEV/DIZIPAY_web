export interface MerchantSession {
  accessToken: string;
  tokenType: 'Bearer';
  merchantId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
