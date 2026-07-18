/**
 * Rend les messages API / backend compréhensibles pour l’utilisateur final.
 * Masque les détails techniques (endpoints, JWT, codes internes, etc.).
 */

const FRIENDLY_PAY_INSTRUCTIONS =
  'Scannez le QR avec votre application de paiement (Wave, Orange Money, Free Money ou PI-SPI), ou payez avec votre numéro ci-dessous.';

const TECHNICAL_PATTERNS: RegExp[] = [
  /\bPOST\s*\/[^\s]+/i,
  /\bGET\s*\/[^\s]+/i,
  /\bPUT\s*\/[^\s]+/i,
  /\bDELETE\s*\/[^\s]+/i,
  /\/payment-links\//i,
  /\/api\/v\d+/i,
  /\bJWT\b/i,
  /\bBearer\b/i,
  /\bHttpException\b/i,
  /\bException\b/,
  /\bstack\b/i,
  /\bECONNREFUSED\b/i,
  /\bENOENT\b/i,
  /paymentProvider/i,
  /PaymentProviderUnavailable/i,
  /PayoutAccountValidation/i,
  /\{[^}]*"[a-zA-Z]+":/,
];

const KNOWN_REPLACEMENTS: Array<{ match: RegExp; message: string }> = [
  {
    match: /wave.*pas encore disponible|fournisseur wave/i,
    message: 'Wave n’est pas encore disponible. Choisissez PI-SPI pour continuer.',
  },
  {
    match: /iban/i,
    message: 'Vérifiez l’IBAN saisi, puis réessayez.',
  },
  {
    match: /alias|pispi/i,
    message: 'Vérifiez les informations du compte, puis réessayez.',
  },
  {
    match: /référence|reference.*unique|already exists/i,
    message: 'Cette référence existe déjà. Modifiez-la puis réessayez.',
  },
  {
    match: /expir/i,
    message: 'Ce lien a expiré. Demandez un nouveau lien au marchand.',
  },
  {
    match: /annul/i,
    message: 'Ce lien a été annulé. Demandez un nouveau lien au marchand.',
  },
  {
    match: /unauthorized|jwt|token.*invalide|non authentifié/i,
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
  },
  {
    match: /network|timeout|échec.*réseau|failed to fetch/i,
    message: 'Connexion impossible. Vérifiez votre réseau puis réessayez.',
  },
];

function looksTechnical(text: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(text));
}

/** Instructions affichées sous le QR (jamais le texte brut de l’API). */
export function toFriendlyPayInstructions(apiInstructions?: string | null): string {
  if (!apiInstructions?.trim()) return FRIENDLY_PAY_INSTRUCTIONS;
  if (looksTechnical(apiInstructions)) return FRIENDLY_PAY_INSTRUCTIONS;
  // Si l’API renvoie déjà un texte lisible (sans endpoint), on le garde.
  if (/scannez|scanne|application|wallet|téléphone|telephone/i.test(apiInstructions)) {
    // Nettoyer d’éventuelles mentions techniques en fin de phrase
    const cleaned = apiInstructions
      .replace(/,?\s*ou utilisez\s+POST\s+\/[^\s.]+[^.]*\.?/gi, '.')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (looksTechnical(cleaned) || cleaned.length < 12) return FRIENDLY_PAY_INSTRUCTIONS;
    return cleaned;
  }
  return FRIENDLY_PAY_INSTRUCTIONS;
}

/** Raison d’indisponibilité d’un fournisseur, côté client. */
export function toFriendlyProviderReason(
  type: string,
  reason?: string | null,
): string | undefined {
  const fallback =
    type === 'WAVE'
      ? 'Wave n’est pas encore disponible. Choisissez PI-SPI pour payer.'
      : 'Ce mode de paiement n’est pas disponible pour le moment.';

  if (!reason?.trim()) return type === 'WAVE' ? fallback : undefined;

  for (const { match, message } of KNOWN_REPLACEMENTS) {
    if (match.test(reason)) return message;
  }

  if (looksTechnical(reason)) return fallback;
  return reason.trim();
}

/** Message d’erreur utilisateur (toasts, formulaires, page publique). */
export function toFriendlyUserMessage(
  raw: string | null | undefined,
  fallback = 'Une erreur est survenue. Veuillez réessayer.',
): string {
  const text = raw?.trim();
  if (!text) return fallback;

  for (const { match, message } of KNOWN_REPLACEMENTS) {
    if (match.test(text)) return message;
  }

  if (looksTechnical(text)) return fallback;

  // Messages trop longs / jargon → raccourcir vers le fallback
  if (text.length > 180) return fallback;

  return text;
}

export { FRIENDLY_PAY_INSTRUCTIONS };
