-- Platform operators (Ngepos staff) — distinct from business owners/members.
-- Platform admins manage the Ngepos platform itself, not any single business.

CREATE TABLE platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins WHERE user_id = auth.uid()
  );
$$;

CREATE POLICY platform_admins_select ON platform_admins
  FOR SELECT USING (is_platform_admin());

GRANT EXECUTE ON FUNCTION is_platform_admin() TO authenticated;
