// A subscription only grants its plan while it is 'active' AND not past its
// period_end. Without the period_end check, a one-time payment would unlock the
// plan forever. Used everywhere plan access is resolved.
export function isSubscriptionActive(
  status: string | null | undefined,
  periodEnd: string | null | undefined
): boolean {
  if (status !== 'active') return false;
  if (!periodEnd) return true;
  return new Date(periodEnd).getTime() > Date.now();
}

// Target subscription status for an *initial-checkout* Xendit invoice webhook
// event. Returns null for events that must NOT write status (PENDING / unknown).
//
// This only describes the mapping; the caller additionally guards the write to
// rows still in 'pending' (see the webhook). An already-active subscription must
// never be downgraded by an initial-invoice event — its EXPIRED callback fires
// ~24h after checkout (Xendit's default invoice expiry), and legitimate expiry
// is handled by period_end + isSubscriptionActive, not by cancelling.
export function initialInvoiceTargetStatus(
  invoiceStatus: string | null | undefined
): 'active' | 'cancelled' | null {
  if (invoiceStatus === 'PAID' || invoiceStatus === 'SETTLED') return 'active';
  if (invoiceStatus === 'EXPIRED') return 'cancelled';
  return null;
}
