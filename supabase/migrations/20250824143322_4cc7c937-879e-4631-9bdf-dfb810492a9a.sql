-- Add RLS policy for consultants to view roles of candidates they created
CREATE POLICY "Consultants can view their candidates' roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = user_roles.user_id 
      AND p.consultant_id = auth.uid() 
      AND is_consultant(auth.uid())
  )
);