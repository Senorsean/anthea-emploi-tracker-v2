-- 1) Secure shared resumes: remove permissive public SELECT and add RPC

-- Ensure RLS is enabled (should already be, but safe to keep)
ALTER TABLE public.shared_resumes ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'shared_resumes' 
      AND policyname = 'Public can view shared resumes with valid tokens'
  ) THEN
    DROP POLICY "Public can view shared resumes with valid tokens" ON public.shared_resumes;
  END IF;
END $$;

-- Keep existing user-specific policies intact. Create secure RPC for token-based access
CREATE OR REPLACE FUNCTION public.get_shared_resume(token TEXT)
RETURNS TABLE (
  resume_id uuid,
  title text,
  template_id integer,
  color_scheme_id integer,
  personal_info jsonb,
  experiences jsonb,
  education jsonb,
  skills jsonb,
  languages jsonb,
  interests jsonb,
  custom_sections jsonb,
  is_public boolean,
  qr_code_url text,
  pdf_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate token and non-expired link
  IF NOT EXISTS (
    SELECT 1 FROM public.shared_resumes sr
    WHERE sr.share_token = token
      AND (sr.expires_at IS NULL OR sr.expires_at > now())
  ) THEN
    RAISE EXCEPTION 'Invalid or expired token' USING ERRCODE = '28000';
  END IF;

  -- Increment access count (best-effort)
  UPDATE public.shared_resumes
     SET access_count = COALESCE(access_count, 0) + 1
   WHERE share_token = token;

  RETURN QUERY
  SELECT r.id,
         r.title,
         r.template_id,
         r.color_scheme_id,
         r.personal_info,
         r.experiences,
         r.education,
         r.skills,
         r.languages,
         r.interests,
         r.custom_sections,
         r.is_public,
         r.qr_code_url,
         r.pdf_url
    FROM public.shared_resumes sr
    JOIN public.resumes r ON r.id = sr.resume_id
   WHERE sr.share_token = token
     AND (sr.expires_at IS NULL OR sr.expires_at > now());
END;
$$;

-- Ensure the function owner can bypass RLS; grant execute to anon and authenticated
REVOKE ALL ON FUNCTION public.get_shared_resume(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_resume(text) TO anon, authenticated;

-- Optional: tighten SELECT on shared_resumes so only owners can read rows (already covered by existing policy)
-- No further change required as long as public policy is removed.
