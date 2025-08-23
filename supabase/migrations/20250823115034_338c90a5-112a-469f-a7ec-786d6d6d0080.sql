-- Update the app_role enum to match the new role structure
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('admin', 'consultant', 'candidat');

-- Update existing user_roles table
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Drop the old enum
DROP TYPE public.app_role_old;

-- Create modules table to define available modules
CREATE TABLE public.modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('recherche_emploi', 'definition_projet_pro', 'progression_carriere')),
    description text,
    route text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, category)
);

-- Enable RLS on modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create candidate_modules table to manage module assignments
CREATE TABLE public.candidate_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    consultant_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    UNIQUE(candidate_id, module_id)
);

-- Enable RLS on candidate_modules
ALTER TABLE public.candidate_modules ENABLE ROW LEVEL SECURITY;

-- Update role checking functions
CREATE OR REPLACE FUNCTION public.is_consultant(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'consultant'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.is_candidat(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'candidat'::app_role)
$$;

-- Function to check if candidate has access to a specific module
CREATE OR REPLACE FUNCTION public.candidate_has_module_access(_candidate_id uuid, _module_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidate_modules cm
    JOIN public.modules m ON m.id = cm.module_id
    WHERE cm.candidate_id = _candidate_id
      AND cm.module_id = _module_id
      AND cm.is_active = true
      AND m.is_active = true
  )
$$;

-- Function to get candidate's accessible modules
CREATE OR REPLACE FUNCTION public.get_candidate_modules(_candidate_id uuid)
RETURNS TABLE(
  module_id uuid,
  module_name text,
  category text,
  description text,
  route text,
  assigned_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    m.id,
    m.name,
    m.category,
    m.description,
    m.route,
    cm.assigned_at
  FROM public.candidate_modules cm
  JOIN public.modules m ON m.id = cm.module_id
  WHERE cm.candidate_id = _candidate_id
    AND cm.is_active = true
    AND m.is_active = true
  ORDER BY m.category, m.name
$$;

-- RLS Policies for modules table
CREATE POLICY "Everyone can view active modules"
ON public.modules
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins and consultants can manage modules"
ON public.modules
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_consultant(auth.uid()));

-- RLS Policies for candidate_modules table
CREATE POLICY "Candidates can view their assigned modules"
ON public.candidate_modules
FOR SELECT
TO authenticated
USING (
  candidate_id = auth.uid() 
  OR public.is_admin(auth.uid()) 
  OR (public.is_consultant(auth.uid()) AND consultant_id = auth.uid())
);

CREATE POLICY "Consultants can assign modules to candidates"
ON public.candidate_modules
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid()) 
  OR (public.is_consultant(auth.uid()) AND consultant_id = auth.uid())
);

CREATE POLICY "Consultants can update their module assignments"
ON public.candidate_modules
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR (public.is_consultant(auth.uid()) AND consultant_id = auth.uid())
);

CREATE POLICY "Consultants can remove their module assignments"
ON public.candidate_modules
FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR (public.is_consultant(auth.uid()) AND consultant_id = auth.uid())
);

-- Insert default modules for each category
INSERT INTO public.modules (name, category, description, route) VALUES
-- Recherche Emploi
('Progression Candidatures', 'recherche_emploi', 'Suivi et analyse de vos candidatures', '/progression-candidatures'),
('Progression Entretiens', 'recherche_emploi', 'Préparation et suivi des entretiens', '/progression-entretiens'),
('Améliorer Entretiens', 'recherche_emploi', 'Techniques pour améliorer vos entretiens', '/ameliorer-entretiens'),
('Préparation Entretien', 'recherche_emploi', 'Préparation spécifique aux entretiens', '/preparation-entretien'),
('Taux de Réponse', 'recherche_emploi', 'Analyse de vos taux de réponse', '/taux-reponse'),
('Intelligence Marché', 'recherche_emploi', 'Veille et intelligence économique', '/intelligence-marche'),
('Référentiels Salaires', 'recherche_emploi', 'Grilles de salaires par secteur', '/referentiels-salaires'),
('Négociation Offre', 'recherche_emploi', 'Techniques de négociation salariale', '/negociation-offre'),

-- Définition du projet professionnel
('IRMR3', 'definition_projet_pro', 'Inventaire des Intérêts Professionnels', '/irmr3'),
('Pictotest Métiers', 'definition_projet_pro', 'Test d''orientation par images', '/pictotest-metiers'),
('MBTI', 'definition_projet_pro', 'Test de personnalité Myers-Briggs', '/mbti'),
('Big Five', 'definition_projet_pro', 'Test de personnalité Big Five', '/big-five'),
('Questionnaire Motivations', 'definition_projet_pro', 'Analyse des motivations profondes', '/questionnaire-motivations'),
('Bilan Compétences', 'definition_projet_pro', 'Bilan complet de compétences', '/bilan-competences'),
('Ikigai', 'definition_projet_pro', 'Découverte de votre raison d''être', '/ikigai'),
('Golden Circle', 'definition_projet_pro', 'Méthode du cercle d''or', '/golden-circle'),
('SWOT Personnel', 'definition_projet_pro', 'Analyse SWOT personnelle', '/swot-personnel'),
('Analyse Transactionnelle', 'definition_projet_pro', 'Analyse des transactions interpersonnelles', '/analyse-transactionnelle'),

-- Progression de Carrière
('Progression Carrière', 'progression_carriere', 'Planification de l''évolution de carrière', '/progression-carriere'),
('Parcours Carrière', 'progression_carriere', 'Définition du parcours professionnel', '/parcours-carriere'),
('Compétences Formation', 'progression_carriere', 'Plan de développement des compétences', '/competences-formation'),
('Méthode SMART', 'progression_carriere', 'Définition d''objectifs SMART', '/methode-smart'),
('Méthode STAR', 'progression_carriere', 'Technique de présentation d''expériences', '/methode-star'),
('Tester Connaissances', 'progression_carriere', 'Évaluation des connaissances', '/tester-connaissances'),
('Apprentissage Compétences', 'progression_carriere', 'Stratégies d''apprentissage', '/apprentissage-competences'),
('Optimiser Profil LinkedIn', 'progression_carriere', 'Optimisation du profil LinkedIn', '/optimiser-profil-linkedin'),
('Renforcez Votre Réseau', 'progression_carriere', 'Développement du réseau professionnel', '/renforcez-votre-reseau'),
('Progression Réseau', 'progression_carriere', 'Suivi de l''évolution du réseau', '/progression-reseau'),
('Aire Mobilité', 'progression_carriere', 'Définition de la zone de mobilité', '/aire-mobilite');

-- Update get_user_role function for new roles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'consultant' THEN 2
      WHEN 'candidat' THEN 3
    END
  LIMIT 1
$$;