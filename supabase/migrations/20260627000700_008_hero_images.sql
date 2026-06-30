-- Hero images table
CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_images_select" ON hero_images;
CREATE POLICY "hero_images_select" ON hero_images FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "hero_images_insert" ON hero_images;
CREATE POLICY "hero_images_insert" ON hero_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "hero_images_delete" ON hero_images;
CREATE POLICY "hero_images_delete" ON hero_images FOR DELETE
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Storage bucket for hero images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-images', 'hero-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "hero_images_storage_select" ON storage.objects;
CREATE POLICY "hero_images_storage_select" ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'hero-images');

DROP POLICY IF EXISTS "hero_images_storage_insert" ON storage.objects;
CREATE POLICY "hero_images_storage_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images'
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

DROP POLICY IF EXISTS "hero_images_storage_delete" ON storage.objects;
CREATE POLICY "hero_images_storage_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hero-images'
    AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
