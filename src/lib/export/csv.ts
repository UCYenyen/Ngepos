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

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = rows.map((row) =>
    row.map((value) => escapeCsvValue(String(value))).join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export function transactionsToCsv(rows: CsvTransactionRow[]): string {
  return toCsv(
    [
      'Transaction ID',
      'Date',
      'Cashier',
      'Payment Method',
      'Status',
      'Subtotal',
      'Discount',
      'Tax',
      'Total',
    ],
    rows.map((r) => [
      r.id,
      r.created_at,
      r.cashier_name,
      r.payment_method,
      r.payment_status,
      r.subtotal,
      r.discount_amount,
      r.tax_amount,
      r.total,
    ])
  );
}

export interface HistoryCsvRow {
  id: string;
  created_at: string;
  payment_method: string;
  payment_status: string;
  item_count: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}

export function historyTransactionsToCsv(rows: HistoryCsvRow[]): string {
  return toCsv(
    [
      'ID Transaksi',
      'Tanggal',
      'Metode',
      'Status',
      'Jumlah Item',
      'Subtotal',
      'Diskon',
      'Pajak',
      'Total',
    ],
    rows.map((r) => [
      r.id,
      r.created_at,
      r.payment_method,
      r.payment_status,
      r.item_count,
      r.subtotal,
      r.discount_amount,
      r.tax_amount,
      r.total,
    ])
  );
}
