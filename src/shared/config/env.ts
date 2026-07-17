const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';
const appName = import.meta.env.VITE_APP_NAME ?? 'DiziPay';

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  appName,
} as const;
