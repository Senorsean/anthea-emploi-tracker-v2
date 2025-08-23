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