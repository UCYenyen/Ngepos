-- Allow owners and managers to delete tables (missing from 002_pos_core_schema).

CREATE POLICY tables_delete ON tables
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
