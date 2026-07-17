/** Convertit un montant saisi en XOF (unités) vers les centimes API. */
export function xofToCents(xof: number): number {
  if (!Number.isFinite(xof) || xof < 0) {
    throw new RangeError('Montant XOF invalide');
  }
  return Math.round(xof * 100);
}

/** Convertit des centimes API vers XOF (unités). */
export function centsToXof(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new RangeError('Montant en centimes invalide');
  }
  return cents / 100;
}

/**
 * Formate un montant API (centimes XOF) pour l’affichage.
 * Intl XOF n’affiche souvent pas de décimales ; on formate depuis les unités.
 */
export function formatXofFromCents(cents: number): string {
  const units = centsToXof(cents);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(units);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
