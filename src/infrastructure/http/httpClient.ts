import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError } from '../../domain/errors/ApiError';
import { env } from '../../shared/config/env';
import type { ISessionStorage } from '../storage/sessionStorage';

type UnauthorizedHandler = () => void;

export interface HttpClientDeps {
  sessionStorage: ISessionStorage;
  onUnauthorized?: UnauthorizedHandler;
}

function extractMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  if (Array.isArray(record.message)) return record.message.join(', ');
  if (typeof record.error === 'string') return record.error;
  return fallback;
}

function extractCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  if (typeof record.code === 'string') return record.code;
  if (typeof record.error === 'string' && record.error.includes('Error')) {
    return record.error;
  }
  if (typeof record.name === 'string') return record.name;
  return undefined;
}

export function createHttpClient(deps: HttpClientDeps): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 30_000,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const session = deps.sessionStorage.get();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;
      const message = extractMessage(
        error.response?.data,
        error.message || 'Erreur réseau',
      );

      if (status === 401) {
        deps.onUnauthorized?.();
      }

      throw new ApiError(
        message,
        status,
        extractCode(error.response?.data),
        error.response?.data,
      );
    },
  );

  return client;
}
