-- supabase/migrations/008_business_member_select.sql

CREATE POLICY businesses_member_select ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
    )
  );
