-- Add consultant_id to profiles table to track which consultant created each candidate
ALTER TABLE public.profiles 
ADD COLUMN consultant_id UUID REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX idx_profiles_consultant_id ON public.profiles(consultant_id);