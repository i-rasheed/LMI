-- LMI: Storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('submissions', 'submissions', TRUE, 5242880, ARRAY['image/jpeg', 'image/webp']),
  ('stalls', 'stalls', TRUE, 5242880, ARRAY['image/jpeg', 'image/webp']),
  ('products', 'products', TRUE, 5242880, ARRAY['image/jpeg', 'image/webp']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage RLS: path convention {bucket}/{user_id}/{filename}
-- ---------------------------------------------------------------------------

CREATE POLICY submissions_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY submissions_select_public ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'submissions');

CREATE POLICY submissions_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY stalls_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'stalls'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY stalls_select_public ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'stalls');

CREATE POLICY stalls_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'stalls'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY avatars_select_public ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY avatars_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Product catalogue images: admin upload via service-role only; public read
CREATE POLICY products_select_public ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');
