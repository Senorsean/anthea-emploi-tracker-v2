-- Mobility & Occupations schema

-- 0) Helper function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) Occupations lookup table
CREATE TABLE IF NOT EXISTS public.occupations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS and allow read access to everyone (catalog data)
ALTER TABLE public.occupations ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'occupations' AND policyname = 'Everyone can view occupations'
  ) THEN
    CREATE POLICY "Everyone can view occupations"
    ON public.occupations
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_occupations_updated_at'
  ) THEN
    CREATE TRIGGER trg_occupations_updated_at
    BEFORE UPDATE ON public.occupations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index for ordering/search
CREATE INDEX IF NOT EXISTS idx_occupations_label ON public.occupations (label);


-- 2) Mobility area per user
CREATE TABLE IF NOT EXISTS public.mobility_area (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  base_address TEXT,
  base_lat DOUBLE PRECISION,
  base_lng DOUBLE PRECISION,
  radius_km INTEGER NOT NULL DEFAULT 25 CHECK (radius_km >= 0),
  allowed_departments TEXT[] NOT NULL DEFAULT '{}',
  allowed_cities TEXT[] NOT NULL DEFAULT '{}',
  remote_ok BOOLEAN NOT NULL DEFAULT true,
  hybrid_ok BOOLEAN NOT NULL DEFAULT true,
  relocation_ok BOOLEAN NOT NULL DEFAULT false,
  max_commute_time_min INTEGER NOT NULL DEFAULT 60 CHECK (max_commute_time_min >= 0),
  travel_modes TEXT[] NOT NULL DEFAULT ARRAY['car','public','bike','walk']::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_mobility_area_user UNIQUE (user_id)
);

ALTER TABLE public.mobility_area ENABLE ROW LEVEL SECURITY;

-- Policies: full CRUD for owners only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mobility_area' AND policyname = 'Users can view own mobility area'
  ) THEN
    CREATE POLICY "Users can view own mobility area"
    ON public.mobility_area
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mobility_area' AND policyname = 'Users can insert own mobility area'
  ) THEN
    CREATE POLICY "Users can insert own mobility area"
    ON public.mobility_area
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mobility_area' AND policyname = 'Users can update own mobility area'
  ) THEN
    CREATE POLICY "Users can update own mobility area"
    ON public.mobility_area
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mobility_area' AND policyname = 'Users can delete own mobility area'
  ) THEN
    CREATE POLICY "Users can delete own mobility area"
    ON public.mobility_area
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mobility_area_updated_at'
  ) THEN
    CREATE TRIGGER trg_mobility_area_updated_at
    BEFORE UPDATE ON public.mobility_area
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
