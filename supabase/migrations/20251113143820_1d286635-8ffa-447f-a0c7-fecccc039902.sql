-- Create coaching_sessions table
CREATE TABLE public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  consultant_id UUID NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'individuel' CHECK (session_type IN ('individuel', 'groupe')),
  duration INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'planifiée' CHECK (status IN ('planifiée', 'en_cours', 'complétée', 'annulée')),
  objectives TEXT,
  notes_consultant TEXT,
  notes_candidate TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  next_session_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_coaching_sessions_candidate ON coaching_sessions(candidate_id);
CREATE INDEX idx_coaching_sessions_consultant ON coaching_sessions(consultant_id);
CREATE INDEX idx_coaching_sessions_date ON coaching_sessions(session_date);

-- Create coaching_objectives table
CREATE TABLE public.coaching_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  consultant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('leadership', 'communication', 'stratégie', 'gestion_équipe', 'développement_personnel', 'autre')),
  status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'atteint', 'abandonné', 'en_pause')),
  target_date DATE,
  completion_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  measurable_criteria JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_coaching_objectives_candidate ON coaching_objectives(candidate_id);
CREATE INDEX idx_coaching_objectives_status ON coaching_objectives(status);

-- Create coaching_notes table
CREATE TABLE public.coaching_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  consultant_id UUID,
  note_type TEXT NOT NULL CHECK (note_type IN ('réflexion', 'feedback', 'action', 'observation', 'autre')),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_coaching_notes_session ON coaching_notes(session_id);
CREATE INDEX idx_coaching_notes_candidate ON coaching_notes(candidate_id);

-- Add triggers for updated_at
CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_objectives_updated_at
  BEFORE UPDATE ON public.coaching_objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_notes_updated_at
  BEFORE UPDATE ON public.coaching_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaching_sessions
CREATE POLICY "Consultants can view their candidates' sessions"
  ON public.coaching_sessions FOR SELECT
  USING (
    is_consultant(auth.uid()) AND consultant_id = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "Candidates can view their own sessions"
  ON public.coaching_sessions FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Consultants can create sessions"
  ON public.coaching_sessions FOR INSERT
  WITH CHECK (
    (is_consultant(auth.uid()) AND consultant_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Consultants can update their sessions"
  ON public.coaching_sessions FOR UPDATE
  USING (
    (is_consultant(auth.uid()) AND consultant_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Candidates can add their notes to sessions"
  ON public.coaching_sessions FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- RLS Policies for coaching_objectives
CREATE POLICY "Consultants can manage objectives"
  ON public.coaching_objectives FOR ALL
  USING (
    (is_consultant(auth.uid()) AND consultant_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Candidates can view their objectives"
  ON public.coaching_objectives FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their progress"
  ON public.coaching_objectives FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- RLS Policies for coaching_notes
CREATE POLICY "Consultants can manage all notes"
  ON public.coaching_notes FOR ALL
  USING (
    consultant_id = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "Candidates can view non-private notes"
  ON public.coaching_notes FOR SELECT
  USING (
    candidate_id = auth.uid() AND is_private = false
  );

CREATE POLICY "Candidates can create their own notes"
  ON public.coaching_notes FOR INSERT
  WITH CHECK (
    candidate_id = auth.uid() AND consultant_id IS NULL
  );