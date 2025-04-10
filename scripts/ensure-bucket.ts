/**
 * Script to ensure the 'property-photos' bucket exists in Supabase storage
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PROPERTY_PHOTOS_BUCKET = process.env.PROPERTY_PHOTOS_BUCKET || 'property-photos'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function main() {
  console.log('🔄 Checking Supabase storage bucket...')

  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    const bucketExists = buckets.some(bucket => bucket.name === PROPERTY_PHOTOS_BUCKET)
    
    if (bucketExists) {
      console.log(`✅ Bucket '${PROPERTY_PHOTOS_BUCKET}' already exists`)
    } else {
      // Create bucket if it doesn't exist
      console.log(`🔄 Creating bucket '${PROPERTY_PHOTOS_BUCKET}'...`)
      const { data, error } = await supabase.storage.createBucket(PROPERTY_PHOTOS_BUCKET, {
        public: true
      })
      
      if (error) {
        throw error
      }
      
      console.log(`✅ Bucket '${PROPERTY_PHOTOS_BUCKET}' created successfully`)
    }

    // For RLS policies, we need to manually execute these in the Supabase dashboard SQL editor
    console.log(`
⚙️ To complete setup, execute the following SQL in the Supabase dashboard SQL editor:

BEGIN;
  -- Check and create policy for read access (made public)
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Public Read Access for Property Photos'
    ) THEN
      CREATE POLICY "Public Read Access for Property Photos"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = '${PROPERTY_PHOTOS_BUCKET}');
    END IF;
  END $$;

  -- Check and create policy for insert access (authenticated users)
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Allow authenticated insert to property photos'
    ) THEN
      CREATE POLICY "Allow authenticated insert to property photos"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = '${PROPERTY_PHOTOS_BUCKET}' AND
        auth.role() = 'authenticated'
      );
    END IF;
  END $$;

  -- Check and create policy for delete access (only owners)
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Allow owner delete for property photos'
    ) THEN
      CREATE POLICY "Allow owner delete for property photos"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = '${PROPERTY_PHOTOS_BUCKET}' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    END IF;
  END $$;
COMMIT;
    `)
    
    console.log('✅ Bucket setup complete! Run the SQL above in the Supabase dashboard to complete RLS policy setup.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main() 