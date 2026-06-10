# subscription-renewals edge function

Runs daily (scheduled by pg_cron — see `migrations/024_subscription_renewals_cron.sql`,
mirroring the `monthly-report` schedule). For every **active**, **paid** subscription
within `RENEWAL_WINDOW_DAYS` (3) of `period_end` that has no outstanding renewal, it:

1. creates a Xendit hosted invoice for the next cycle,
2. parks `renewal_reference` + `renewal_invoice_url` on the subscription,
3. inserts a `pending` invoice row.

When the user pays, the app's Xendit webhook (or verify-on-return on
`/billing?payment=success`) rolls `period_end` forward and clears the markers.

## Required env (set in the edge runtime)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. You must set:

- `XENDIT_SECRET_KEY` — your Xendit secret key (test key for dev).
- `APP_URL` — public URL of the Next.js app, used for the invoice success/failure
  redirects (defaults to `https://ngepos.com`).

Set them the same way as the other functions (e.g. `supabase secrets set XENDIT_SECRET_KEY=... APP_URL=...`,
or the edge-runtime container env on the self-hosted stack), then deploy this
function like `monthly-report`.

## Manual trigger / test

```
curl -X POST "<edge_url>/functions/v1/subscription-renewals" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```
Returns `{ "due": <n>, "created": <n> }`.
