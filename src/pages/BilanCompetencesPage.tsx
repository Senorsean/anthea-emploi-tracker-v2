import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, BookOpen, Heart, Zap, Target, Briefcase, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const BilanCompetencesPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Compétences techniques
    competencesTechniques: '',
    domaines_expertise: '',
    outils_logiciels: '',
    certifications: '',
    
    // Compétences transversales
    competencesRelationnelles: '',
    competencesOrganisationnelles: '',
    competencesLeadership: '',
    competencesCreatives: '',
    
    // Motivations et valeurs
    valeursPrincipales: '',
    sourcesSatisfaction: '',
    environnementTravail: '',
    equilibreViePerso: '',
    
    // Aptitudes et centres d'intérêt
    activitesStimulantes: '',
    stylesApprentissage: '',
    defisMotivants: '',
    secteursPreferes: '',
    
    // Projet professionnel
    objectifsCarriere: '',
    contraintesPersonnelles: '',
    formationsEnvisagees: '',
    horizonTemporel: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateAnalysis = async () => {
    if (!validateCurrentStep()) {
      toast.error('Veuillez remplir tous les champs de cette section');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-assessment', {
        body: { responses: formData }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(6);
      toast.success('Bilan de compétences généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération du bilan');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.competencesTechniques && formData.domaines_expertise && 
               formData.outils_logiciels && formData.certifications;
      case 2:
        return formData.competencesRelationnelles && formData.competencesOrganisationnelles && 
               formData.competencesLeadership && formData.competencesCreatives;
      case 3:
        return formData.valeursPrincipales && formData.sourcesSatisfaction && 
               formData.environnementTravail && formData.equilibreViePerso;
      case 4:
        return formData.activitesStimulantes && formData.stylesApprentissage && 
               formData.defisMotivants && formData.secteursPreferes;
      case 5:
        return formData.objectifsCarriere && formData.contraintesPersonnelles && 
               formData.formationsEnvisagees && formData.horizonTemporel;
      default:
        return true;
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'Bilan de Compétences');

    // Introduction
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Bilan de Compétences', 20, yPosition);
    yPosition += 20;

    // Synthèse des compétences
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SYNTHÈSE DES COMPÉTENCES', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const competencesLines = pdf.splitTextToSize(analysis.syntheseCompetences, 170);
    pdf.text(competencesLines, 20, yPosition);
    yPosition += competencesLines.length * 5 + 10;

    // Profil motivationnel
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROFIL MOTIVATIONNEL', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const motivationLines = pdf.splitTextToSize(analysis.profilMotivationnel, 170);
    pdf.text(motivationLines, 20, yPosition);
    yPosition += motivationLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Recommandations de carrière
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECOMMANDATIONS DE CARRIÈRE', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const carriereLines = pdf.splitTextToSize(analysis.recommandationsCarriere, 170);
    pdf.text(carriereLines, 20, yPosition);
    yPosition += carriereLines.length * 5 + 10;

    // Plan de formation
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PLAN DE FORMATION', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const formationLines = pdf.splitTextToSize(analysis.planFormation, 170);
    pdf.text(formationLines, 20, yPosition);
    yPosition += formationLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Projet professionnel
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJET PROFESSIONNEL', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const projetLines = pdf.splitTextToSize(analysis.projetProfessionnel, 170);
    pdf.text(projetLines, 20, yPosition);
    yPosition += projetLines.length * 5 + 10;

    // Étapes de mise en œuvre
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ÉTAPES DE MISE EN ŒUVRE', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const etapesLines = pdf.splitTextToSize(analysis.etapesMiseEnOeuvre, 170);
    pdf.text(etapesLines, 20, yPosition);

    pdf.save('bilan-competences.pdf');
    toast.success('PDF téléchargé avec succès !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                COMPÉTENCES TECHNIQUES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="competencesTechniques">Compétences techniques principales</Label>
                <Textarea
                  id="competencesTechniques"
                  placeholder="Ex: Programmation, comptabilité, marketing digital, gestion de projet..."
                  value={formData.competencesTechniques}
                  onChange={(e) => handleInputChange('competencesTechniques', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="domaines_expertise">Domaines d'expertise spécialisés</Label>
                <Textarea
                  id="domaines_expertise"
                  placeholder="Ex: Finance internationale, droit social, développement web..."
                  value={formData.domaines_expertise}
                  onChange={(e) => handleInputChange('domaines_expertise', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="outils_logiciels">Outils et logiciels maîtrisés</Label>
                <Textarea
                  id="outils_logiciels"
                  placeholder="Ex: Excel avancé, SAP, Photoshop, CRM Salesforce..."
                  value={formData.outils_logiciels}
                  onChange={(e) => handleInputChange('outils_logiciels', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications et formations diplômantes</Label>
                <Textarea
                  id="certifications"
                  placeholder="Ex: PMP, TOEIC, certifications Microsoft, formations continues..."
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                COMPÉTENCES TRANSVERSALES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="competencesRelationnelles">Compétences relationnelles</Label>
                <Textarea
                  id="competencesRelationnelles"
                  placeholder="Ex: Communication, négociation, travail en équipe, gestion de conflits..."
                  value={formData.competencesRelationnelles}
                  onChange={(e) => handleInputChange('competencesRelationnelles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="competencesOrganisationnelles">Compétences organisationnelles</Label>
                <Textarea
                  id="competencesOrganisationnelles"
                  placeholder="Ex: Planification, gestion du temps, méthodes de travail, rigueur..."
                  value={formData.competencesOrganisationnelles}
                  onChange={(e) => handleInputChange('competencesOrganisationnelles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="competencesLeadership">Compétences de leadership</Label>
                <Textarea
                  id="competencesLeadership"
                  placeholder="Ex: Management d'équipe, prise de décision, vision stratégique..."
                  value={formData.competencesLeadership}
                  onChange={(e) => handleInputChange('competencesLeadership', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="competencesCreatives">Compétences créatives et d'innovation</Label>
                <Textarea
                  id="competencesCreatives"
                  placeholder="Ex: Créativité, résolution de problèmes, innovation, design thinking..."
                  value={formData.competencesCreatives}
                  onChange={(e) => handleInputChange('competencesCreatives', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                MOTIVATIONS ET VALEURS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="valeursPrincipales">Vos valeurs principales au travail</Label>
                <Textarea
                  id="valeursPrincipales"
                  placeholder="Ex: Autonomie, collaboration, innovation, éthique, reconnaissance..."
                  value={formData.valeursPrincipales}
                  onChange={(e) => handleInputChange('valeursPrincipales', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sourcesSatisfaction">Sources de satisfaction professionnelle</Label>
                <Textarea
                  id="sourcesSatisfaction"
                  placeholder="Ex: Aider les autres, résoudre des problèmes complexes, créer, diriger..."
                  value={formData.sourcesSatisfaction}
                  onChange={(e) => handleInputChange('sourcesSatisfaction', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="environnementTravail">Environnement de travail idéal</Label>
                <Textarea
                  id="environnementTravail"
                  placeholder="Ex: Équipe dynamique, télétravail, start-up, grande entreprise, international..."
                  value={formData.environnementTravail}
                  onChange={(e) => handleInputChange('environnementTravail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="equilibreViePerso">Équilibre vie professionnelle/personnelle</Label>
                <Textarea
                  id="equilibreViePerso"
                  placeholder="Ex: Priorités familiales, loisirs importants, flexibilité horaires..."
                  value={formData.equilibreViePerso}
                  onChange={(e) => handleInputChange('equilibreViePerso', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                APTITUDES ET CENTRES D'INTÉRÊT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="activitesStimulantes">Activités qui vous stimulent le plus</Label>
                <Textarea
                  id="activitesStimulantes"
                  placeholder="Ex: Analyser des données, former des équipes, négocier, créer du contenu..."
                  value={formData.activitesStimulantes}
                  onChange={(e) => handleInputChange('activitesStimulantes', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stylesApprentissage">Styles d'apprentissage préférés</Label>
                <Textarea
                  id="stylesApprentissage"
                  placeholder="Ex: Apprentissage pratique, lecture, formation en groupe, mentorat..."
                  value={formData.stylesApprentissage}
                  onChange={(e) => handleInputChange('stylesApprentissage', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="defisMotivants">Défis professionnels motivants</Label>
                <Textarea
                  id="defisMotivants"
                  placeholder="Ex: Transformation digitale, développement à l'international, innovation..."
                  value={formData.defisMotivants}
                  onChange={(e) => handleInputChange('defisMotivants', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="secteursPreferes">Secteurs d'activité préférés</Label>
                <Textarea
                  id="secteursPreferes"
                  placeholder="Ex: Technologie, santé, éducation, finance, environnement..."
                  value={formData.secteursPreferes}
                  onChange={(e) => handleInputChange('secteursPreferes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                PROJET PROFESSIONNEL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="objectifsCarriere">Objectifs de carrière à moyen/long terme</Label>
                <Textarea
                  id="objectifsCarriere"
                  placeholder="Ex: Devenir manager, créer son entreprise, se spécialiser dans un domaine..."
                  value={formData.objectifsCarriere}
                  onChange={(e) => handleInputChange('objectifsCarriere', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contraintesPersonnelles">Contraintes personnelles à considérer</Label>
                <Textarea
                  id="contraintesPersonnelles"
                  placeholder="Ex: Mobilité géographique, contraintes familiales, budget formation..."
                  value={formData.contraintesPersonnelles}
                  onChange={(e) => handleInputChange('contraintesPersonnelles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="formationsEnvisagees">Formations ou reconversions envisagées</Label>
                <Textarea
                  id="formationsEnvisagees"
                  placeholder="Ex: MBA, formation certifiante, reconversion complète, VAE..."
                  value={formData.formationsEnvisagees}
                  onChange={(e) => handleInputChange('formationsEnvisagees', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="horizonTemporel">Horizon temporel de votre projet</Label>
                <Textarea
                  id="horizonTemporel"
                  placeholder="Ex: Dans 6 mois, 1 an, 2-3 ans, horizon flexible..."
                  value={formData.horizonTemporel}
                  onChange={(e) => handleInputChange('horizonTemporel', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Votre Bilan de Compétences</CardTitle>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-3">SYNTHÈSE DES COMPÉTENCES</h3>
                      <p className="text-sm text-blue-700">{analysis.syntheseCompetences}</p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-3">PROFIL MOTIVATIONNEL</h3>
                      <p className="text-sm text-red-700">{analysis.profilMotivationnel}</p>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">RECOMMANDATIONS DE CARRIÈRE</h3>
                      <p className="text-sm text-green-700">{analysis.recommandationsCarriere}</p>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-3">PLAN DE FORMATION</h3>
                      <p className="text-sm text-orange-700">{analysis.planFormation}</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-3">PROJET PROFESSIONNEL</h3>
                      <p className="text-sm text-purple-700">{analysis.projetProfessionnel}</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">ÉTAPES DE MISE EN ŒUVRE</h3>
                      <p className="text-sm text-gray-700">{analysis.etapesMiseEnOeuvre}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 mx-auto"
          >
            <Home className="h-4 w-4" />
            Retour accueil
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bilan de Compétences
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            France / Europe - Méthode structurée et encadrée légalement
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Analyse des compétences, motivations, valeurs et aptitudes. 
            Débouche sur un projet professionnel ou de formation réaliste.
          </p>
        </div>

        {currentStep < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep} sur 5
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 5) * 100)}% complété
              </span>
            </div>
            <Progress value={(currentStep / 5) * 100} className="w-full" />
          </div>
        )}

        {renderStep()}

        {currentStep < 6 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={() => {
                  if (validateCurrentStep()) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    toast.error('Veuillez remplir tous les champs de cette section');
                  }
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={generateAnalysis}
                disabled={isLoading}
              >
                {isLoading ? 'Génération en cours...' : 'Générer le bilan'}
              </Button>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">À propos du Bilan de Compétences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600 mb-2">👉 Points forts :</h4>
              <p className="text-gray-600">Rigueur, cadre officiel, financements possibles (CPF en France).</p>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">👉 Limites :</h4>
              <p className="text-gray-600">Parfois trop scolaire ou administratif.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BilanCompetencesPage;