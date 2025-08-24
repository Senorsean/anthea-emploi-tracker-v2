-- Add RLS policy for consultants to view profiles of candidates they created
CREATE POLICY "Consultants can view their candidates' profiles" 
ON public.profiles 
FOR SELECT 
USING (
  is_consultant(auth.uid()) AND consultant_id = auth.uid()
);