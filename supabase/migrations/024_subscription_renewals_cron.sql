-- Schedule the subscription-renewals edge function daily at 05:00, mirroring the
-- monthly-report cron (migration 007). Reuses the existing app.settings.edge_url
-- and app.settings.service_role_key. cron.schedule upserts by job name, so this
-- is safe to re-run.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'subscription-renewals',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_url', true) || '/functions/v1/subscription-renewals',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
