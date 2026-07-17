/**
 * Stockage du JWT marchand.
 *
 * Stratégie : mémoire (AuthProvider) + sessionStorage pour survivre au refresh
 * d’onglet sans persister après fermeture du navigateur (évite localStorage longue durée).
 */
const TOKEN_KEY = 'dizipay.merchant.session';

export interface StoredSession {
  accessToken: string;
  tokenType: 'Bearer';
  merchantId: string;
}

export interface ISessionStorage {
  get(): StoredSession | null;
  set(session: StoredSession): void;
  clear(): void;
}

export class SessionStorageAdapter implements ISessionStorage {
  get(): StoredSession | null {
    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed.accessToken || !parsed.merchantId) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  set(session: StoredSession): void {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export const sessionStorageAdapter = new SessionStorageAdapter();
