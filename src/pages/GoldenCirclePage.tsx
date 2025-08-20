import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, Heart, Zap, Target, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const GoldenCirclePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Why - Raison d'être
    raisonEtre: '',
    valeursPrincipales: '',
    impactSouhaite: '',
    motivationProfonde: '',
    
    // How - Forces et méthodes
    forcesPersonnelles: '',
    methodesPreferees: '',
    stylesTravail: '',
    competencesUniques: '',
    
    // What - Activités concrètes
    activitesConcrete: '',
    secteursCibles: '',
    postesVises: '',
    projetsIdeaux: ''
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
      const { data, error } = await supabase.functions.invoke('generate-golden-circle-analysis', {
        body: { responses: formData }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(4);
      toast.success('Analyse Golden Circle générée avec succès !');
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
        return formData.raisonEtre && formData.valeursPrincipales && 
               formData.impactSouhaite && formData.motivationProfonde;
      case 2:
        return formData.forcesPersonnelles && formData.methodesPreferees && 
               formData.stylesTravail && formData.competencesUniques;
      case 3:
        return formData.activitesConcrete && formData.secteursCibles && 
               formData.postesVises && formData.projetsIdeaux;
      default:
        return true;
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'Golden Circle - Why, How, What');

    // Introduction
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Golden Circle Personnel', 20, yPosition);
    yPosition += 20;

    // Why
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('WHY - Votre Raison d\'Être', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const whyLines = pdf.splitTextToSize(analysis.why, 170);
    pdf.text(whyLines, 20, yPosition);
    yPosition += whyLines.length * 5 + 10;

    // How
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HOW - Vos Forces et Méthodes', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const howLines = pdf.splitTextToSize(analysis.how, 170);
    pdf.text(howLines, 20, yPosition);
    yPosition += howLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // What
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('WHAT - Vos Activités Concrètes', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const whatLines = pdf.splitTextToSize(analysis.what, 170);
    pdf.text(whatLines, 20, yPosition);
    yPosition += whatLines.length * 5 + 10;

    // Synthèse
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SYNTHÈSE ET RECOMMANDATIONS', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const syntheseLines = pdf.splitTextToSize(analysis.synthese, 170);
    pdf.text(syntheseLines, 20, yPosition);
    yPosition += syntheseLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Plan d'action
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PLAN D\'ACTION', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const planLines = pdf.splitTextToSize(analysis.planAction, 170);
    pdf.text(planLines, 20, yPosition);

    pdf.save('golden-circle-analyse.pdf');
    toast.success('PDF téléchargé avec succès !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                WHY - Votre Raison d'Être
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="raisonEtre">Quelle est votre raison d'être professionnelle ?</Label>
                <Textarea
                  id="raisonEtre"
                  placeholder="Ex: Aider les entreprises à devenir plus durables et responsables..."
                  value={formData.raisonEtre}
                  onChange={(e) => handleInputChange('raisonEtre', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="valeursPrincipales">Quelles sont vos valeurs principales ?</Label>
                <Textarea
                  id="valeursPrincipales"
                  placeholder="Ex: Authenticité, innovation, respect de l'environnement, équité..."
                  value={formData.valeursPrincipales}
                  onChange={(e) => handleInputChange('valeursPrincipales', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="impactSouhaite">Quel impact voulez-vous avoir dans le monde ?</Label>
                <Textarea
                  id="impactSouhaite"
                  placeholder="Ex: Contribuer à la transition écologique, améliorer la qualité de vie au travail..."
                  value={formData.impactSouhaite}
                  onChange={(e) => handleInputChange('impactSouhaite', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="motivationProfonde">Qu'est-ce qui vous motive vraiment chaque matin ?</Label>
                <Textarea
                  id="motivationProfonde"
                  placeholder="Ex: L'idée de résoudre des problèmes complexes, d'apprendre continuellement..."
                  value={formData.motivationProfonde}
                  onChange={(e) => handleInputChange('motivationProfonde', e.target.value)}
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
                <Zap className="h-5 w-5 text-yellow-500" />
                HOW - Vos Forces et Méthodes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="forcesPersonnelles">Quelles sont vos forces personnelles uniques ?</Label>
                <Textarea
                  id="forcesPersonnelles"
                  placeholder="Ex: Capacité d'écoute exceptionnelle, créativité, esprit analytique..."
                  value={formData.forcesPersonnelles}
                  onChange={(e) => handleInputChange('forcesPersonnelles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="methodesPreferees">Comment préférez-vous travailler et collaborer ?</Label>
                <Textarea
                  id="methodesPreferees"
                  placeholder="Ex: En équipe collaborative, avec des méthodes agiles, en autonomie..."
                  value={formData.methodesPreferees}
                  onChange={(e) => handleInputChange('methodesPreferees', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stylesTravail">Quel est votre style de travail distinctif ?</Label>
                <Textarea
                  id="stylesTravail"
                  placeholder="Ex: Approche systémique, focus sur l'humain, innovation constante..."
                  value={formData.stylesTravail}
                  onChange={(e) => handleInputChange('stylesTravail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="competencesUniques">Quelles compétences vous différencient ?</Label>
                <Textarea
                  id="competencesUniques"
                  placeholder="Ex: Maîtrise technique + vision business, multilinguisme, expertise sectorielle..."
                  value={formData.competencesUniques}
                  onChange={(e) => handleInputChange('competencesUniques', e.target.value)}
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
                <Target className="h-5 w-5 text-blue-500" />
                WHAT - Vos Activités Concrètes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="activitesConcrete">Quelles activités concrètes vous passionnent ?</Label>
                <Textarea
                  id="activitesConcrete"
                  placeholder="Ex: Concevoir des stratégies, former des équipes, développer des produits..."
                  value={formData.activitesConcrete}
                  onChange={(e) => handleInputChange('activitesConcrete', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="secteursCibles">Dans quels secteurs voulez-vous évoluer ?</Label>
                <Textarea
                  id="secteursCibles"
                  placeholder="Ex: Cleantech, santé digitale, édtech, fintech durable..."
                  value={formData.secteursCibles}
                  onChange={(e) => handleInputChange('secteursCibles', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postesVises">Quels types de postes vous attirent ?</Label>
                <Textarea
                  id="postesVises"
                  placeholder="Ex: Chef de projet RSE, Consultant en transformation digitale, Product Manager..."
                  value={formData.postesVises}
                  onChange={(e) => handleInputChange('postesVises', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projetsIdeaux">Décrivez vos projets professionnels idéaux</Label>
                <Textarea
                  id="projetsIdeaux"
                  placeholder="Ex: Lancer une startup à impact, diriger la transformation d'une ONG..."
                  value={formData.projetsIdeaux}
                  onChange={(e) => handleInputChange('projetsIdeaux', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Votre Golden Circle Personnel</CardTitle>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter en PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-4">
                          <Heart className="h-5 w-5" />
                          WHY - Votre Raison d'Être
                        </h3>
                        <p className="text-red-700 leading-relaxed">{analysis.why}</p>
                      </div>
                      
                      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 flex items-center gap-2 mb-4">
                          <Zap className="h-5 w-5" />
                          HOW - Vos Forces et Méthodes
                        </h3>
                        <p className="text-yellow-700 leading-relaxed">{analysis.how}</p>
                      </div>
                      
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-4">
                          <Target className="h-5 w-5" />
                          WHAT - Vos Activités Concrètes
                        </h3>
                        <p className="text-blue-700 leading-relaxed">{analysis.what}</p>
                      </div>
                      
                      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-4">
                          SYNTHÈSE ET COHÉRENCE
                        </h3>
                        <p className="text-green-700 leading-relaxed">{analysis.synthese}</p>
                      </div>
                      
                      <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-purple-800 mb-4">
                          PLAN D'ACTION RECOMMANDÉ
                        </h3>
                        <p className="text-purple-700 leading-relaxed">{analysis.planAction}</p>
                      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-4">
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
            Le Golden Circle de Simon Sinek
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Why – How – What : Trouvez votre raison d'être professionnelle
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Trouver son Why (raison d'être), puis son How (forces / méthodes), puis son What (activités concrètes). 
            Simple, très inspirant, bon complément de l'Ikigai.
          </p>
        </div>

        {currentStep < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep} sur 3
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 3) * 100)}% complété
              </span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="w-full" />
          </div>
        )}

        {renderStep()}

        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={() => {
                  if (validateCurrentStep()) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    toast.error('Veuillez remplir tous les champs requis');
                  }
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={generateAnalysis}
                disabled={isLoading || !validateCurrentStep()}
              >
                {isLoading ? 'Génération en cours...' : 'Générer l\'analyse Golden Circle'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoldenCirclePage;