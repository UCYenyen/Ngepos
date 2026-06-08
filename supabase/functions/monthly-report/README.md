# monthly-report Edge Function

Generates a previous-month sales summary for every business with
`report_enabled = true` whose owner is on the `pro` or `enterprise` plan, then
delivers it via Resend (email) or Fonnte (WhatsApp) based on the business's
`report_channel`. Each business is processed independently, so one delivery
failure does not abort the batch. The function returns
`{ processed, sent, failed }`.

## Report contents

- Total paid revenue for the previous calendar month (UTC).
- Paid transaction count.
- Top 5 products by summed line-item subtotal.
- Count of low-stock products (`track_stock = true`,
  `low_stock_threshold IS NOT NULL`, `stock_qty <= low_stock_threshold`).

## Secrets

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the
Supabase platform. Set the remaining secrets yourself:

```shell
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set RESEND_FROM_EMAIL=reports@ngepos.com   # optional, defaults to reports@ngepos.com
supabase secrets set FONNTE_API_KEY=your_fonnte_key
```

## Database settings for the cron job

Migration `007_monthly_report_cron.sql` schedules the function with `pg_cron`
at `0 6 1 * *` (06:00 UTC on the 1st of each month). The cron SQL reads two
database settings that the deployer must configure once:

```sql
ALTER DATABASE postgres SET app.settings.edge_url = 'https://<project-ref>.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';
```

`app.settings.edge_url` is the project base URL; the cron job appends
`/functions/v1/monthly-report`. `app.settings.service_role_key` authorizes the
internal `net.http_post` invocation.

## Deploy

```shell
supabase functions deploy monthly-report
```

Then apply the migration so the cron schedule is registered:

```shell
supabase db push
```
