import { Resend } from 'resend';
import type { InventoryProduct } from '@/types/inventory';

interface SendLowStockAlertParams {
  to: string;
  businessName: string;
  products: InventoryProduct[];
}

interface SendLowStockAlertResult {
  sent: boolean;
  reason?: string;
}

function buildProductRows(products: InventoryProduct[]): string {
  return products
    .map(
      (product) =>
        `<li>${product.name}: ${product.current_stock} left (threshold ${product.low_stock_threshold ?? 'n/a'})</li>`
    )
    .join('');
}

function buildProductLines(products: InventoryProduct[]): string {
  return products
    .map(
      (product) =>
        `- ${product.name}: ${product.current_stock} left (threshold ${product.low_stock_threshold ?? 'n/a'})`
    )
    .join('\n');
}

export async function sendLowStockAlert(
  params: SendLowStockAlertParams
): Promise<SendLowStockAlertResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured; skipping low-stock alert email.');
    return { sent: false, reason: 'email_not_configured' };
  }

  if (params.products.length === 0) {
    return { sent: false, reason: 'no_products' };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@ngepos.com';
  const subject = `Low stock alert: ${params.businessName}`;
  const html = `<p>The following products are at or below their low-stock threshold for <strong>${params.businessName}</strong>:</p><ul>${buildProductRows(params.products)}</ul>`;
  const text = `The following products are at or below their low-stock threshold for ${params.businessName}:\n\n${buildProductLines(params.products)}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html,
      text,
    });

    if (error) {
      return { sent: false, reason: error.message };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : 'send_failed' };
  }
}
