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
  dimension: 'D' | 'I' | 'S' | 'C';
  reverse?: boolean;
}

const questions: Question[] = [
  // Dominance (D)
  {
    id: 'q1',
    text: 'Je prends facilement des décisions rapides',
    dimension: 'D'
  },
  {
    id: 'q2',
    text: 'Je préfère diriger plutôt que suivre',
    dimension: 'D'
  },
  {
    id: 'q3',
    text: 'J\'aime relever des défis difficiles',
    dimension: 'D'
  },
  {
    id: 'q4',
    text: 'Je vais droit au but dans mes communications',
    dimension: 'D'
  },
  {
    id: 'q5',
    text: 'Je préfère éviter les confrontations',
    dimension: 'D',
    reverse: true
  },
  {
    id: 'q6',
    text: 'J\'aime obtenir des résultats rapidement',
    dimension: 'D'
  },
  // Influence (I)
  {
    id: 'q7',
    text: 'Je suis à l\'aise pour parler devant un groupe',
    dimension: 'I'
  },
  {
    id: 'q8',
    text: 'J\'aime convaincre les autres de mon point de vue',
    dimension: 'I'
  },
  {
    id: 'q9',
    text: 'Je suis optimiste et enthousiaste',
    dimension: 'I'
  },
  {
    id: 'q10',
    text: 'Je préfère travailler seul',
    dimension: 'I',
    reverse: true
  },
  {
    id: 'q11',
    text: 'J\'aime créer des relations sociales au travail',
    dimension: 'I'
  },
  {
    id: 'q12',
    text: 'Je suis spontané et expressif',
    dimension: 'I'
  },
  // Stabilité (S)
  {
    id: 'q13',
    text: 'Je préfère un environnement de travail stable',
    dimension: 'S'
  },
  {
    id: 'q14',
    text: 'Je suis patient et calme sous pression',
    dimension: 'S'
  },
  {
    id: 'q15',
    text: 'J\'aime les changements fréquents',
    dimension: 'S',
    reverse: true
  },
  {
    id: 'q16',
    text: 'Je suis loyal envers mon équipe',
    dimension: 'S'
  },
  {
    id: 'q17',
    text: 'Je préfère travailler à un rythme régulier',
    dimension: 'S'
  },
  {
    id: 'q18',
    text: 'Je suis un bon auditeur',
    dimension: 'S'
  },
  // Conformité (C)
  {
    id: 'q19',
    text: 'J\'accorde beaucoup d\'importance aux détails',
    dimension: 'C'
  },
  {
    id: 'q20',
    text: 'Je préfère suivre des procédures établies',
    dimension: 'C'
  },
  {
    id: 'q21',
    text: 'Je prends des décisions basées sur l\'intuition',
    dimension: 'C',
    reverse: true
  },
  {
    id: 'q22',
    text: 'Je suis méthodique et organisé',
    dimension: 'C'
  },
  {
    id: 'q23',
    text: 'J\'analyse soigneusement avant d\'agir',
    dimension: 'C'
  },
  {
    id: 'q24',
    text: 'Je valorise la précision et la qualité',
    dimension: 'C'
  }
];

