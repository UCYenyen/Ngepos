'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Share2, Printer, Mail } from 'lucide-react';
import type { Transaction, TransactionItem } from '@/types/pos';
import type { Business } from '@/types/business';

interface ReceiptProps {
  transaction: Transaction & { transaction_items: TransactionItem[] };
  business: Business;
  onClose: () => void;
}

export function Receipt({ transaction, business, onClose }: ReceiptProps) {
  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const message = `Terima kasih telah berbelanja di ${business.name}!\n\nNo. Transaksi: ${transaction.id}\nTanggal: ${new Date(transaction.created_at).toLocaleString('id-ID')}\n\nTotal: IDR ${transaction.total.toLocaleString('id-ID')}\n\nTautan untuk konfirmasi atau pertanyaan.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  function handleShareEmail() {
    const subject = `Struk Pembelian - ${business.name}`;
    const body = formatReceiptForEmail();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function formatReceiptForEmail(): string {
    const items = transaction.transaction_items
      .map((item) => `${item.name} x${item.quantity} = IDR ${item.subtotal.toLocaleString('id-ID')}`)
      .join('\n');

    return `Struk Pembelian\n\n${business.name}\nTanggal: ${new Date(transaction.created_at).toLocaleString('id-ID')}\nNo. Transaksi: ${transaction.id}\n\nItem:\n${items}\n\nSubtotal: IDR ${transaction.subtotal.toLocaleString('id-ID')}\nDiskon: -IDR ${transaction.discount_amount.toLocaleString('id-ID')}\nPajak: IDR ${transaction.tax_amount.toLocaleString('id-ID')}\nTotal: IDR ${transaction.total.toLocaleString('id-ID')}\n\nMetode Pembayaran: ${transaction.payment_method.toUpperCase()}`;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 print:border-0 print:shadow-none">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            {business.logo_url && (
              <img src={business.logo_url} alt={business.name} className="w-16 h-16 mx-auto mb-2 rounded" />
            )}
            <h1 className="text-xl font-bold">{business.name}</h1>
            <p className="text-sm text-slate-600">{business.address}</p>
            {business.timezone && <p className="text-xs text-slate-500">{business.timezone}</p>}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">No. Transaksi:</span>
              <span className="font-mono">{transaction.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tanggal & Waktu:</span>
              <span>{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Metode Pembayaran:</span>
              <span className="capitalize font-semibold">{transaction.payment_method}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm mb-4">
            <div className="font-semibold mb-3">Item Pembelian</div>
            {transaction.transaction_items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-slate-500">x{item.quantity} @ IDR {item.price.toLocaleString('id-ID')}</div>
                </div>
                <div className="text-right">
                  <div>IDR {item.subtotal.toLocaleString('id-ID')}</div>
                  {item.discount_amount > 0 && (
                    <div className="text-xs text-red-600">-IDR {item.discount_amount.toLocaleString('id-ID')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>IDR {transaction.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span>-IDR {transaction.discount_amount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {transaction.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Pajak:</span>
                <span>IDR {transaction.tax_amount.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-100 p-3 rounded mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">IDR {transaction.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {transaction.notes && (
            <div className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded mb-6">
              {transaction.notes}
            </div>
          )}

          <Separator className="my-4" />

          <div className="text-center text-xs text-slate-500">
            <p>Terima kasih telah berbelanja!</p>
            <p>Semoga hari Anda menyenangkan</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleShareWhatsApp} className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        <Button variant="outline" onClick={handleShareEmail} className="flex-1">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}
