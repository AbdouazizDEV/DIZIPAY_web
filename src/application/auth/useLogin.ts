import { useMutation } from '@tanstack/react-query';
import type { LoginCredentials, MerchantSession } from '../../domain/entities/MerchantSession';
import { getServices } from '../../infrastructure/repositories/container';

export function useLogin(onSuccess?: (session: MerchantSession) => void) {
  const { authRepository } = getServices();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authRepository.login(credentials),
    onSuccess: (session) => {
      onSuccess?.(session);
    },
  });
}
