import { ApiError } from '../../domain/errors/ApiError';
import { toFriendlyUserMessage } from './userMessages';

export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof ApiError) {
    if (error.isServiceUnavailable) {
      return toFriendlyUserMessage(
        error.message,
        'Ce service est temporairement indisponible. Réessayez dans un instant.',
      );
    }
    if (error.isBadRequest) {
      return toFriendlyUserMessage(
        error.message,
        'Vérifiez les informations saisies, puis réessayez.',
      );
    }
    if (error.isUnauthorized) {
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    }
    if (error.isNotFound) {
      return toFriendlyUserMessage(error.message, 'Élément introuvable.');
    }
    if (error.isServerError) {
      return toFriendlyUserMessage(
        error.message,
        'Un problème est survenu. Réessayez plus tard.',
      );
    }
    return toFriendlyUserMessage(error.message, fallback);
  }
  if (error instanceof Error && error.message) {
    return toFriendlyUserMessage(error.message, fallback);
  }
  return fallback;
}
