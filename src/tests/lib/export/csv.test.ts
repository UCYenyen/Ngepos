import { describe, it, expect } from 'vitest';
import {
  transactionsToCsv,
  historyTransactionsToCsv,
  type CsvTransactionRow,
  type HistoryCsvRow,
} from '@/lib/export/csv';

const header =
  'Transaction ID,Date,Cashier,Payment Method,Status,Subtotal,Discount,Tax,Total';

function makeRow(overrides: Partial<CsvTransactionRow> = {}): CsvTransactionRow {
  return {
    id: 'txn-1',
    created_at: '2026-06-08T10:00:00.000Z',
    cashier_name: 'Alice',
    payment_method: 'cash',
    payment_status: 'paid',
    subtotal: 1000,
    discount_amount: 100,
    tax_amount: 90,
    total: 990,
    ...overrides,
  };
}

describe('transactionsToCsv', () => {
  it('puts the header row first', () => {
    const csv = transactionsToCsv([makeRow()]);
    expect(csv.split('\n')[0]).toBe(header);
  });

  it('renders all 9 fields of a normal row in order, comma-separated', () => {
    const csv = transactionsToCsv([makeRow()]);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toBe(
      'txn-1,2026-06-08T10:00:00.000Z,Alice,cash,paid,1000,100,90,990'
    );
  });

  it('wraps a cashier_name containing a comma in double quotes', () => {
    const csv = transactionsToCsv([makeRow({ cashier_name: 'Doe, John' })]);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toContain('"Doe, John"');
  });

  it('doubles a double quote in cashier_name and wraps the field', () => {
    const csv = transactionsToCsv([makeRow({ cashier_name: 'Jo"hn' })]);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toContain('"Jo""hn"');
  });

  it('wraps a cashier_name containing a newline in double quotes', () => {
    const csv = transactionsToCsv([makeRow({ cashier_name: 'Line1\nLine2' })]);
    expect(csv).toContain('"Line1\nLine2"');
  });

  it('returns exactly the header line for empty rows with no trailing newline', () => {
    const csv = transactionsToCsv([]);
    expect(csv).toBe(header);
  });
});

const historyHeader =
  'ID Transaksi,Tanggal,Metode,Status,Jumlah Item,Subtotal,Diskon,Pajak,Total';

function makeHistoryRow(overrides: Partial<HistoryCsvRow> = {}): HistoryCsvRow {
  return {
    id: 'txn-2',
    created_at: '2026-06-09T10:00:00.000Z',
    payment_method: 'Tunai',
    payment_status: 'Lunas',
    item_count: 3,
    subtotal: 30000,
    discount_amount: 5000,
    tax_amount: 2500,
    total: 27500,
    ...overrides,
  };
}

describe('historyTransactionsToCsv', () => {
  it('puts the Indonesian header row first', () => {
    const csv = historyTransactionsToCsv([makeHistoryRow()]);
    expect(csv.split('\n')[0]).toBe(historyHeader);
  });

  it('renders all 9 fields of a row in order', () => {
    const csv = historyTransactionsToCsv([makeHistoryRow()]);
    expect(csv.split('\n')[1]).toBe(
      'txn-2,2026-06-09T10:00:00.000Z,Tunai,Lunas,3,30000,5000,2500,27500'
    );
  });

  it('returns only the header for empty rows', () => {
    expect(historyTransactionsToCsv([])).toBe(historyHeader);
  });
});
