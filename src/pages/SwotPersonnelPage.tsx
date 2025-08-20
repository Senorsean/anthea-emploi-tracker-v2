import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, Target, TrendingUp, Shield, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const SwotPersonnelPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Forces internes
    competencesTechniques: '',
    qualitesPersonnelles: '',
    experiences: '',
    reseauProfessionnel: '',
    
    // Faiblesses internes
    competencesAmeliorer: '',
    traitsLimitants: '',
    manqueExperience: '',
    freinsPersonnels: '',
    
    // Opportunités externes
    tendancesSecteur: '',
    nouvellesTechnologies: '',
    reseauEtContacts: '',
    formationsCertifications: '',
    
    // Menaces externes
    concurrenceMarche: '',
    automationIA: '',
    instabiliteSecteur: '',
    contraintesEconomiques: ''
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
      const { data, error } = await supabase.functions.invoke('generate-swot-analysis', {
        body: { responses: formData }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(5);
      toast.success('Analyse SWOT générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.competencesTechniques && formData.qualitesPersonnelles && 
               formData.experiences && formData.reseauProfessionnel;
      case 2:
        return formData.competencesAmeliorer && formData.traitsLimitants && 
               formData.manqueExperience && formData.freinsPersonnels;
      case 3:
        return formData.tendancesSecteur && formData.nouvellesTechnologies && 
               formData.reseauEtContacts && formData.formationsCertifications;
      case 4:
        return formData.concurrenceMarche && formData.automationIA && 
               formData.instabiliteSecteur && formData.contraintesEconomiques;
      default:
        return true;
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'Analyse SWOT Personnelle');

    // Introduction
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Analyse SWOT Personnelle', 20, yPosition);
    yPosition += 20;

    // Forces
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FORCES (Atouts internes)', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const forcesLines = pdf.splitTextToSize(analysis.forces, 170);
    pdf.text(forcesLines, 20, yPosition);
    yPosition += forcesLines.length * 5 + 10;

    // Faiblesses
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FAIBLESSES (Points d\'amélioration)', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const faiblessesLines = pdf.splitTextToSize(analysis.faiblesses, 170);
    pdf.text(faiblessesLines, 20, yPosition);
    yPosition += faiblessesLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Opportunités
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OPPORTUNITÉS (Environnement favorable)', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const opportunitesLines = pdf.splitTextToSize(analysis.opportunites, 170);
    pdf.text(opportunitesLines, 20, yPosition);
    yPosition += opportunitesLines.length * 5 + 10;

    // Menaces
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MENACES (Risques externes)', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const menacesLines = pdf.splitTextToSize(analysis.menaces, 170);
    pdf.text(menacesLines, 20, yPosition);
    yPosition += menacesLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Stratégies recommandées
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STRATÉGIES RECOMMANDÉES', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const strategiesLines = pdf.splitTextToSize(analysis.strategies, 170);
    pdf.text(strategiesLines, 20, yPosition);
    yPosition += strategiesLines.length * 5 + 10;

    // Plan d'action
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PLAN D\'ACTION', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const planLines = pdf.splitTextToSize(analysis.planAction, 170);
    pdf.text(planLines, 20, yPosition);

    pdf.save('analyse-swot-personnelle.pdf');
    toast.success('PDF téléchargé avec succès !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                FORCES - Vos atouts internes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="competencesTechniques">Compétences techniques et savoir-faire</Label>
                <Textarea
                  id="competencesTechniques"
                  placeholder="Ex: Maîtrise des outils digitaux, expertise en gestion de projet..."
                  value={formData.competencesTechniques}
                  onChange={(e) => handleInputChange('competencesTechniques', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qualitesPersonnelles">Qualités personnelles et soft skills</Label>
                <Textarea
                  id="qualitesPersonnelles"
                  placeholder="Ex: Leadership, créativité, capacité d'adaptation..."
                  value={formData.qualitesPersonnelles}
                  onChange={(e) => handleInputChange('qualitesPersonnelles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="experiences">Expériences et réalisations marquantes</Label>
                <Textarea
                  id="experiences"
                  placeholder="Ex: Projets réussis, promotions, reconnaissances..."
                  value={formData.experiences}
                  onChange={(e) => handleInputChange('experiences', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reseauProfessionnel">Réseau professionnel et relations</Label>
                <Textarea
                  id="reseauProfessionnel"
                  placeholder="Ex: Contacts dans votre secteur, mentors, partenaires..."
                  value={formData.reseauProfessionnel}
                  onChange={(e) => handleInputChange('reseauProfessionnel', e.target.value)}
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
                <Target className="h-5 w-5 text-orange-500" />
                FAIBLESSES - Points d'amélioration internes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="competencesAmeliorer">Compétences à développer ou manquantes</Label>
                <Textarea
                  id="competencesAmeliorer"
                  placeholder="Ex: Compétences digitales, langues étrangères, certifications..."
                  value={formData.competencesAmeliorer}
                  onChange={(e) => handleInputChange('competencesAmeliorer', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="traitsLimitants">Traits de personnalité limitants</Label>
                <Textarea
                  id="traitsLimitants"
                  placeholder="Ex: Manque de confiance, perfectionnisme excessif, difficulté à déléguer..."
                  value={formData.traitsLimitants}
                  onChange={(e) => handleInputChange('traitsLimitants', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="manqueExperience">Manque d'expérience dans certains domaines</Label>
                <Textarea
                  id="manqueExperience"
                  placeholder="Ex: Management d'équipe, international, secteurs spécifiques..."
                  value={formData.manqueExperience}
                  onChange={(e) => handleInputChange('manqueExperience', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="freinsPersonnels">Freins personnels ou contraintes</Label>
                <Textarea
                  id="freinsPersonnels"
                  placeholder="Ex: Mobilité limitée, contraintes familiales, peur du changement..."
                  value={formData.freinsPersonnels}
                  onChange={(e) => handleInputChange('freinsPersonnels', e.target.value)}
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
                <TrendingUp className="h-5 w-5 text-blue-500" />
                OPPORTUNITÉS - Environnement externe favorable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tendancesSecteur">Tendances favorables dans votre secteur</Label>
                <Textarea
                  id="tendancesSecteur"
                  placeholder="Ex: Croissance du secteur, nouvelles réglementations favorables..."
                  value={formData.tendancesSecteur}
                  onChange={(e) => handleInputChange('tendancesSecteur', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nouvellesTechnologies">Nouvelles technologies et innovations</Label>
                <Textarea
                  id="nouvellesTechnologies"
                  placeholder="Ex: IA, digitalisation, nouveaux outils qui peuvent vous aider..."
                  value={formData.nouvellesTechnologies}
                  onChange={(e) => handleInputChange('nouvellesTechnologies', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reseauEtContacts">Réseau et contacts à exploiter</Label>
                <Textarea
                  id="reseauEtContacts"
                  placeholder="Ex: Anciens collègues, événements networking, communautés professionnelles..."
                  value={formData.reseauEtContacts}
                  onChange={(e) => handleInputChange('reseauEtContacts', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="formationsCertifications">Formations et certifications accessibles</Label>
                <Textarea
                  id="formationsCertifications"
                  placeholder="Ex: MOOCs, formations entreprise, certifications professionnelles..."
                  value={formData.formationsCertifications}
                  onChange={(e) => handleInputChange('formationsCertifications', e.target.value)}
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
                <AlertTriangle className="h-5 w-5 text-red-500" />
                MENACES - Risques externes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="concurrenceMarche">Concurrence sur le marché du travail</Label>
                <Textarea
                  id="concurrenceMarche"
                  placeholder="Ex: Candidats plus jeunes/expérimentés, offshoring..."
                  value={formData.concurrenceMarche}
                  onChange={(e) => handleInputChange('concurrenceMarche', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="automationIA">Automatisation et IA dans votre domaine</Label>
                <Textarea
                  id="automationIA"
                  placeholder="Ex: Risque de remplacement par l'IA, automatisation des tâches..."
                  value={formData.automationIA}
                  onChange={(e) => handleInputChange('automationIA', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instabiliteSecteur">Instabilité économique du secteur</Label>
                <Textarea
                  id="instabiliteSecteur"
                  placeholder="Ex: Récession, restructurations, évolution des besoins..."
                  value={formData.instabiliteSecteur}
                  onChange={(e) => handleInputChange('instabiliteSecteur', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contraintesEconomiques">Contraintes économiques et sociales</Label>
                <Textarea
                  id="contraintesEconomiques"
                  placeholder="Ex: Inflation, coût des formations, évolution des attentes employeurs..."
                  value={formData.contraintesEconomiques}
                  onChange={(e) => handleInputChange('contraintesEconomiques', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Votre Analyse SWOT Personnelle</CardTitle>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4" />
                            FORCES
                          </h3>
                          <p className="text-sm text-green-700">{analysis.forces}</p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4" />
                            OPPORTUNITÉS
                          </h3>
                          <p className="text-sm text-blue-700">{analysis.opportunites}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h3 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                            <Target className="h-4 w-4" />
                            FAIBLESSES
                          </h3>
                          <p className="text-sm text-orange-700">{analysis.faiblesses}</p>
                        </div>
                        
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4" />
                            MENACES
                          </h3>
                          <p className="text-sm text-red-700">{analysis.menaces}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-3">STRATÉGIES RECOMMANDÉES</h3>
                      <p className="text-sm text-purple-700">{analysis.strategies}</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">PLAN D'ACTION</h3>
                      <p className="text-sm text-gray-700">{analysis.planAction}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
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
            SWOT Personnel
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Analysez vos Forces, Faiblesses, Opportunités et Menaces
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Issu du management stratégique, adapté à l'individu. Forces & faiblesses = interne (compétences, personnalité). 
            Opportunités & menaces = externe (marché, secteur, tendances).
          </p>
        </div>

        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep} sur 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 4) * 100)}% complété
              </span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="w-full" />
          </div>
        )}

        {renderStep()}

        {currentStep < 5 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep < 4 ? (
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
                {isLoading ? 'Génération en cours...' : 'Générer l\'analyse'}
              </Button>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">À propos du SWOT Personnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600 mb-2">👉 Points forts :</h4>
              <p className="text-gray-600">Clarté immédiate, adapté aux profils stratégiques.</p>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">👉 Limites :</h4>
              <p className="text-gray-600">Plus analytique que réflexif (ne touche pas forcément au sens profond).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwotPersonnelPage;