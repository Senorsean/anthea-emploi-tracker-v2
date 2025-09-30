-- Security Fix: Explicitly assign RLS policies to authenticated role only for resumes table

-- Drop existing policies without explicit role assignments
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can create own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;

-- Recreate policies with explicit role assignments to authenticated users only
CREATE POLICY "Users can view own resumes"
ON public.resumes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resumes"
ON public.resumes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
ON public.resumes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
ON public.resumes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify RLS is enabled (it should already be, but let's be explicit)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Ensure no grants to anon role
REVOKE ALL ON public.resumes FROM anon;