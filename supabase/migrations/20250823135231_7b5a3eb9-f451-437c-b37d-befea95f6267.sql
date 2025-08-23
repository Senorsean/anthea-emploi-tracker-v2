-- Permettre aux consultants de créer des profils pour les candidats
CREATE POLICY "Consultants can create candidate profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_consultant(auth.uid()));

-- Permettre aux consultants d'assigner le rôle candidat uniquement
CREATE POLICY "Consultants can assign candidat role only" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_consultant(auth.uid()) AND role = 'candidat'::app_role);