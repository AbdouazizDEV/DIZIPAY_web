import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import type { CreatePayoutInput } from '../../domain/entities/Payout';
import { getServices } from '../../infrastructure/repositories/container';
import { xofToCents } from '../../shared/utils/money';

const baseFields = {
  debitAccount: z.string().min(4, 'Compte de débit requis'),
  holderName: z.string().min(2, 'Nom du bénéficiaire requis').max(120),
  amountXof: z
    .number({ error: 'Montant requis' })
    .positive('Montant requis')
    .max(50_000_000, 'Montant trop élevé'),
  reference: z.string().min(8, 'Référence : 8 caractères minimum').max(64),
  description: z.string().max(200).optional(),
};

export const mobileMoneyPayoutSchema = z.object({
  accountType: z.literal('MOBILE_MONEY'),
  ...baseFields,
  pispiAccountId: z.string().min(4, 'Identifiant PI-SPI requis'),
  phoneNumber: z
    .string()
    .min(8, 'Téléphone requis')
    .max(32)
    .regex(/^\+?[0-9\s-]{8,32}$/, 'Format téléphone invalide'),
});

export const bankAccountPayoutSchema = z.object({
  accountType: z.literal('BANK_ACCOUNT'),
  ...baseFields,
  iban: z.string().min(15, 'IBAN invalide').max(34),
  bic: z.string().max(11).optional(),
  countryCode: z
    .string()
    .length(2, 'Code pays sur 2 lettres')
    .optional()
    .or(z.literal('')),
});

export const createPayoutFormSchema = z.discriminatedUnion('accountType', [
  mobileMoneyPayoutSchema,
  bankAccountPayoutSchema,
]);

export type CreatePayoutFormValues = z.infer<typeof createPayoutFormSchema>;

export function formValuesToPayoutInput(
  values: CreatePayoutFormValues,
): CreatePayoutInput {
  const amount = xofToCents(values.amountXof);
  const description = values.description?.trim() || undefined;

  if (values.accountType === 'MOBILE_MONEY') {
    return {
      accountType: 'MOBILE_MONEY',
      debitAccount: values.debitAccount.trim(),
      pispiAccountId: values.pispiAccountId.trim(),
      holderName: values.holderName.trim(),
      phoneNumber: values.phoneNumber.replace(/\s+/g, ''),
      amount,
      currency: 'XOF',
      reference: values.reference.trim(),
      description,
    };
  }

  return {
    accountType: 'BANK_ACCOUNT',
    debitAccount: values.debitAccount.trim(),
    iban: values.iban.replace(/\s+/g, '').toUpperCase(),
    holderName: values.holderName.trim(),
    bic: values.bic?.trim() || undefined,
    countryCode: values.countryCode?.trim().toUpperCase() || undefined,
    amount,
    currency: 'XOF',
    reference: values.reference.trim(),
    description,
  };
}

export function generatePayoutReference(prefix = 'OUT'): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${stamp}`;
}

export function useCreatePayout() {
  const { payoutRepository } = getServices();

  return useMutation({
    mutationFn: (input: CreatePayoutInput) => payoutRepository.create(input),
  });
}
