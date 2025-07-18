-- Enable RLS on all tables that don't have it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_colors ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for resumes table
CREATE POLICY "Users can view own resumes" ON public.resumes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resumes" ON public.resumes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for shared_resumes table
CREATE POLICY "Users can view own shared resumes" ON public.shared_resumes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = shared_resumes.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own shared resumes" ON public.shared_resumes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = shared_resumes.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own shared resumes" ON public.shared_resumes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE resumes.id = shared_resumes.resume_id 
    AND resumes.user_id = auth.uid()
  )
);

-- Public read access for shared resumes with valid tokens
CREATE POLICY "Public can view shared resumes with valid tokens" ON public.shared_resumes
FOR SELECT USING (expires_at IS NULL OR expires_at > now());

-- RLS policies for templates table (public read access)
CREATE POLICY "Everyone can view templates" ON public.templates
FOR SELECT USING (is_active = true);

-- RLS policies for template_colors table (public read access)
CREATE POLICY "Everyone can view template colors" ON public.template_colors
FOR SELECT USING (true);