-- Security Fix: Restrict public access to intellectual property tables

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Everyone can view templates" ON public.templates;
DROP POLICY IF EXISTS "Everyone can view template colors" ON public.template_colors;
DROP POLICY IF EXISTS "Everyone can view occupations" ON public.occupations;

-- Templates: Only authenticated users can view active templates
CREATE POLICY "Authenticated users can view active templates"
ON public.templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Template Colors: Only authenticated users can view
CREATE POLICY "Authenticated users can view template colors"
ON public.template_colors
FOR SELECT
TO authenticated
USING (true);

-- Occupations: Only authenticated users can view
CREATE POLICY "Authenticated users can view occupations"
ON public.occupations
FOR SELECT
TO authenticated
USING (true);