-- Business profile assets: QRIS image column + a public storage bucket for
-- logos and QRIS images. Files live under "<businessId>/..." so policies can
-- scope writes to members of that business.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qris_image_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY business_assets_read ON storage.objects
  FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY business_assets_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'business-assets'
    AND EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = ((storage.foldername(name))[1])::uuid
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY business_assets_update ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'business-assets'
    AND EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = ((storage.foldername(name))[1])::uuid
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY business_assets_delete ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'business-assets'
    AND EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = ((storage.foldername(name))[1])::uuid
        AND business_members.user_id = auth.uid()
    )
  );
