-- Insert the missing module into public.modules
INSERT INTO public.modules (name, description, category, route, is_active)
VALUES (
  'Analyse du CV et Générateur de lettre de motivation',
  'Optimisez vos candidatures avec l''IA pour analyser votre CV et générer des lettres personnalisées',
  'recherche_emploi',
  'https://joyful-crepe-00afff.netlify.app/',
  true
);