const XENDIT_INVOICE_API = 'https://api.xendit.co/v2/invoices';
const XENDIT_BALANCE_API = 'https://api.xendit.co/balance';

function basicAuth(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

export interface XenditInvoice {
  id: string;
  externalId: string;
  invoiceUrl: string;
  status: string;
}

export interface CreateXenditInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export function isXenditConfigured(): boolean {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

// Validates a Xendit secret key by calling the balance endpoint. Used when a
// business connects its own account so we never store a key that won't work.
export async function validateXenditKey(secretKey: string): Promise<boolean> {
  try {
    const response = await fetch(XENDIT_BALANCE_API, {
      headers: { Authorization: basicAuth(secretKey) },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function createXenditInvoice(
  params: CreateXenditInvoiceParams,
  secretKeyOverride?: string
): Promise<XenditInvoice> {
  const secretKey = secretKeyOverride ?? process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    throw new Error('XENDIT_SECRET_KEY is not configured');
  }

  const response = await fetch(XENDIT_INVOICE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(secretKey),
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      currency: 'IDR',
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Xendit invoice creation failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    id: string;
    external_id: string;
    invoice_url: string;
    status: string;
  };

  return {
    id: data.id,
    externalId: data.external_id,
    invoiceUrl: data.invoice_url,
    status: data.status,
  };
}

// Looks up an invoice by the external_id we generated. Returns its Xendit
// status (PAID / SETTLED / PENDING / EXPIRED) or null. Outbound call, so it
// works from localhost where the inbound webhook can't reach the app.
export async function getXenditInvoiceStatus(
  externalId: string,
  secretKeyOverride?: string
): Promise<string | null> {
  const secretKey = secretKeyOverride ?? process.env.XENDIT_SECRET_KEY;
  if (!secretKey) return null;

  const response = await fetch(
    `${XENDIT_INVOICE_API}?external_id=${encodeURIComponent(externalId)}`,
    { headers: { Authorization: basicAuth(secretKey) } }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as Array<{ status?: string }>;
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0].status ?? null;
}
