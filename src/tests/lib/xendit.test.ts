import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createXenditInvoice,
  getXenditInvoiceStatus,
  isXenditConfigured,
} from '@/lib/xendit';

const params = {
  externalId: 'sub-1',
  amount: 149000,
  payerEmail: 'a@b.com',
  description: 'Langganan Ngepos pro (monthly)',
  successRedirectUrl: 'https://app/billing?payment=success',
  failureRedirectUrl: 'https://app/billing?payment=failed',
};

describe('xendit helper', () => {
  const original = process.env.XENDIT_SECRET_KEY;
  afterEach(() => {
    process.env.XENDIT_SECRET_KEY = original;
    vi.restoreAllMocks();
  });

  it('isXenditConfigured reflects the env var', () => {
    process.env.XENDIT_SECRET_KEY = '';
    expect(isXenditConfigured()).toBe(false);
    process.env.XENDIT_SECRET_KEY = 'xnd_test_123';
    expect(isXenditConfigured()).toBe(true);
  });

  it('throws when the secret key is not configured', async () => {
    process.env.XENDIT_SECRET_KEY = '';
    await expect(createXenditInvoice(params)).rejects.toThrow(/not configured/i);
  });

  it('posts to the invoice API with basic auth and maps the response', async () => {
    process.env.XENDIT_SECRET_KEY = 'xnd_test_abc';
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'inv1',
            external_id: 'sub-1',
            invoice_url: 'https://checkout.xendit.co/x',
            status: 'PENDING',
          }),
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createXenditInvoice(params);

    expect(result).toEqual({
      id: 'inv1',
      externalId: 'sub-1',
      invoiceUrl: 'https://checkout.xendit.co/x',
      status: 'PENDING',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/v2/invoices');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toMatch(/^Basic /);
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.external_id).toBe('sub-1');
    expect(sentBody.amount).toBe(149000);
    expect(sentBody.currency).toBe('IDR');
  });

  it('throws on a non-ok response', async () => {
    process.env.XENDIT_SECRET_KEY = 'xnd_test_abc';
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 400, text: () => Promise.resolve('bad') })
    ) as unknown as typeof fetch;

    await expect(createXenditInvoice(params)).rejects.toThrow(/400/);
  });

  it('getXenditInvoiceStatus returns the first invoice status', async () => {
    process.env.XENDIT_SECRET_KEY = 'xnd_test_abc';
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ status: 'PAID' }]),
      })
    ) as unknown as typeof fetch;

    await expect(getXenditInvoiceStatus('sub-1')).resolves.toBe('PAID');
  });

  it('getXenditInvoiceStatus returns null when not configured or empty', async () => {
    process.env.XENDIT_SECRET_KEY = '';
    await expect(getXenditInvoiceStatus('sub-1')).resolves.toBeNull();

    process.env.XENDIT_SECRET_KEY = 'xnd_test_abc';
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    ) as unknown as typeof fetch;
    await expect(getXenditInvoiceStatus('sub-1')).resolves.toBeNull();
  });
});
