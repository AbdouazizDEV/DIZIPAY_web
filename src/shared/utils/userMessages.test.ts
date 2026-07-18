import { describe, expect, it } from 'vitest';
import {
  toFriendlyPayInstructions,
  toFriendlyProviderReason,
  toFriendlyUserMessage,
} from './userMessages';

describe('userMessages', () => {
  it('remplaces les instructions API techniques sous le QR', () => {
    const raw =
      'Scannez le QR avec Wave, Orange Money, Free Money ou une app PI-SPI, ou utilisez POST /payment-links/:token/pay avec votre téléphone / QR wallet.';
    const friendly = toFriendlyPayInstructions(raw);
    expect(friendly).not.toMatch(/POST/i);
    expect(friendly).not.toMatch(/payment-links/i);
    expect(friendly.toLowerCase()).toMatch(/scannez|numéro/);
  });

  it('fournit une instruction par défaut si vide', () => {
    expect(toFriendlyPayInstructions(null)).toMatch(/Scannez/);
  });

  it('humanise la raison Wave indisponible', () => {
    const reason = toFriendlyProviderReason(
      'WAVE',
      "Le fournisseur Wave n'est pas encore disponible.",
    );
    expect(reason).toMatch(/Wave/);
    expect(reason).not.toMatch(/POST/i);
  });

  it('masque les messages d’erreur techniques', () => {
    expect(toFriendlyUserMessage('POST /payment-links/abc/pay failed')).toMatch(
      /réessayer|erreur/i,
    );
  });
});
