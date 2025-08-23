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