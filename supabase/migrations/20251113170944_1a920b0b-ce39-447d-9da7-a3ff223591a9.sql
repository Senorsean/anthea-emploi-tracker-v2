-- Créer une table pour les préférences d'alerte des consultants
CREATE TABLE public.consultant_alert_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  no_application_days INTEGER NOT NULL DEFAULT 14,
  objective_overdue_days INTEGER NOT NULL DEFAULT 7,
  no_session_days INTEGER NOT NULL DEFAULT 30,
  session_to_plan_days INTEGER NOT NULL DEFAULT 21,
  low_progress_threshold INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(consultant_id)
);

-- Enable RLS
ALTER TABLE public.consultant_alert_settings ENABLE ROW LEVEL SECURITY;

-- Consultants can view their own settings
CREATE POLICY "Consultants can view own settings"
ON public.consultant_alert_settings
FOR SELECT
USING (
  consultant_id = auth.uid() AND 
  (is_consultant(auth.uid()) OR is_admin(auth.uid()))
);

-- Consultants can insert their own settings
CREATE POLICY "Consultants can insert own settings"
ON public.consultant_alert_settings
FOR INSERT
WITH CHECK (
  consultant_id = auth.uid() AND 
  (is_consultant(auth.uid()) OR is_admin(auth.uid()))
);

-- Consultants can update their own settings
CREATE POLICY "Consultants can update own settings"
ON public.consultant_alert_settings
FOR UPDATE
USING (
  consultant_id = auth.uid() AND 
  (is_consultant(auth.uid()) OR is_admin(auth.uid()))
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_consultant_alert_settings_updated_at
BEFORE UPDATE ON public.consultant_alert_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();