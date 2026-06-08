export interface CsvTransactionRow {
  id: string;
  created_at: string;
  cashier_name: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}

export function transactionsToCsv(rows: CsvTransactionRow[]): string {
  const header = [
    'Transaction ID',
    'Date',
    'Cashier',
    'Payment Method',
    'Status',
    'Subtotal',
    'Discount',
    'Tax',
    'Total',
  ];
  const escape = (value: string): string =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const lines = rows.map((r) =>
    [
      r.id,
      r.created_at,
      r.cashier_name,
      r.payment_method,
      r.payment_status,
      String(r.subtotal),
      String(r.discount_amount),
      String(r.tax_amount),
      String(r.total),
    ]
      .map(escape)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
