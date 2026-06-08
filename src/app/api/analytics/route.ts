import { createServerClient, createAdminClient } from '@/lib/supabase';
import { canViewAnalytics } from '@/lib/permissions';
import { getBusinessPlanFeatures } from '@/lib/auth';
import {
  computeDashboardMetrics,
  type AnalyticsTransactionRow,
  type AnalyticsItemRow,
} from '@/lib/analytics';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionItemRow {
  product_id: string;
  name: string;
  quantity: number;
  subtotal: number;
  products: {
    category_id: string | null;
    categories: { name: string } | null;
  } | null;
}

interface TransactionWithItems {
  id: string;
  cashier_id: string;
  total: number;
  payment_method: 'cash' | 'qris' | 'gateway';
  created_at: string;
  transaction_items: TransactionItemRow[];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const start = request.nextUrl.searchParams.get('start') ?? startOfMonth.toISOString();
    const end = request.nextUrl.searchParams.get('end') ?? now.toISOString();

    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!canViewAnalytics(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const features = await getBusinessPlanFeatures(businessId);
    if (!features.analytics) {
      return NextResponse.json({ error: 'Analytics requires the Pro plan' }, { status: 403 });
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        'id, cashier_id, total, payment_method, created_at, transaction_items(product_id, name, quantity, subtotal, products(category_id, categories(name)))'
      )
      .eq('business_id', businessId)
      .eq('payment_status', 'paid')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (transactionsError) throw transactionsError;

    const typedTransactions = (transactions as unknown as TransactionWithItems[]) ?? [];

    const admin = createAdminClient();
    const cashierIds = [...new Set(typedTransactions.map((txn) => txn.cashier_id))];
    const cashierNames = new Map<string, string>();

    for (const cashierId of cashierIds) {
      try {
        const { data: authData } = await admin.auth.admin.getUserById(cashierId);
        const authUser = authData?.user;
        cashierNames.set(
          cashierId,
          authUser?.user_metadata?.name ?? authUser?.email ?? 'Unknown'
        );
      } catch {
        cashierNames.set(cashierId, 'Unknown');
      }
    }

    const rows: AnalyticsTransactionRow[] = typedTransactions.map((txn) => ({
      id: txn.id,
      cashier_id: txn.cashier_id,
      cashier_name: cashierNames.get(txn.cashier_id) ?? 'Unknown',
      total: txn.total,
      payment_method: txn.payment_method,
      created_at: txn.created_at,
      items: txn.transaction_items.map(
        (item): AnalyticsItemRow => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          subtotal: item.subtotal,
          category_id: item.products?.category_id ?? null,
          category_name: item.products?.categories?.name ?? null,
        })
      ),
    }));

    const metrics = computeDashboardMetrics(rows);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
