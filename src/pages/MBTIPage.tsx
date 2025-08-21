import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Home, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

interface Question {
  id: string;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  options: {
    value: string;
    label: string;
    type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  }[];
}

const questions: Question[] = [
  // Extraversion (E) vs Introversion (I)
  {
    id: 'q1',
    text: 'Dans un groupe, vous avez tendance à :',
    dimension: 'EI',
    options: [
      { value: '1', label: 'Prendre facilement la parole et animer les discussions', type: 'E' },
      { value: '2', label: 'Écouter d\'abord, puis contribuer de manière réfléchie', type: 'I' }
    ]
  },
  {
    id: 'q2',
    text: 'Vous rechargez vos batteries en :',
    dimension: 'EI',
    options: [
      { value: '1', label: 'Passant du temps avec des amis et en activités sociales', type: 'E' },
      { value: '2', label: 'Ayant du temps seul pour réfléchir et vous ressourcer', type: 'I' }
    ]
  },
  {
    id: 'q3',
    text: 'Lors de réunions, vous préférez :',
    dimension: 'EI',
    options: [
      { value: '1', label: 'Réfléchir à voix haute et développer vos idées en parlant', type: 'E' },
      { value: '2', label: 'Préparer vos interventions et réfléchir avant de parler', type: 'I' }
    ]
  },
  
  // Sensation (S) vs Intuition (N)
  {
    id: 'q4',
    text: 'Quand vous résolvez un problème, vous préférez :',
    dimension: 'SN',
    options: [
      { value: '1', label: 'Vous concentrer sur les faits concrets et les détails', type: 'S' },
      { value: '2', label: 'Explorer les possibilités et les connexions globales', type: 'N' }
    ]
  },
  {
    id: 'q5',
    text: 'Vous êtes plus à l\'aise avec :',
    dimension: 'SN',
    options: [
      { value: '1', label: 'Des instructions claires et des procédures établies', type: 'S' },
      { value: '2', label: 'La liberté d\'innover et d\'expérimenter de nouvelles approches', type: 'N' }
    ]
  },
  {
    id: 'q6',
    text: 'Au travail, vous préférez :',
    dimension: 'SN',
    options: [
      { value: '1', label: 'Des tâches pratiques avec des résultats mesurables', type: 'S' },
      { value: '2', label: 'Des projets conceptuels avec des défis créatifs', type: 'N' }
    ]
  },

  // Thinking (T) vs Feeling (F)
  {
    id: 'q7',
    text: 'Pour prendre une décision importante, vous :',
    dimension: 'TF',
    options: [
      { value: '1', label: 'Analysez logiquement les pour et les contre', type: 'T' },
      { value: '2', label: 'Considérez l\'impact sur les personnes impliquées', type: 'F' }
    ]
  },
  {
    id: 'q8',
    text: 'Vous êtes plus motivé par :',
    dimension: 'TF',
    options: [
      { value: '1', label: 'L\'efficacité et la performance objective', type: 'T' },
      { value: '2', label: 'L\'harmonie et le bien-être des équipes', type: 'F' }
    ]
  },
  {
    id: 'q9',
    text: 'En cas de conflit, vous avez tendance à :',
    dimension: 'TF',
    options: [
      { value: '1', label: 'Chercher une solution objective basée sur les faits', type: 'T' },
      { value: '2', label: 'Privilégier la compréhension mutuelle et la réconciliation', type: 'F' }
    ]
  },

  // Judging (J) vs Perceiving (P)
  {
    id: 'q10',
    text: 'Dans votre travail, vous préférez :',
    dimension: 'JP',
    options: [
      { value: '1', label: 'Planifier et suivre un calendrier structuré', type: 'J' },
      { value: '2', label: 'Garder vos options ouvertes et vous adapter', type: 'P' }
    ]
  },
  {
    id: 'q11',
    text: 'Face aux échéances, vous :',
    dimension: 'JP',
    options: [
      { value: '1', label: 'Aimez terminer les tâches bien avant la date limite', type: 'J' },
      { value: '2', label: 'Travaillez mieux sous pression, près de la deadline', type: 'P' }
    ]
  },
  {
    id: 'q12',
    text: 'Votre espace de travail est généralement :',
    dimension: 'JP',
    options: [
      { value: '1', label: 'Organisé avec chaque chose à sa place', type: 'J' },
      { value: '2', label: 'Créatif avec plusieurs projets en cours simultanément', type: 'P' }
    ]
  }
];

