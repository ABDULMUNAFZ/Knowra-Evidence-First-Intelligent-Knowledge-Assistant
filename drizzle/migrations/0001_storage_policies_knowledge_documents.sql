CREATE POLICY "own docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'knowledge-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own docs insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'knowledge-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own docs delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'knowledge-documents' AND (storage.foldername(name))[1] = auth.uid()::text);