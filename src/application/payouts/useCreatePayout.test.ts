import { describe, expect, it } from 'vitest';
import { toPaymentProviderViewModel } from '../../application/mappers/paymentProviderMapper';
import {
  createPayoutFormSchema,
  formValuesToPayoutInput,
} from '../../application/payouts/useCreatePayout';

describe('paymentProviderMapper', () => {
  it('maps available PSPI provider', () => {
    const vm = toPaymentProviderViewModel({
      type: 'PSPI',
      label: 'PI-SPI (interopérable UEMOA)',
      available: true,
    });
    expect(vm.shortLabel).toBe('PI-SPI');
    expect(vm.available).toBe(true);
  });

  it('maps unavailable Wave with reason', () => {
    const vm = toPaymentProviderViewModel({
      type: 'WAVE',
      label: 'Wave',
      available: false,
      reason: "Le fournisseur Wave n'est pas encore disponible.",
    });
    expect(vm.shortLabel).toBe('Wave');
    expect(vm.available).toBe(false);
    expect(vm.logoSrc).toContain('wave');
    expect(vm.reason).toMatch(/Wave/);
    expect(vm.reason).not.toMatch(/POST/i);
  });

  it('maps PSPI with logo', () => {
    const vm = toPaymentProviderViewModel({
      type: 'PSPI',
      label: 'PI-SPI (interopérable UEMOA)',
      available: true,
    });
    expect(vm.logoSrc).toContain('PISPI');
    expect(vm.shortLabel).toBe('PI-SPI');
  });
});

describe('createPayoutFormSchema', () => {
  it('accepts MOBILE_MONEY payload', () => {
    const parsed = createPayoutFormSchema.parse({
      accountType: 'MOBILE_MONEY',
      debitAccount: '10188672388920614979',
      pispiAccountId: '10188672388920614979',
      holderName: 'Amadou Diop',
      phoneNumber: '+221771234567',
      amountXof: 50,
      reference: 'OUT-MM-001234',
      description: 'Virement client',
    });
    expect(parsed.accountType).toBe('MOBILE_MONEY');
    const input = formValuesToPayoutInput(parsed);
    expect(input.accountType).toBe('MOBILE_MONEY');
    expect(input.amount).toBe(5000);
    if (input.accountType === 'MOBILE_MONEY') {
      expect(input.phoneNumber).toBe('+221771234567');
    }
  });

  it('accepts BANK_ACCOUNT payload and normalizes IBAN', () => {
    const parsed = createPayoutFormSchema.parse({
      accountType: 'BANK_ACCOUNT',
      debitAccount: '10188672388920614979',
      iban: 'FR76 3000 6000 0112 3456 7890 189',
      holderName: 'Société SA',
      bic: 'BNPAFRPP',
      countryCode: 'fr',
      amountXof: 250,
      reference: 'OUT-BANK-001234',
    });
    const input = formValuesToPayoutInput(parsed);
    expect(input.accountType).toBe('BANK_ACCOUNT');
    expect(input.amount).toBe(25000);
    if (input.accountType === 'BANK_ACCOUNT') {
      expect(input.iban).toBe('FR7630006000011234567890189');
      expect(input.countryCode).toBe('FR');
    }
  });

  it('rejects short reference', () => {
    const result = createPayoutFormSchema.safeParse({
      accountType: 'MOBILE_MONEY',
      debitAccount: '10188672388920614979',
      pispiAccountId: '10188672388920614979',
      holderName: 'Amadou',
      phoneNumber: '+221771234567',
      amountXof: 10,
      reference: 'SHORT',
    });
    expect(result.success).toBe(false);
  });
});
