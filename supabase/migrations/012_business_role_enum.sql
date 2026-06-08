-- supabase/migrations/012_business_role_enum.sql

DO $$
DECLARE
  pol RECORD;
  ddl TEXT;
BEGIN
  CREATE TEMP TABLE _role_policies ON COMMIT DROP AS
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (COALESCE(qual, '') LIKE '%role%' OR COALESCE(with_check, '') LIKE '%role%');

  FOR pol IN SELECT * FROM _role_policies LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;

  ALTER TABLE business_members DROP CONSTRAINT IF EXISTS business_members_role_check;
  ALTER TABLE business_members ALTER COLUMN role TYPE business_role USING role::business_role;

  ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
  ALTER TABLE invitations ALTER COLUMN role TYPE business_role USING role::business_role;

  FOR pol IN SELECT * FROM _role_policies LOOP
    ddl := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      pol.policyname, pol.schemaname, pol.tablename, pol.permissive, pol.cmd,
      array_to_string(pol.roles, ', '));
    IF pol.qual IS NOT NULL THEN
      ddl := ddl || format(' USING (%s)', replace(pol.qual, '::text', '::business_role'));
    END IF;
    IF pol.with_check IS NOT NULL THEN
      ddl := ddl || format(' WITH CHECK (%s)', replace(pol.with_check, '::text', '::business_role'));
    END IF;
    EXECUTE ddl;
  END LOOP;
END $$;
