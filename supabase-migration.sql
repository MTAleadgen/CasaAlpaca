-- Create property_photos table
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create a storage bucket for property photos if it doesn't exist
-- Run this in the Supabase SQL editor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE name = 'property-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('property-photos', 'property-photos', true);
  END IF;
END $$;

-- Add Row Level Security policy for the property photos bucket
-- Allow users to access only their own photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Users can only access their own property photos'
  ) THEN
    CREATE POLICY "Users can only access their own property photos"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'property-photos' AND (auth.uid()::text = (storage.foldername(name))[1]));
  END IF;
END $$;

-- Allow insert for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Allow authorized property photo uploads'
  ) THEN
    CREATE POLICY "Allow authorized property photo uploads"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'property-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$; 