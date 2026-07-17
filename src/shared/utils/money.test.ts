import { describe, expect, it } from 'vitest';
import { centsToXof, formatXofFromCents, xofToCents } from './money';
import {
  summarizeLinks,
  toPaymentLinkViewModel,
  toPublicPaymentLinkViewModel,
} from '../../application/mappers/paymentLinkMapper';
import type { PaymentLink, PublicPaymentLink } from '../../domain/entities/PaymentLink';
import { PaymentLinkStatus } from '../../domain/entities/PaymentLink';

describe('money mappers', () => {
  it('converts XOF units to API cents', () => {
    expect(xofToCents(1500)).toBe(150000);
    expect(xofToCents(0.5)).toBe(50);
  });

  it('converts cents to XOF units', () => {
    expect(centsToXof(150000)).toBe(1500);
  });

  it('formats cents as fr-FR XOF currency', () => {
    const label = formatXofFromCents(150000);
    expect(label).toMatch(/1[\s\u202f]?500/);
    expect(label.toUpperCase()).toMatch(/XOF|F\s?CFA|FCA/);
  });
});

describe('paymentLinkMapper', () => {
  const baseLink: PaymentLink = {
    id: '1',
    token: 'abc',
    url: 'http://localhost:5173/pay/abc',
    amount: 250000,
    currency: 'XOF',
    description: 'Test',
    status: PaymentLinkStatus.ACTIVE,
    expiresAt: '2026-07-14T10:00:00.000Z',
    paidAt: null,
    transactionId: 'tx-1',
    qrPayload: '000201',
    createdAt: '2026-07-13T10:00:00.000Z',
  };

  it('maps merchant link to view model', () => {
    const vm = toPaymentLinkViewModel(baseLink);
    expect(vm.amountCents).toBe(250000);
    expect(vm.isActive).toBe(true);
    expect(vm.canCancel).toBe(true);
    expect(vm.statusLabel).toBe('Actif');
    expect(vm.amountLabel).toMatch(/2[\s\u202f]?500/);
  });

  it('maps public link to view model', () => {
    const publicLink: PublicPaymentLink = {
      token: 'abc',
      amount: 250000,
      currency: 'XOF',
      description: null,
      status: PaymentLinkStatus.ACTIVE,
      expiresAt: null,
      paidAt: null,
      merchantName: 'Pharmacie Demo',
      qrPayload: '000201',
      url: 'http://localhost:5173/pay/abc',
    };
    const vm = toPublicPaymentLinkViewModel(publicLink);
    expect(vm.merchantName).toBe('Pharmacie Demo');
    expect(vm.description).toBe('');
    expect(vm.isPayable).toBe(true);
  });

  it('summarizes statuses', () => {
    const summary = summarizeLinks([
      baseLink,
      { ...baseLink, id: '2', status: PaymentLinkStatus.PAID },
      { ...baseLink, id: '3', status: PaymentLinkStatus.EXPIRED },
    ]);
    expect(summary).toEqual({
      active: 1,
      paid: 1,
      expired: 1,
      cancelled: 0,
      total: 3,
    });
  });
});
