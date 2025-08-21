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
  dimension: 'POU' | 'SEC' | 'LIB' | 'REC' | 'CUR' | 'SOC' | 'AUT' | 'STA';
}

const questions: Question[] = [
  // Pouvoir (Power)
  {
    id: 'q1',
    text: 'J\'aime diriger et influencer les autres',
    dimension: 'POU'
  },
  {
    id: 'q2',
    text: 'Je recherche les positions de leadership',
    dimension: 'POU'
  },
  {
    id: 'q3',
    text: 'Il est important pour moi d\'avoir de l\'autorité',
    dimension: 'POU'
  },
  // Sécurité (Security)
  {
    id: 'q4',
    text: 'La stabilité de l\'emploi est ma priorité',
    dimension: 'SEC'
  },
  {
    id: 'q5',
    text: 'J\'évite les risques professionnels',
    dimension: 'SEC'
  },
  {
    id: 'q6',
    text: 'J\'ai besoin de cadres et de règles claires',
    dimension: 'SEC'
  },
  // Liberté (Freedom)
  {
    id: 'q7',
    text: 'J\'ai besoin d\'autonomie dans mon travail',
    dimension: 'LIB'
  },
  {
    id: 'q8',
    text: 'Je déteste être micromanagé',
    dimension: 'LIB'
  },
  {
    id: 'q9',
    text: 'Je préfère travailler sans contraintes horaires strictes',
    dimension: 'LIB'
  },
  // Reconnaissance (Recognition)
  {
    id: 'q10',
    text: 'J\'ai besoin que mon travail soit reconnu',
    dimension: 'REC'
  },
  {
    id: 'q11',
    text: 'Les compliments me motivent énormément',
    dimension: 'REC'
  },
  {
    id: 'q12',
    text: 'Je recherche la valorisation de mes supérieurs',
    dimension: 'REC'
  },
  // Curiosité (Curiosity)
  {
    id: 'q13',
    text: 'J\'aime apprendre continuellement de nouvelles choses',
    dimension: 'CUR'
  },
  {
    id: 'q14',
    text: 'Les défis intellectuels me stimulent',
    dimension: 'CUR'
  },
  {
    id: 'q15',
    text: 'Je m\'ennuie rapidement dans la routine',
    dimension: 'CUR'
  },
  // Social (Social)
  {
    id: 'q16',
    text: 'Aider les autres est important pour moi',
    dimension: 'SOC'
  },
  {
    id: 'q17',
    text: 'Je veux que mon travail ait un impact positif sur la société',
    dimension: 'SOC'
  },
  {
    id: 'q18',
    text: 'Le bien-être d\'autrui me préoccupe',
    dimension: 'SOC'
  },
  // Autonomie (Autonomy)
  {
    id: 'q19',
    text: 'Je préfère prendre mes propres décisions',
    dimension: 'AUT'
  },
  {
    id: 'q20',
    text: 'Je suis à l\'aise avec la prise d\'initiative',
    dimension: 'AUT'
  },
  {
    id: 'q21',
    text: 'J\'aime être responsable de mes résultats',
    dimension: 'AUT'
  },
  // Status/Prestige (Status)
  {
    id: 'q22',
    text: 'Le prestige de mon poste est important',
    dimension: 'STA'
  },
  {
    id: 'q23',
    text: 'Je recherche la reconnaissance sociale',
    dimension: 'STA'
  },
  {
    id: 'q24',
    text: 'J\'aime que les autres respectent ma position',
    dimension: 'STA'
  }
];

const dimensionNames = {
  POU: 'Pouvoir',
  SEC: 'Sécurité', 
  LIB: 'Liberté',
  REC: 'Reconnaissance',
  CUR: 'Curiosité',
  SOC: 'Social',
  AUT: 'Autonomie',
  STA: 'Statut'
};

