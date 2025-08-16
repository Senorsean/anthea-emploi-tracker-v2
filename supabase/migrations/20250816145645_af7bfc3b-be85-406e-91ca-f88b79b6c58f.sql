-- Fix storage policies for data-emploi-tracker bucket
-- Allow authenticated users to read, insert, update and delete their own files

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create proper RLS policies for the data-emploi-tracker bucket
CREATE POLICY "Users can view their own files in data-emploi-tracker" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'data-emploi-tracker' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files in data-emploi-tracker" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'data-emploi-tracker' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files in data-emploi-tracker" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'data-emploi-tracker' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files in data-emploi-tracker" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'data-emploi-tracker' AND auth.uid()::text = (storage.foldername(name))[1]);