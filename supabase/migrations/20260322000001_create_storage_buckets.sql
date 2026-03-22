-- ================================================================
-- Storage Buckets
-- ================================================================

-- Create equipment-images bucket (public so images are accessible without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload equipment images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'equipment-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own equipment images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own equipment images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all equipment images
CREATE POLICY "Public can view equipment images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'equipment-images');
