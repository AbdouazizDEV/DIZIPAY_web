import type { PaymentProvider } from '../../domain/entities/PaymentProvider';

export interface PaymentProviderViewModel {
  type: PaymentProvider['type'];
  label: string;
  available: boolean;
  reason?: string;
  shortLabel: string;
}

export function toPaymentProviderViewModel(
  provider: PaymentProvider,
): PaymentProviderViewModel {
  const shortLabel =
    provider.type === 'PSPI'
      ? 'PI-SPI'
      : provider.type === 'WAVE'
        ? 'Wave'
        : provider.type;

  return {
    type: provider.type,
    label: provider.label,
    available: provider.available,
    reason: provider.reason,
    shortLabel,
  };
}
