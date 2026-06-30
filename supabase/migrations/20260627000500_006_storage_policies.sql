
-- Allow public read from product-images bucket
DROP POLICY IF EXISTS "public_read_objects" ON storage.objects;
CREATE POLICY "public_read_objects" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

-- Allow admin upload to product-images bucket
DROP POLICY IF EXISTS "admin_upload_objects" ON storage.objects;
CREATE POLICY "admin_upload_objects" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Allow admin delete from product-images bucket
DROP POLICY IF EXISTS "admin_delete_objects" ON storage.objects;
CREATE POLICY "admin_delete_objects" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
