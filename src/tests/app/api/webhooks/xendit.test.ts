import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Shared chainable Supabase query-builder mock. Every method returns the builder
// so the route's `.from().update().eq().eq().select().maybeSingle()` chains work.
const h = vi.hoisted(() => {
  const builder = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const admin = { from: vi.fn(() => builder) };
  return { builder, admin };
});

vi.mock('@/lib/supabase', () => ({
  createAdminClient: () => h.admin,
}));

process.env.XENDIT_CALLBACK_TOKEN = 'test-token';

async function callWebhook(payload: Record<string, unknown>) {
  const { POST } = await import('@/app/api/webhooks/xendit/route');
  const request = new Request('http://localhost/api/webhooks/xendit', {
    method: 'POST',
    headers: {
      'x-callback-token': 'test-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return POST(request as unknown as NextRequest);
}

describe('Xendit subscription webhook — initial checkout invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.builder.select.mockReturnValue(h.builder);
    h.builder.update.mockReturnValue(h.builder);
    h.builder.insert.mockReturnValue(h.builder);
    h.builder.eq.mockReturnValue(h.builder);
    // No renewal match, and the guarded update matches no 'pending' row.
    h.builder.maybeSingle.mockResolvedValue({ data: null });
  });

  it('guards the EXPIRED downgrade to pending rows only (never cancels an active sub)', async () => {
    await callWebhook({ external_id: 'sub-abc', status: 'EXPIRED' });

    expect(h.builder.update).toHaveBeenCalledWith({ status: 'cancelled' });
    const eqCalls = h.builder.eq.mock.calls;
    expect(eqCalls).toContainEqual(['payment_reference', 'sub-abc']);
    // The fix: the cancel can only ever hit a still-'pending' checkout.
    expect(eqCalls).toContainEqual(['status', 'pending']);
  });

  it('ignores a PENDING callback entirely (no status write)', async () => {
    await callWebhook({ external_id: 'sub-abc', status: 'PENDING' });
    expect(h.builder.update).not.toHaveBeenCalled();
  });

  it('activates on PAID, still guarded to a pending checkout', async () => {
    await callWebhook({ external_id: 'sub-abc', status: 'PAID' });

    expect(h.builder.update).toHaveBeenCalledWith({ status: 'active' });
    expect(h.builder.eq.mock.calls).toContainEqual(['status', 'pending']);
  });
});
