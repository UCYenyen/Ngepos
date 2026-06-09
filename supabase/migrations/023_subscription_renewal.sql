-- Recurring billing (renewal invoices): track an outstanding renewal so a sub
-- stays 'active' until period_end while the next-cycle Xendit invoice is pending.
-- On payment, period_end rolls forward and these are cleared.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS renewal_reference TEXT;
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS renewal_invoice_url TEXT;

-- Fast lookup for the renewal cron: paid plans nearing/at period_end.
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_due
  ON subscriptions (period_end)
  WHERE status = 'active';
