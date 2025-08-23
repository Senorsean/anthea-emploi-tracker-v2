-- Ajouter une politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));