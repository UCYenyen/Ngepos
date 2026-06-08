import { createServerClient, createAdminClient } from '@/lib/supabase';
import { canViewReports } from '@/lib/permissions';
import { transactionsToCsv, type CsvTransactionRow } from '@/lib/export/csv';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface ExportTransactionRow {
  id: string;
  cashier_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
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
    const format = request.nextUrl.searchParams.get('format') ?? 'csv';

    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!canViewReports(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single();

    const businessName = business?.name ?? 'Unknown';

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        'id, cashier_id, subtotal, discount_amount, tax_amount, total, payment_method, payment_status, created_at'
      )
      .eq('business_id', businessId)
      .eq('payment_status', 'paid')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (transactionsError) throw transactionsError;

    const typedTransactions = (transactions as unknown as ExportTransactionRow[]) ?? [];

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

    const rows: CsvTransactionRow[] = typedTransactions.map((txn) => ({
      id: txn.id,
      created_at: txn.created_at,
      cashier_name: cashierNames.get(txn.cashier_id) ?? 'Unknown',
      payment_method: txn.payment_method,
      payment_status: txn.payment_status,
      subtotal: txn.subtotal,
      discount_amount: txn.discount_amount,
      tax_amount: txn.tax_amount,
      total: txn.total,
    }));

    if (format === 'json') {
      return NextResponse.json({ businessName, rows });
    }

    const csv = transactionsToCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transactions-${start.slice(0, 10)}-to-${end.slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
