import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HttpPaymentLinkRepository } from './HttpPaymentLinkRepository';

describe('HttpPaymentLinkRepository', () => {
  const post = vi.fn();
  const get = vi.fn();
  const http = { post, get } as unknown as ConstructorParameters<
    typeof HttpPaymentLinkRepository
  >[0];

  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it('creates a payment link via POST /payment-links', async () => {
    const payload = {
      id: '1',
      token: 'tok',
      url: 'http://localhost:5173/pay/tok',
      amount: 150000,
      currency: 'XOF',
      description: 'Demo',
      status: 'ACTIVE',
      expiresAt: null,
      paidAt: null,
      transactionId: null,
      qrPayload: 'EMV',
      createdAt: new Date().toISOString(),
    };
    post.mockResolvedValue({ data: payload });

    const repo = new HttpPaymentLinkRepository(http);
    const result = await repo.create({
      amount: 150000,
      description: 'Demo',
      includeSvg: true,
    });

    expect(post).toHaveBeenCalledWith('/payment-links', {
      amount: 150000,
      description: 'Demo',
      includeSvg: true,
    });
    expect(result.token).toBe('tok');
  });

  it('fetches public link via GET /payment-links/:token', async () => {
    get.mockResolvedValue({
      data: {
        token: 'tok',
        amount: 100,
        currency: 'XOF',
        description: null,
        status: 'ACTIVE',
        expiresAt: null,
        paidAt: null,
        merchantName: 'Demo',
        qrPayload: null,
        url: 'http://localhost:5173/pay/tok',
      },
    });

    const repo = new HttpPaymentLinkRepository(http);
    const result = await repo.getPublic('tok');
    expect(get).toHaveBeenCalledWith('/payment-links/tok');
    expect(result.merchantName).toBe('Demo');
  });
});