export const MotivationQuestionnairePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResponse = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [questions[currentQuestion].id]: parseInt(value)
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuestionnaire();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {
      POU: 0, SEC: 0, LIB: 0, REC: 0, 
      CUR: 0, SOC: 0, AUT: 0, STA: 0
    };

    Object.entries(responses).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        scores[question.dimension] += score;
      }
    });

    // Normalize scores to percentage
    Object.keys(scores).forEach(dimension => {
      const questionCount = questions.filter(q => q.dimension === dimension).length;
      scores[dimension] = Math.round((scores[dimension] / (questionCount * 5)) * 100);
    });

    return scores;
  };

  const completeQuestionnaire = async () => {
    setIsCompleted(true);
    setIsGenerating(true);

    try {
      const scores = calculateScores();
      
      const { data, error } = await supabase.functions.invoke('generate-motivation-analysis', {
        body: { scores }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analyse terminée",
        description: "Votre profil motivationnel a été généré avec succès.",
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    if (!analysis) return;

    const pdf = new jsPDF();
    const yStart = addAntheaHeader(pdf, 'Questionnaire Motivations - Profil Personnel');
    
    let yPosition = yStart + 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Clean markdown and format text
    const cleanText = analysis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/### (.*?)$/gm, '$1')
      .replace(/## (.*?)$/gm, '$1')
      .replace(/# (.*?)$/gm, '$1')
      .replace(/\n{3,}/g, '\n\n');

    const sections = cleanText.split(/(?=(?:Dimension|Recommandations|Environnements|Profil|Score))/);

    sections.forEach((section, index) => {
      if (section.trim()) {
        const lines = section.trim().split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');

        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = 30;
        }

        // Section title
        if (title) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text(title, margin, yPosition);
          yPosition += 10;
        }

        // Section content
        if (content.trim()) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          const contentLines = pdf.splitTextToSize(content.trim(), maxWidth);
          
          contentLines.forEach((line: string) => {
            if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
              pdf.addPage();
              yPosition = 30;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          });
        }
        
        yPosition += 5;
      }
    });

    pdf.save('questionnaire-motivations-analyse.pdf');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const hasResponse = responses[currentQuestionData?.id] !== undefined;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
            <h1 className="text-3xl font-bold text-purple-800">Questionnaire Motivations</h1>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-800">
                Votre Profil Motivationnel
              </CardTitle>
              <CardDescription>
                Analyse complète de vos moteurs profonds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération de votre analyse personnalisée...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(calculateScores()).map(([dimension, score]) => (
                      <div key={dimension} className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="font-semibold text-purple-800">{dimensionNames[dimension as keyof typeof dimensionNames]}</div>
                        <div className="text-2xl font-bold text-purple-600">{score}%</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="prose max-w-none">
                    {analysis.split('\n\n').map((paragraph, index) => {
                      const cleanParagraph = paragraph
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold text-purple-800 mt-4 mb-2">$1</h3>')
                        .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold text-purple-800 mt-6 mb-3">$1</h2>')
                        .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold text-purple-800 mt-8 mb-4">$1</h1>');
                      
                      return (
                        <div 
                          key={index} 
                          className="mb-4 text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: cleanParagraph }}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={exportToPDF}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le rapport PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Erreur lors de la génération de l'analyse.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          <h1 className="text-3xl font-bold text-purple-800">Questionnaire Motivations</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Question {currentQuestion + 1}/{questions.length}</CardTitle>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-gray-800 leading-relaxed">
              {currentQuestionData.text}
            </div>

            <RadioGroup 
              value={responses[currentQuestionData.id]?.toString() || ""} 
              onValueChange={handleResponse}
              className="space-y-3"
            >
              {[
                { value: "1", label: "Pas du tout d'accord" },
                { value: "2", label: "Plutôt pas d'accord" },
                { value: "3", label: "Neutre" },
                { value: "4", label: "Plutôt d'accord" },
                { value: "5", label: "Tout à fait d'accord" }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-3">
                  <RadioGroupItem value={value} id={`option-${value}`} />
                  <Label 
                    htmlFor={`option-${value}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!hasResponse}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};