export default function MBTIPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 3;
  const questionsPerStep = 4;

  const getCurrentStepQuestions = () => {
    const startIndex = (currentStep - 1) * questionsPerStep;
    const endIndex = startIndex + questionsPerStep;
    return questions.slice(startIndex, endIndex);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const canProceedToNextStep = () => {
    const currentQuestions = getCurrentStepQuestions();
    return currentQuestions.every(q => answers[q.id]);
  };

  const calculateMBTIType = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const selectedOption = question.options.find(opt => opt.value === answer);
        if (selectedOption) {
          scores[selectedOption.type]++;
        }
      }
    });

    const type = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    return { type, scores };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { type, scores } = calculateMBTIType();
      
      const { data, error } = await supabase.functions.invoke('generate-mbti-analysis', {
        body: { 
          mbtiType: type,
          scores,
          answers: Object.entries(answers).map(([questionId, answerValue]) => {
            const question = questions.find(q => q.id === questionId);
            const selectedOption = question?.options.find(opt => opt.value === answerValue);
            return {
              question: question?.text,
              answer: selectedOption?.label,
              dimension: question?.dimension
            };
          })
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setCurrentStep(totalSteps + 1);
      
      toast({
        title: "Analyse terminée",
        description: "Votre profil MBTI a été généré avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération de l\'analyse MBTI:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'analyse.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = addAntheaHeader(pdf, 'MBTI - Myers-Briggs Type Indicator');

    const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, isBold ? 'bold' : 'normal');
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string, index: number) => {
        if (y + (index * 6) > pageHeight - margin) {
          pdf.addPage();
          y = addAntheaHeader(pdf, 'MBTI - Myers-Briggs Type Indicator');
        }
        pdf.text(line, x, y + (index * 6));
      });
      
      return y + (lines.length * 6);
    };

    const addSectionTitle = (title: string, y: number) => {
      const requiredHeight = 20;
      if (y + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        y = addAntheaHeader(pdf, 'MBTI - Myers-Briggs Type Indicator');
      }
      
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, margin, y);
      return y + 15;
    };

    const cleanedAnalysis = analysis
      .replace(/#{1,6}\s*[🎯📊🚀💡🔄Ø=ß¯]\s*/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[Øß¯=]+/g, '')
      .replace(/^\s*[-•]\s*/gm, '• ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 1)
      .join('\n');

    const sections = cleanedAnalysis.split(/(?=VOTRE TYPE MBTI|CARACTÉRISTIQUES PRINCIPALES|FORCES ET TALENTS|AXES DE DÉVELOPPEMENT|MÉTIERS RECOMMANDÉS|CONSEILS POUR VOTRE CARRIÈRE)/);

    sections.forEach((section, index) => {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        if (title) {
          yPosition = addSectionTitle(title, yPosition + 10);
        }
        if (content) {
          yPosition = addText(content, margin, yPosition + 5) + 10;
        }
      }
    });

    pdf.save('analyse-mbti.pdf');
    
    toast({
      title: "PDF exporté",
      description: "Votre analyse MBTI a été téléchargée avec succès.",
    });
  };

  if (currentStep === totalSteps + 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Retour accueil
            </Button>
            <Button
              onClick={exportToPDF}
              className="flex items-center gap-2"
              variant="default"
            >
              <Download className="w-4 h-4" />
              Exporter en PDF
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-blue-700">
                🧠 Votre Profil MBTI
              </CardTitle>
              <CardDescription className="text-center">
                Analyse complète de votre type de personnalité Myers-Briggs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700">
                  {analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="text-sm text-gray-600">
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-700">
              🧠 MBTI - Myers-Briggs Type Indicator
            </CardTitle>
            <CardDescription className="text-center">
              Découvrez votre type de personnalité sur 4 axes fondamentaux
            </CardDescription>
            <div className="mt-4">
              <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
            </div>
          </CardHeader>
          <CardContent>
            {currentStep <= totalSteps && (
              <>
                <div className="space-y-8">
                  {getCurrentStepQuestions().map((question) => (
                    <div key={question.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {question.text}
                      </h3>
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="space-y-3"
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-start space-x-3">
                            <RadioGroupItem 
                              value={option.value} 
                              id={`${question.id}-${option.value}`}
                              className="mt-1"
                            />
                            <Label 
                              htmlFor={`${question.id}-${option.value}`}
                              className="text-sm leading-relaxed cursor-pointer flex-1"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      disabled={!canProceedToNextStep()}
                      className="flex items-center gap-2"
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceedToNextStep() || isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? 'Analyse en cours...' : 'Générer mon profil MBTI'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}