-- Fix the INSERT policy for profiles table to include WITH CHECK constraint
-- This ensures users can only insert their own profile data
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also add a DELETE policy to allow users to delete their own profile if needed
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Double-check that no other ways exist to access profile data
-- Create a security function to get current user profile safely
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.email, p.full_name, p.avatar_url, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;