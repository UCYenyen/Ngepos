-- Fix a chicken-and-egg RLS deadlock: business_members_insert required the
-- caller to ALREADY be an owner-member of the business. For a brand-new
-- business there is no member yet, so the owner could never insert their own
-- first membership row. The business got created (businesses insert only needs
-- owner_id = auth.uid()) but had no membership, so it never appeared in the
-- dashboard list (which reads businesses THROUGH business_members).

DROP POLICY IF EXISTS business_members_insert ON business_members;
CREATE POLICY business_members_insert ON business_members
  FOR INSERT WITH CHECK (
    -- an existing owner can add members to the business
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
    OR
    -- the business owner can add THEMSELVES (bootstraps the first membership)
    (
      business_members.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM businesses b
        WHERE b.id = business_members.business_id
          AND b.owner_id = auth.uid()
      )
    )
  );

-- Repair existing businesses created without an owner membership row.
INSERT INTO business_members (business_id, user_id, role)
SELECT b.id, b.owner_id, 'owner'
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM business_members bm
  WHERE bm.business_id = b.id
    AND bm.user_id = b.owner_id
);
