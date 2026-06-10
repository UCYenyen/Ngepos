'use server';

import { createAdminClient } from '@/lib/supabase';
import { getBusinessPlanFeatures } from '@/lib/auth';
import { validateCheckout } from '@/validations/storefront';
import type { OnlineOrderItem } from '@/types/storefront';

interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function placeOrder(
  subdomain: string,
  payload: unknown
): Promise<PlaceOrderResult> {
  const validation = validateCheckout(payload);
  if (!validation.success) {
    const firstError = Object.values(validation.errors).flat()[0];
    return { success: false, error: firstError ?? 'Data pesanan tidak valid' };
  }
  const input = validation.data;

  const admin = createAdminClient();

  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('subdomain', subdomain)
    .maybeSingle<{ id: string }>();

  if (!business) {
    return { success: false, error: 'Storefront tidak ditemukan' };
  }

  const features = await getBusinessPlanFeatures(business.id);
  if (!features.onlineStore) {
    return { success: false, error: 'Storefront sedang tidak aktif' };
  }

  const productIds = [...new Set(input.items.map((item) => item.product_id))];
  const { data: products } = await admin
    .from('products')
    .select('id, name, price, has_variants')
    .eq('business_id', business.id)
    .in('id', productIds);

  const { data: variants } = await admin
    .from('product_variants')
    .select('id, product_id, name, price_modifier')
    .in('product_id', productIds);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

  const items: OnlineOrderItem[] = [];
  for (const line of input.items) {
    const product = productMap.get(line.product_id);
    if (!product) {
      return { success: false, error: 'Sebagian produk sudah tidak tersedia' };
    }

    let unitPrice = Number(product.price);
    let variantId: string | null = null;
    let variantName: string | null = null;

    if (line.variant_id) {
      const variant = variantMap.get(line.variant_id);
      if (!variant || variant.product_id !== product.id) {
        return { success: false, error: 'Varian produk tidak valid' };
      }
      unitPrice += Number(variant.price_modifier);
      variantId = variant.id;
      variantName = variant.name;
    }

    items.push({
      product_id: product.id,
      name: product.name,
      variant_id: variantId,
      variant_name: variantName,
      qty: line.qty,
      unit_price: unitPrice,
      line_total: unitPrice * line.qty,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);

  const { data: order, error } = await admin
    .from('online_orders')
    .insert({
      business_id: business.id,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      items,
      subtotal,
      total: subtotal,
      note: input.note ?? null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !order) {
    return { success: false, error: 'Gagal menyimpan pesanan. Coba lagi.' };
  }

  return { success: true, orderId: order.id };
}
