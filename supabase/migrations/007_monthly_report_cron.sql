-- supabase/migrations/007_monthly_report_cron.sql

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'monthly-report',
  '0 6 1 * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_url', true) || '/functions/v1/monthly-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