const DISCPage = () => {
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
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    const dimensionScores: Record<string, number> = {
      D: 0,
      I: 0,
      S: 0,
      C: 0
    };

    questions.forEach(question => {
      const answer = answers[question.id] || 3;
      const score = question.reverse ? (6 - answer) : answer;
      dimensionScores[question.dimension] += score;
    });

    // Normaliser les scores sur 100
    const questionsPerDimension = 6;
    const maxScorePerDimension = questionsPerDimension * 5;
    
    Object.keys(dimensionScores).forEach(key => {
      dimensionScores[key] = Math.round((dimensionScores[key] / maxScorePerDimension) * 100);
    });

    return dimensionScores;
  };

  const handleSubmit = async () => {
    const allAnswered = questions.every(q => answers[q.id] !== undefined);
    
    if (!allAnswered) {
      toast({
        title: "Questions manquantes",
        description: "Veuillez répondre à toutes les questions avant de soumettre.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedScores = calculateScores();
      setScores(calculatedScores);

      const { data, error } = await supabase.functions.invoke('generate-disc-analysis', {
        body: { scores: calculatedScores }
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      setShowResults(true);

      toast({
        title: "Analyse DISC complétée",
        description: "Votre profil comportemental a été analysé avec succès.",
      });

    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    const lineHeight = 5.5;

    // Position courante
    let currentY = addAntheaHeader(pdf, 'Analyse DISC');

    // Vérifie l'espace restant sur la page (avec marge de sécurité) et ajoute un header si besoin
    const checkSpace = (requiredHeight: number, y: number) => {
      if (y + requiredHeight + 15 > pageHeight - margin) {
        pdf.addPage();
        return addAntheaHeader(pdf, 'Analyse DISC');
      }
      return y;
    };

    // Ajoute un bloc de texte avec coupe stricte par mots pour éviter tout dépassement horizontal
    const addTextBlock = (text: string, fontSize = 10, isBold = false) => {
      if (!text || !text.trim()) return;
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setFontSize(fontSize);

      const words = text.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const width = pdf.getTextWidth(testLine);
        if (width > maxWidth && line) {
          currentY = checkSpace(lineHeight, currentY);
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentY = checkSpace(lineHeight, currentY);
        pdf.text(line, margin, currentY);
        currentY += lineHeight;
      }

      currentY += 2; // petit espace après le bloc
    };

    // Titre principal
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    currentY = checkSpace(12, currentY);
    pdf.text('Analyse DISC - Profil Comportemental', margin, currentY);
    currentY += 15;

    // Scores
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    currentY = checkSpace(20, currentY);
    pdf.text('Vos Scores DISC', margin, currentY);
    currentY += 12;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const dimensions = [
      { key: 'D', name: 'Dominance', color: [220, 38, 38] as [number, number, number] },
      { key: 'I', name: 'Influence', color: [234, 179, 8] as [number, number, number] },
      { key: 'S', name: 'Stabilité', color: [34, 197, 94] as [number, number, number] },
      { key: 'C', name: 'Conformité', color: [59, 130, 246] as [number, number, number] }
    ];

    dimensions.forEach(dim => {
      currentY = checkSpace(15, currentY);
      pdf.text(`${dim.name} (${dim.key}): ${scores[dim.key]}%`, margin, currentY);

      const barMaxWidth = maxWidth - 100; // Longueur max des barres (laisse de l'espace à droite)
      const barWidth = Math.max(0, Math.min(barMaxWidth, (scores[dim.key] / 100) * barMaxWidth));

      pdf.setFillColor(dim.color[0], dim.color[1], dim.color[2]);
      pdf.rect(margin, currentY + 2, barWidth, 5, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, currentY + 2, barMaxWidth, 5, 'S');

      currentY += 12;
    });

    currentY += 5;

    // Analyse détaillée
    currentY = checkSpace(15, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Analyse Détaillée', margin, currentY);
    currentY += 10;

    // Nettoyage et impression du texte avec coupe stricte
    const cleanedText = analysisResult
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[•\-\*\+]+/g, '•')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const sections = cleanedText.split(/\n\n+/);

    sections.forEach((section) => {
      const s = section.trim();
      if (!s) return;
      // Si c'est un titre court sans ponctuation, on le rend en gras
      if (s.length < 80 && !/[\.,:;]/.test(s)) {
        currentY = checkSpace(18, currentY);
        addTextBlock(s, 11, true);
      } else {
        addTextBlock(s, 10, false);
      }
    });

    pdf.save('analyse-disc.pdf');
    
    toast({
      title: "PDF téléchargé",
      description: "Votre analyse DISC a été téléchargée avec succès.",
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Votre Profil DISC
              </CardTitle>
              <CardDescription className="text-lg">
                Découvrez votre style comportemental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Scores */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Vos Scores</h3>
                <div className="grid gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-red-600">Dominance (D)</span>
                      <span className="font-bold">{scores.D}%</span>
                    </div>
                    <Progress value={scores.D} className="h-3 [&>div]:bg-red-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-yellow-600">Influence (I)</span>
                      <span className="font-bold">{scores.I}%</span>
                    </div>
                    <Progress value={scores.I} className="h-3 [&>div]:bg-yellow-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-green-600">Stabilité (S)</span>
                      <span className="font-bold">{scores.S}%</span>
                    </div>
                    <Progress value={scores.S} className="h-3 [&>div]:bg-green-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-blue-600">Conformité (C)</span>
                      <span className="font-bold">{scores.C}%</span>
                    </div>
                    <Progress value={scores.C} className="h-3 [&>div]:bg-blue-500" />
                  </div>
                </div>
              </div>

              {/* Analyse */}
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Analyse Détaillée</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-gray-50 p-6 rounded-lg">
                  {analysisResult}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
                <Button onClick={downloadPDF} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} sur {questions.length}
              </span>
            </div>
            <CardTitle className="text-2xl">Test DISC</CardTitle>
            <CardDescription>
              Évaluez votre profil comportemental professionnel
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {questions[currentQuestion].text}
              </h3>
              <RadioGroup
                value={answers[questions[currentQuestion].id]?.toString()}
                onValueChange={handleAnswerChange}
              >
                <div className="space-y-3">
                  {[
                    { value: '1', label: 'Pas du tout d\'accord' },
                    { value: '2', label: 'Plutôt pas d\'accord' },
                    { value: '3', label: 'Neutre' },
                    { value: '4', label: 'Plutôt d\'accord' },
                    { value: '5', label: 'Tout à fait d\'accord' }
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answers[questions[currentQuestion].id]}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isSubmitting ? 'Analyse en cours...' : 'Terminer'}
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={!answers[questions[currentQuestion].id]}
                >
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DISCPage;
