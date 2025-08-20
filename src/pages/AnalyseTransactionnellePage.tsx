import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

const questions = [
  {
    category: "Sois parfait",
    items: [
      "Je ressens le besoin de tout faire parfaitement au travail",
      "J'ai du mal à déléguer car j'ai peur que ce ne soit pas fait correctement",
      "Je passe beaucoup de temps sur les détails",
      "Je me sens stressé(e) quand les choses ne sont pas parfaites",
      "J'ai tendance à critiquer mon propre travail même quand il est bien fait"
    ]
  },
  {
    category: "Fais plaisir",
    items: [
      "J'ai du mal à dire non aux demandes de mes collègues",
      "Je ressens le besoin d'être apprécié(e) par tout le monde",
      "J'évite les conflits même quand c'est nécessaire",
      "Je me sens responsable du bien-être de mes collègues",
      "J'ai tendance à m'excuser souvent"
    ]
  },
  {
    category: "Sois fort",
    items: [
      "Je préfère ne pas montrer mes émotions au travail",
      "J'ai du mal à demander de l'aide même quand j'en ai besoin",
      "Je reste stoïque face aux difficultés",
      "J'évite de parler de mes problèmes personnels",
      "Je pense qu'il faut être indépendant(e) pour réussir"
    ]
  },
  {
    category: "Dépêche-toi",
    items: [
      "Je me sens toujours pressé(e) même quand ce n'est pas nécessaire",
      "J'ai du mal à prendre le temps de réfléchir avant d'agir",
      "Je ressens de l'impatience quand les autres prennent du temps",
      "Je préfère faire plusieurs choses à la fois",
      "Je me sens coupable quand je me repose"
    ]
  },
  {
    category: "Fais des efforts",
    items: [
      "Je pense qu'il faut toujours travailler dur pour mériter le succès",
      "J'ai du mal à accepter que les choses puissent être faciles",
      "Je ressens le besoin de prouver ma valeur en permanence",
      "Je me sens coupable quand quelque chose me paraît trop simple",
      "Je pense que la souffrance est nécessaire pour progresser"
    ]
  }
];

interface FormData {
  [key: string]: string;
}

interface AnalysisResult {
  dominantDrivers: Array<{
    driver: string;
    score: number;
    description: string;
  }>;
  professionalImpact: {
    strengths: string[];
    blockages: string[];
    opportunities: string[];
  };
  actionPlan: Array<{
    driver: string;
    actions: string[];
  }>;
  coaching_tips: string[];
  reflection_questions: string[];
}

