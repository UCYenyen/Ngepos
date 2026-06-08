import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/format';
import type { CsvTransactionRow } from '@/lib/export/csv';

export function generateTransactionsPdf(
  businessName: string,
  rows: CsvTransactionRow[]
): jsPDF {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`${businessName} — Transactions`, 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [['Date', 'Cashier', 'Method', 'Status', 'Total']],
    body: rows.map((r) => [
      formatDate(r.created_at),
      r.cashier_name,
      r.payment_method,
      r.payment_status,
      formatCurrency(r.total),
    ]),
  });
  return doc;
}
