import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, Anchor, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';
import { Slider } from '@/components/ui/slider';

const AncresCarrierePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    technique: 5,
    management: 5,
    autonomie: 5,
    securite: 5,
    creativite: 5,
    service: 5,
    defi: 5,
    styleVie: 5
  });

  const ancres = [
    {
      key: 'technique',
      title: 'Compétence Technique/Fonctionnelle 🔧',
      description: 'Développer et approfondir une expertise dans un domaine spécifique',
      question: 'À quel point est-il important pour vous de devenir un expert reconnu dans votre domaine technique ?'
    },
    {
      key: 'management',
      title: 'Compétence Managériale 👥',
      description: 'Diriger, coordonner et prendre des décisions stratégiques',
      question: 'Dans quelle mesure aspirez-vous à diriger des équipes et à avoir des responsabilités managériales ?'
    },
    {
      key: 'autonomie',
      title: 'Autonomie/Indépendance 🦅',
      description: 'Travailler de manière autonome, définir ses propres règles',
      question: 'À quel point avez-vous besoin de liberté et d\'indépendance dans votre travail ?'
    },
    {
      key: 'securite',
      title: 'Sécurité/Stabilité 🛡️',
      description: 'Privilégier la stabilité, la prévisibilité et la sécurité de l\'emploi',
      question: 'Dans quelle mesure la stabilité et la sécurité de l\'emploi sont-elles importantes pour vous ?'
    },
    {
      key: 'creativite',
      title: 'Créativité Entrepreneuriale 💡',
      description: 'Créer, innover et développer de nouveaux projets ou entreprises',
      question: 'À quel point êtes-vous motivé(e) par la création de nouveaux projets ou d\'entreprises ?'
    },
    {
      key: 'service',
      title: 'Service/Dévouement à une cause 🤝',
      description: 'Contribuer à améliorer le monde, aider les autres',
      question: 'Dans quelle mesure est-il important pour vous que votre travail serve une cause qui vous tient à cœur ?'
    },
    {
      key: 'defi',
      title: 'Défi Pur ⚡',
      description: 'Résoudre des problèmes difficiles, relever des défis complexes',
      question: 'À quel point êtes-vous motivé(e) par la résolution de problèmes complexes et les défis ?'
    },
    {
      key: 'styleVie',
      title: 'Style de Vie ⚖️',
      description: 'Équilibrer vie professionnelle et personnelle, flexibilité',
      question: 'Dans quelle mesure l\'équilibre vie pro/perso et la flexibilité sont-ils prioritaires pour vous ?'
    }
  ];

  const handleSliderChange = (key: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ancres-carriere-analysis', {
        body: { scores: formData }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(2);
      toast.success('Analyse des ancres de carrière générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'Ancres de Carrière de Schein');

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vos Ancres de Carrière', 20, yPosition);
    yPosition += 20;

    // Ancres dominantes
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ancres Dominantes', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const dominantesLines = pdf.splitTextToSize(analysis.ancresDominantes, 170);
    pdf.text(dominantesLines, 20, yPosition);
    yPosition += dominantesLines.length * 5 + 15;

    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Profil
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Profil de Carrière', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const profilLines = pdf.splitTextToSize(analysis.profilCarriere, 170);
    pdf.text(profilLines, 20, yPosition);
    yPosition += profilLines.length * 5 + 15;

    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Implications
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Implications Professionnelles', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const implicationsLines = pdf.splitTextToSize(analysis.implications, 170);
    pdf.text(implicationsLines, 20, yPosition);
    yPosition += implicationsLines.length * 5 + 15;

    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Recommandations
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommandations', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const recoLines = pdf.splitTextToSize(analysis.recommandations, 170);
    pdf.text(recoLines, 20, yPosition);

    pdf.save('ancres-carriere-analyse.pdf');
    toast.success('PDF téléchargé avec succès !');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Évaluez vos motivateurs de carrière
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Pour chaque ancre, évaluez son importance de 1 (pas important) à 10 (très important)
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {ancres.map((ancre) => (
                <div key={ancre.key} className="space-y-3">
                  <div>
                    <Label className="text-base font-semibold">{ancre.title}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{ancre.description}</p>
                    <p className="text-sm text-foreground mt-2 italic">{ancre.question}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">Pas du tout</span>
                    <Slider
                      value={[formData[ancre.key as keyof typeof formData]]}
                      onValueChange={(value) => handleSliderChange(ancre.key, value)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-16 text-right">Très important</span>
                    <span className="text-lg font-bold text-primary w-8 text-center">
                      {formData[ancre.key as keyof typeof formData]}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Votre Analyse des Ancres de Carrière</CardTitle>
                <Button onClick={downloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter en PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                        <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
                          <Anchor className="h-5 w-5" />
                          Vos Ancres Dominantes
                        </h3>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">{analysis.ancresDominantes}</p>
                      </div>
                      
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-4">
                          Votre Profil de Carrière
                        </h3>
                        <p className="text-blue-700 leading-relaxed whitespace-pre-line">{analysis.profilCarriere}</p>
                      </div>
                      
                      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-4">
                          Implications Professionnelles
                        </h3>
                        <p className="text-green-700 leading-relaxed whitespace-pre-line">{analysis.implications}</p>
                      </div>
                      
                      <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-purple-800 mb-4">
                          Recommandations
                        </h3>
                        <p className="text-purple-700 leading-relaxed whitespace-pre-line">{analysis.recommandations}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
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
            Ancres de Carrière de Schein 📍
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            8 motivateurs de carrière pour comprendre ce qui vous retient vraiment dans un emploi
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Les ancres de carrière identifient vos motivations profondes : compétence technique, management, 
            autonomie, sécurité, créativité entrepreneuriale, service à une cause, défi pur, ou style de vie.
          </p>
        </div>

        {currentStep < 2 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep} sur 1
              </span>
              <span className="text-sm text-gray-500">
                Évaluation des 8 ancres
              </span>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        )}

        {renderStep()}

        {currentStep < 2 && (
          <div className="flex justify-end mt-8">
            <Button
              onClick={generateAnalysis}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Génération en cours...' : 'Générer l\'analyse'}
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setAnalysis(null);
              }}
            >
              Refaire le test
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AncresCarrierePage;