export const AnalyseTransactionnellePage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnswerChange = (questionKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleNext = () => {
    const currentQuestions = questions[currentStep].items;
    const categoryKey = questions[currentStep].category;
    
    const allAnswered = currentQuestions.every(question => 
      formData[`${categoryKey}_${question}`]
    );

    if (!allAnswered) {
      toast({
        title: "Réponses incomplètes",
        description: "Veuillez répondre à toutes les questions avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-transactional-analysis', {
        body: { formData }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analyse terminée !",
        description: "Votre analyse transactionnelle a été générée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    let yPosition = addAntheaHeader(doc, 'Analyse Transactionnelle & Drivers');

    // Les drivers dominants
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vos Drivers Dominants:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    analysis.dominantDrivers.forEach((driver) => {
      doc.text(`• ${driver.driver} (Score: ${driver.score}/100)`, 25, yPosition);
      yPosition += 7;
      const descLines = doc.splitTextToSize(driver.description, 160);
      doc.text(descLines, 30, yPosition);
      yPosition += descLines.length * 5 + 5;
    });

    yPosition += 10;

    // Impact professionnel
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Impact Professionnel:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Points forts:', 25, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    analysis.professionalImpact.strengths.forEach((strength) => {
      const lines = doc.splitTextToSize(`• ${strength}`, 160);
      doc.text(lines, 30, yPosition);
      yPosition += lines.length * 5 + 2;
    });

    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Blocages potentiels:', 25, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    analysis.professionalImpact.blockages.forEach((blockage) => {
      const lines = doc.splitTextToSize(`• ${blockage}`, 160);
      doc.text(lines, 30, yPosition);
      yPosition += lines.length * 5 + 2;
    });

    // Nouvelle page si nécessaire
    if (yPosition > 250) {
      doc.addPage();
      yPosition = addAntheaHeader(doc, 'Analyse Transactionnelle & Drivers');
    }

    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Opportunités:', 25, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    analysis.professionalImpact.opportunities.forEach((opportunity) => {
      const lines = doc.splitTextToSize(`• ${opportunity}`, 160);
      doc.text(lines, 30, yPosition);
      yPosition += lines.length * 5 + 2;
    });

    // Plan d'action
    if (yPosition > 220) {
      doc.addPage();
      yPosition = addAntheaHeader(doc, 'Analyse Transactionnelle & Drivers');
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Plan d\'Action:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    analysis.actionPlan.forEach((plan) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${plan.driver}:`, 25, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      plan.actions.forEach((action) => {
        const lines = doc.splitTextToSize(`• ${action}`, 160);
        doc.text(lines, 30, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 3;
    });

    doc.save('analyse-transactionnelle.pdf');
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (analysis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Votre Analyse Transactionnelle & Drivers
          </h1>
          <div className="flex gap-4 mb-6">
            <Button onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter en PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setAnalysis(null);
                setCurrentStep(0);
                setFormData({});
              }}
            >
              Refaire le test
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Drivers dominants */}
          <Card>
            <CardHeader>
              <CardTitle>Vos Drivers Dominants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.dominantDrivers.map((driver, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{driver.driver}</h3>
                      <span className="text-2xl font-bold text-primary">{driver.score}/100</span>
                    </div>
                    <p className="text-gray-600">{driver.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact professionnel */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Professionnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-green-600 mb-3">Points forts</h3>
                  <ul className="space-y-2">
                    {analysis.professionalImpact.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600">• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">Blocages potentiels</h3>
                  <ul className="space-y-2">
                    {analysis.professionalImpact.blockages.map((blockage, index) => (
                      <li key={index} className="text-sm text-gray-600">• {blockage}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600 mb-3">Opportunités</h3>
                  <ul className="space-y-2">
                    {analysis.professionalImpact.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-sm text-gray-600">• {opportunity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan d'action */}
          <Card>
            <CardHeader>
              <CardTitle>Plan d'Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.actionPlan.map((plan, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-3 text-primary">{plan.driver}</h3>
                    <ul className="space-y-2">
                      {plan.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="text-gray-600">• {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conseils coaching */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils de Coaching</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.coaching_tips.map((tip, index) => (
                  <li key={index} className="text-gray-600 border-l-2 border-gray-200 pl-4">
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Questions de réflexion */}
          <Card>
            <CardHeader>
              <CardTitle>Questions de Réflexion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.reflection_questions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">{question}</p>
                    <Textarea 
                      placeholder="Vos réflexions..."
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          L'Analyse Transactionnelle & Drivers
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Identifiez vos schémas inconscients et comprenez comment ils influencent vos choix et blocages professionnels.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                👉 <strong>Points forts :</strong> Puissant pour lever des freins internes<br/>
                👉 <strong>Limites :</strong> Plus psychologique, nécessite un coach formé
              </p>
            </div>
          </div>
        </div>
        <Progress value={progress} className="mb-4" />
        <p className="text-sm text-gray-500">
          Étape {currentStep + 1} sur {questions.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {questions[currentStep].category}
          </CardTitle>
          <p className="text-gray-600">
            Pour chaque affirmation, indiquez à quel point elle vous correspond.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions[currentStep].items.map((question, index) => {
            const questionKey = `${questions[currentStep].category}_${question}`;
            return (
              <div key={index} className="space-y-3">
                <p className="font-medium">{question}</p>
                <RadioGroup
                  value={formData[questionKey] || ''}
                  onValueChange={(value) => handleAnswerChange(questionKey, value)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`${questionKey}-1`} />
                    <Label htmlFor={`${questionKey}-1`}>Pas du tout</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id={`${questionKey}-2`} />
                    <Label htmlFor={`${questionKey}-2`}>Un peu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id={`${questionKey}-3`} />
                    <Label htmlFor={`${questionKey}-3`}>Modérément</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id={`${questionKey}-4`} />
                    <Label htmlFor={`${questionKey}-4`}>Beaucoup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id={`${questionKey}-5`} />
                    <Label htmlFor={`${questionKey}-5`}>Tout à fait</Label>
                  </div>
                </RadioGroup>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Précédent
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : currentStep === questions.length - 1 ? (
            'Générer l\'analyse'
          ) : (
            'Suivant'
          )}
        </Button>
      </div>
    </div>
  );
};