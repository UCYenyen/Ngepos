-- supabase/migrations/006_report_settings.sql

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_channel TEXT DEFAULT 'email'
  CHECK (report_channel IN ('email', 'whatsapp'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_recipient TEXT;
