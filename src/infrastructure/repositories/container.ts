import type { AxiosInstance } from 'axios';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { IPaymentLinkRepository } from '../../domain/repositories/IPaymentLinkRepository';
import { createHttpClient } from '../http/httpClient';
import { HttpAuthRepository } from './HttpAuthRepository';
import { HttpPaymentLinkRepository } from './HttpPaymentLinkRepository';
import {
  sessionStorageAdapter,
  type ISessionStorage,
} from '../storage/sessionStorage';

export interface AppServices {
  http: AxiosInstance;
  sessionStorage: ISessionStorage;
  authRepository: IAuthRepository;
  paymentLinkRepository: IPaymentLinkRepository;
}

let services: AppServices | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getServices(): AppServices {
  if (!services) {
    const sessionStorage = sessionStorageAdapter;
    const http = createHttpClient({
      sessionStorage,
      onUnauthorized: () => unauthorizedHandler?.(),
    });
    services = {
      http,
      sessionStorage,
      authRepository: new HttpAuthRepository(http),
      paymentLinkRepository: new HttpPaymentLinkRepository(http),
    };
  }
  return services;
}

/** Pour les tests : injecter des mocks. */
export function setServicesForTesting(next: AppServices | null): void {
  services = next;
}
