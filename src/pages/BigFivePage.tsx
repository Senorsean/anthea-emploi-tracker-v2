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
  dimension: 'O' | 'C' | 'E' | 'A' | 'N';
  reverse?: boolean;
}

const questions: Question[] = [
  // Ouverture (Openness)
  {
    id: 'q1',
    text: 'J\'aime découvrir de nouvelles idées et concepts',
    dimension: 'O'
  },
  {
    id: 'q2',
    text: 'Je préfère les routines familières aux nouveautés',
    dimension: 'O',
    reverse: true
  },
  {
    id: 'q3',
    text: 'J\'apprécie les discussions philosophiques et abstraites',
    dimension: 'O'
  },
  {
    id: 'q4',
    text: 'Je suis curieux de nombreux sujets différents',
    dimension: 'O'
  },
  // Conscienciosité (Conscientiousness)
  {
    id: 'q5',
    text: 'Je termine toujours ce que j\'ai commencé',
    dimension: 'C'
  },
  {
    id: 'q6',
    text: 'Je remets souvent les tâches importantes à plus tard',
    dimension: 'C',
    reverse: true
  },
  {
    id: 'q7',
    text: 'Je suis très organisé dans mon travail',
    dimension: 'C'
  },
  {
    id: 'q8',
    text: 'Je fais attention aux détails',
    dimension: 'C'
  },
  // Extraversion
  {
    id: 'q9',
    text: 'Je me sens énergisé par les interactions sociales',
    dimension: 'E'
  },
  {
    id: 'q10',
    text: 'Je préfère travailler seul plutôt qu\'en équipe',
    dimension: 'E',
    reverse: true
  },
  {
    id: 'q11',
    text: 'Je prends facilement la parole en public',
    dimension: 'E'
  },
  {
    id: 'q12',
    text: 'J\'aime être le centre d\'attention',
    dimension: 'E'
  },
  // Agréabilité (Agreeableness)
  {
    id: 'q13',
    text: 'Je fais confiance aux autres facilement',
    dimension: 'A'
  },
  {
    id: 'q14',
    text: 'Je suis souvent sceptique des intentions d\'autrui',
    dimension: 'A',
    reverse: true
  },
  {
    id: 'q15',
    text: 'J\'aime aider les autres, même si cela me coûte',
    dimension: 'A'
  },
  {
    id: 'q16',
    text: 'Je cherche à éviter les conflits',
    dimension: 'A'
  },
  // Neuroticisme (Neuroticism)
  {
    id: 'q17',
    text: 'Je m\'inquiète souvent pour des choses qui pourraient mal tourner',
    dimension: 'N'
  },
  {
    id: 'q18',
    text: 'Je reste calme même sous pression',
    dimension: 'N',
    reverse: true
  },
  {
    id: 'q19',
    text: 'Mes émotions changent rapidement',
    dimension: 'N'
  },
  {
    id: 'q20',
    text: 'Je me sens souvent stressé',
    dimension: 'N'
  }
];

const MBTIPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: parseInt(value)
    }));
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScores = () => {
    const dimensionScores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    
    questions.forEach(question => {
      const answer = answers[question.id] || 3;
      let score = answer;
      
      if (question.reverse) {
        score = 6 - answer;
      }
      
      dimensionScores[question.dimension] += score;
    });

    // Normaliser les scores sur 100 (4 questions par dimension, scores de 1-5, donc max = 20)
    Object.keys(dimensionScores).forEach(key => {
      dimensionScores[key] = Math.round((dimensionScores[key] / 20) * 100);
    });

    return dimensionScores;
  };

  const handleSubmit = async () => {
    const allAnswered = questions.every(q => answers[q.id] !== undefined);
    
    if (!allAnswered) {
      toast({
        title: "Questionnaire incomplet",
        description: "Veuillez répondre à toutes les questions avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedScores = calculateScores();
      setScores(calculatedScores);

      const { data, error } = await supabase.functions.invoke('generate-big-five-analysis', {
        body: {
          scores: calculatedScores,
          answers: answers
        }
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      setShowResults(true);
      
      toast({
        title: "Analyse terminée !",
        description: "Votre profil Big Five a été généré avec succès.",
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'analyse.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    const startY = addAntheaHeader(pdf, 'Rapport Big Five / OCEAN');
    let currentY = startY + 10;
    
    // Titre du rapport
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Votre Profil Big Five / OCEAN', 20, currentY);
    currentY += 20;
    
    // Scores
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vos Scores:', 20, currentY);
    currentY += 15;
    
    const dimensionNames: Record<string, string> = {
      O: 'Ouverture',
      C: 'Conscienciosité', 
      E: 'Extraversion',
      A: 'Agréabilité',
      N: 'Neuroticisme'
    };
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(scores).forEach(([dim, score]) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 30;
      }
      pdf.text(`${dimensionNames[dim]}: ${score}/100`, 20, currentY);
      currentY += 10;
    });
    
    currentY += 10;
    
    // Analyse
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    if (currentY > 250) {
      pdf.addPage();
      currentY = 30;
    }
    pdf.text('Analyse Détaillée:', 20, currentY);
    currentY += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Nettoyer et structurer le texte
    const cleanText = analysisResult
      .replace(/[#*`]/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    const lines = pdf.splitTextToSize(cleanText, 170);
    
    lines.forEach((line: string) => {
      if (currentY > 280) {
        pdf.addPage();
        currentY = 30;
      }
      pdf.text(line, 20, currentY);
      currentY += 6;
    });
    
    pdf.save('rapport-big-five-ocean.pdf');
    
    toast({
      title: "PDF téléchargé",
      description: "Votre rapport Big Five a été téléchargé avec succès.",
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Button>
            
            <Button 
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Votre Profil Big Five / OCEAN</CardTitle>
              <CardDescription className="text-center">
                Analyse de votre personnalité selon les 5 grands traits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Vos Scores</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Ouverture</span>
                        <span className="text-sm">{scores.O}/100</span>
                      </div>
                      <Progress value={scores.O} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Conscienciosité</span>
                        <span className="text-sm">{scores.C}/100</span>
                      </div>
                      <Progress value={scores.C} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Extraversion</span>
                        <span className="text-sm">{scores.E}/100</span>
                      </div>
                      <Progress value={scores.E} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Agréabilité</span>
                        <span className="text-sm">{scores.A}/100</span>
                      </div>
                      <Progress value={scores.A} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Neuroticisme</span>
                        <span className="text-sm">{scores.N}/100</span>
                      </div>
                      <Progress value={scores.N} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Analyse Personnalisée</h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysisResult.replace(/[#*`]/g, '')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Big Five / OCEAN</CardTitle>
            <CardDescription className="text-center">
              Évaluez votre personnalité selon les 5 grands traits psychologiques
            </CardDescription>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} sur {questions.length}</span>
                <span>{Math.round(progress)}% complété</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {questions[currentQuestion].text}
                </h3>
                
                <RadioGroup 
                  value={answers[questions[currentQuestion].id]?.toString() || ''} 
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="1" id="option1" />
                    <Label htmlFor="option1" className="cursor-pointer flex-1">
                      Pas du tout d'accord
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="2" id="option2" />
                    <Label htmlFor="option2" className="cursor-pointer flex-1">
                      Plutôt pas d'accord
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="3" id="option3" />
                    <Label htmlFor="option3" className="cursor-pointer flex-1">
                      Neutre
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="4" id="option4" />
                    <Label htmlFor="option4" className="cursor-pointer flex-1">
                      Plutôt d'accord
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="5" id="option5" />
                    <Label htmlFor="option5" className="cursor-pointer flex-1">
                      Tout à fait d'accord
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={goToPrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!answers[questions[currentQuestion].id] || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? 'Génération...' : 'Terminer'}
                  </Button>
                ) : (
                  <Button 
                    onClick={goToNext}
                    disabled={!answers[questions[currentQuestion].id]}
                    className="flex items-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MBTIPage;