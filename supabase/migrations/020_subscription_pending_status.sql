-- Xendit checkout: a subscription stays 'pending' after the user starts a
-- payment, until the Xendit invoice webhook flips it to 'active' on payment.
-- (subscription_status enum was active/past_due/cancelled — see migration 009.)

ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'pending';
