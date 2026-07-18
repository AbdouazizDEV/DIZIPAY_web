import type { PaymentProvider } from '../../domain/entities/PaymentProvider';
import { toFriendlyProviderReason } from '../../shared/utils/userMessages';

export interface PaymentProviderViewModel {
  type: PaymentProvider['type'];
  label: string;
  available: boolean;
  reason?: string;
  shortLabel: string;
  logoSrc?: string;
  logoAlt: string;
}

const PROVIDER_LOGOS: Record<string, { src: string; alt: string; shortLabel: string; label: string }> =
  {
    PSPI: {
      src: '/icons/PISPI.webp',
      alt: 'PI-SPI',
      shortLabel: 'PI-SPI',
      label: 'Interopérable UEMOA',
    },
    WAVE: {
      src: '/icons/wave-mobile-money-logo.webp',
      alt: 'Wave',
      shortLabel: 'Wave',
      label: 'Mobile money',
    },
  };

export function toPaymentProviderViewModel(
  provider: PaymentProvider,
): PaymentProviderViewModel {
  const meta = PROVIDER_LOGOS[provider.type];
  const shortLabel = meta?.shortLabel ?? provider.type;
  const label = meta?.label ?? provider.label;

  return {
    type: provider.type,
    label,
    available: provider.available,
    reason: toFriendlyProviderReason(provider.type, provider.reason),
    shortLabel,
    logoSrc: meta?.src,
    logoAlt: meta?.alt ?? shortLabel,
  };
}
