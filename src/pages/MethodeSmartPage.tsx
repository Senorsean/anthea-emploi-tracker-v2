import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, Target, Calendar, TrendingUp, CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const MethodeSmartPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Objectif principal SMART
    objectifPrincipal: '',
    specifique: '',
    mesurable: '',
    atteignable: '',
    realiste: '',
    temporel: '',
    
    // Sous-objectifs et étapes
    sousObjectif1: '',
    sousObjectif2: '',
    sousObjectif3: '',
    etapesAction: '',
    
    // Métriques et indicateurs
    indicateursSucces: '',
    metriquesQuantitatives: '',
    jalonsImportants: '',
    frequenceEvaluation: '',
    
    // Plan d'action temporel
    echeanceCourt: '',
    echeanceMoyen: '',
    echeanceLong: '',
    planContingence: ''
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
      const { data, error } = await supabase.functions.invoke('generate-smart-okr-analysis', {
        body: { responses: formData }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(5);
      toast.success('Analyse SMART/OKR générée avec succès !');
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
        return formData.objectifPrincipal && formData.specifique && 
               formData.mesurable && formData.atteignable && 
               formData.realiste && formData.temporel;
      case 2:
        return formData.sousObjectif1 && formData.sousObjectif2 && 
               formData.sousObjectif3 && formData.etapesAction;
      case 3:
        return formData.indicateursSucces && formData.metriquesQuantitatives && 
               formData.jalonsImportants && formData.frequenceEvaluation;
      case 4:
        return formData.echeanceCourt && formData.echeanceMoyen && 
               formData.echeanceLong && formData.planContingence;
      default:
        return true;
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'Méthode SMART/OKR - Objectifs de Carrière');

    // Introduction
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Plan SMART/OKR de Carrière', 20, yPosition);
    yPosition += 20;

    // Objectif principal analysé
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBJECTIF PRINCIPAL SMART', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const objectifLines = pdf.splitTextToSize(analysis.objectifPrincipal, 170);
    pdf.text(objectifLines, 20, yPosition);
    yPosition += objectifLines.length * 5 + 10;

    // Plan d'action
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PLAN D\'ACTION STRUCTURÉ', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const planLines = pdf.splitTextToSize(analysis.planAction, 170);
    pdf.text(planLines, 20, yPosition);
    yPosition += planLines.length * 5 + 10;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Métriques de suivi
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MÉTRIQUES ET SUIVI', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const metriquesLines = pdf.splitTextToSize(analysis.metriques, 170);
    pdf.text(metriquesLines, 20, yPosition);
    yPosition += metriquesLines.length * 5 + 10;

    // Calendrier d'exécution
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CALENDRIER D\'EXÉCUTION', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const calendrierLines = pdf.splitTextToSize(analysis.calendrier, 170);
    pdf.text(calendrierLines, 20, yPosition);
    yPosition += calendrierLines.length * 5 + 10;

    // Recommandations
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECOMMANDATIONS', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const recommandationsLines = pdf.splitTextToSize(analysis.recommandations, 170);
    pdf.text(recommandationsLines, 20, yPosition);

    pdf.save('methode-smart-okr-carriere.pdf');
    toast.success('PDF téléchargé avec succès !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Objectif Principal SMART
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="objectifPrincipal">Votre objectif professionnel principal</Label>
                <Textarea
                  id="objectifPrincipal"
                  placeholder="Ex: Devenir directeur marketing dans une entreprise tech d'ici 3 ans..."
                  value={formData.objectifPrincipal}
                  onChange={(e) => handleInputChange('objectifPrincipal', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="specifique">Spécifique - Précisez votre objectif</Label>
                <Textarea
                  id="specifique"
                  placeholder="Ex: Obtenir un poste de directeur marketing digital dans une startup B2B..."
                  value={formData.specifique}
                  onChange={(e) => handleInputChange('specifique', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mesurable">Mesurable - Comment mesurer votre réussite ?</Label>
                <Textarea
                  id="mesurable"
                  placeholder="Ex: Salaire de 80k€, équipe de 5 personnes, budget marketing de 500k€..."
                  value={formData.mesurable}
                  onChange={(e) => handleInputChange('mesurable', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="atteignable">Atteignable - Pourquoi est-ce possible ?</Label>
                <Textarea
                  id="atteignable"
                  placeholder="Ex: J'ai 5 ans d'expérience marketing, formation en digital, réseau dans le secteur..."
                  value={formData.atteignable}
                  onChange={(e) => handleInputChange('atteignable', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="realiste">Réaliste - Quelles sont vos contraintes ?</Label>
                <Textarea
                  id="realiste"
                  placeholder="Ex: Mobilité géographique limitée, besoin de formation complémentaire..."
                  value={formData.realiste}
                  onChange={(e) => handleInputChange('realiste', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="temporel">Temporel - Échéance précise</Label>
                <Textarea
                  id="temporel"
                  placeholder="Ex: D'ici décembre 2027, avec étapes intermédiaires tous les 6 mois..."
                  value={formData.temporel}
                  onChange={(e) => handleInputChange('temporel', e.target.value)}
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
                <CheckCircle className="h-5 w-5 text-green-500" />
                Sous-objectifs et Étapes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sousObjectif1">Sous-objectif 1 (Court terme - 6 mois)</Label>
                <Textarea
                  id="sousObjectif1"
                  placeholder="Ex: Obtenir une certification Google Ads et Analytics..."
                  value={formData.sousObjectif1}
                  onChange={(e) => handleInputChange('sousObjectif1', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sousObjectif2">Sous-objectif 2 (Moyen terme - 18 mois)</Label>
                <Textarea
                  id="sousObjectif2"
                  placeholder="Ex: Être promu senior marketing manager avec plus de responsabilités..."
                  value={formData.sousObjectif2}
                  onChange={(e) => handleInputChange('sousObjectif2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sousObjectif3">Sous-objectif 3 (Long terme - 3 ans)</Label>
                <Textarea
                  id="sousObjectif3"
                  placeholder="Ex: Développer une expertise en marketing automation et AI..."
                  value={formData.sousObjectif3}
                  onChange={(e) => handleInputChange('sousObjectif3', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="etapesAction">Actions concrètes pour chaque étape</Label>
                <Textarea
                  id="etapesAction"
                  placeholder="Ex: S'inscrire aux formations, identifier les entreprises cibles, développer son réseau LinkedIn..."
                  value={formData.etapesAction}
                  onChange={(e) => handleInputChange('etapesAction', e.target.value)}
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
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Métriques et Indicateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="indicateursSucces">Indicateurs de succès qualitatifs</Label>
                <Textarea
                  id="indicateursSucces"
                  placeholder="Ex: Reconnaissance par les pairs, feedback positif, satisfaction au travail..."
                  value={formData.indicateursSucces}
                  onChange={(e) => handleInputChange('indicateursSucces', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="metriquesQuantitatives">Métriques quantitatives</Label>
                <Textarea
                  id="metriquesQuantitatives"
                  placeholder="Ex: Nombre de formations suivies, augmentation salariale, taille de l'équipe..."
                  value={formData.metriquesQuantitatives}
                  onChange={(e) => handleInputChange('metriquesQuantitatives', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jalonsImportants">Jalons et étapes importantes</Label>
                <Textarea
                  id="jalonsImportants"
                  placeholder="Ex: Entretiens annuels, certifications obtenues, promotions internes..."
                  value={formData.jalonsImportants}
                  onChange={(e) => handleInputChange('jalonsImportants', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="frequenceEvaluation">Fréquence d'évaluation</Label>
                <Textarea
                  id="frequenceEvaluation"
                  placeholder="Ex: Bilan mensuel, revue trimestrielle des objectifs, ajustements semestriels..."
                  value={formData.frequenceEvaluation}
                  onChange={(e) => handleInputChange('frequenceEvaluation', e.target.value)}
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
                <Calendar className="h-5 w-5 text-orange-500" />
                Plan d'Action Temporel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="echeanceCourt">Échéance court terme (3-6 mois)</Label>
                <Textarea
                  id="echeanceCourt"
                  placeholder="Ex: Finaliser la formation Google Ads, postuler à 2 postes seniors..."
                  value={formData.echeanceCourt}
                  onChange={(e) => handleInputChange('echeanceCourt', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="echeanceMoyen">Échéance moyen terme (6-18 mois)</Label>
                <Textarea
                  id="echeanceMoyen"
                  placeholder="Ex: Obtenir une promotion, développer une expertise en IA marketing..."
                  value={formData.echeanceMoyen}
                  onChange={(e) => handleInputChange('echeanceMoyen', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="echeanceLong">Échéance long terme (1-3 ans)</Label>
                <Textarea
                  id="echeanceLong"
                  placeholder="Ex: Décrocher le poste de directeur marketing, constituer une équipe..."
                  value={formData.echeanceLong}
                  onChange={(e) => handleInputChange('echeanceLong', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="planContingence">Plan de contingence et alternatives</Label>
                <Textarea
                  id="planContingence"
                  placeholder="Ex: Si promotion interne impossible, cibler des opportunités externes, envisager le consulting..."
                  value={formData.planContingence}
                  onChange={(e) => handleInputChange('planContingence', e.target.value)}
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
                <CardTitle>Votre Plan SMART/OKR de Carrière</CardTitle>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter en PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4" />
                          OBJECTIF PRINCIPAL SMART
                        </h3>
                        <p className="text-sm text-blue-700">{analysis.objectifPrincipal}</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                          <CheckCircle className="h-4 w-4" />
                          PLAN D'ACTION STRUCTURÉ
                        </h3>
                        <p className="text-sm text-green-700">{analysis.planAction}</p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4" />
                          MÉTRIQUES ET SUIVI
                        </h3>
                        <p className="text-sm text-purple-700">{analysis.metriques}</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h3 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4" />
                          CALENDRIER D'EXÉCUTION
                        </h3>
                        <p className="text-sm text-orange-700">{analysis.calendrier}</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          RECOMMANDATIONS PERSONNALISÉES
                        </h3>
                        <p className="text-sm text-gray-700">{analysis.recommandations}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
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
            Méthode SMART / OKR appliquée à la carrière
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Définir un objectif professionnel clair et actionnable
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Définir un objectif professionnel clair (Spécifique, Mesurable, Atteignable, Réaliste, Temporel). 
            Puis découper en sous-objectifs comme dans la gestion de projet.
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
                {isLoading ? 'Génération en cours...' : 'Générer l\'analyse SMART/OKR'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodeSmartPage;