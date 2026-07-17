import { ApiError } from '../../domain/errors/ApiError';

export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof ApiError) {
    if (error.isServiceUnavailable) {
      return error.message || 'Service temporairement indisponible.';
    }
    if (error.isBadRequest) {
      return error.message || 'Données invalides.';
    }
    if (error.isServerError) {
      return error.message || 'Erreur serveur. Réessayez plus tard.';
    }
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
