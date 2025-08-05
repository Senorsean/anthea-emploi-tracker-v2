import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Brain, Clock, Loader2, Play, FileText, Target, BookOpen, MessageSquare, TrendingUp, BarChart3, PieChart, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface QuizReport {
  evaluationGlobale: string;
  pointsForts: string[];
  axesAmelioration: string[];
  planAction: string[];
  ressources: string[];
  questionsTypes: string[];
  profession: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  competencesByCategory?: { [key: string]: number };
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number | null;
  correctAnswers: number[];
  isMultipleChoice: boolean;
  explanation: string;
  category: string;
}

const TesterConnaissancesPage = () => {
  const [profession, setProfession] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState([3]); // 1-5 scale
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | number[] | null)[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizReport, setQuizReport] = useState<QuizReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const generateQuiz = async () => {
    if (!profession.trim()) {
      toast.error('Veuillez saisir votre métier');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Génération du quiz pour:', profession);
      
      const { data, error } = await supabase.functions.invoke('generate-profession-quiz', {
        body: { 
          profession: profession.trim(),
          difficultyLevel: difficultyLevel[0]
        }
      });

      if (error) {
        console.error('Erreur lors de la génération:', error);
        throw error;
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('Aucune question générée');
      }

      console.log('Quiz généré avec succès:', data.questions.length, 'questions');
      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(null));
      setQuizStarted(true);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setShowAnswer(false);
      setScore(0);
      setQuizCompleted(false);
      
      toast.success(`Quiz personnalisé généré avec ${data.questions.length} questions !`);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la génération du quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.isMultipleChoice) {
      setSelectedAnswers(prev => {
        if (prev.includes(answerIndex)) {
          return prev.filter(i => i !== answerIndex);
        } else {
          return [...prev, answerIndex];
        }
      });
    } else {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleConfirmAnswer = () => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.isMultipleChoice) {
      if (selectedAnswers.length === 0) return;
    } else {
      if (selectedAnswer === null) return;
    }

    setShowAnswer(true);
    const newUserAnswers = [...userAnswers];
    
    if (currentQ.isMultipleChoice) {
      newUserAnswers[currentQuestion] = selectedAnswers;
      // Vérifier si les réponses sont correctes (même tableau)
      const correctAnswers = currentQ.correctAnswers.sort();
      const userAnswersSorted = [...selectedAnswers].sort();
      const isCorrect = correctAnswers.length === userAnswersSorted.length && 
        correctAnswers.every((val, index) => val === userAnswersSorted[index]);
      
      if (isCorrect) {
        setScore(score + 1);
      }
    } else {
      newUserAnswers[currentQuestion] = selectedAnswer;
      if (selectedAnswer === currentQ.correctAnswer) {
        setScore(score + 1);
      }
    }
    
    setUserAnswers(newUserAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Préparer les questions incorrectes
      const incorrectQuestions = questions.filter((question, index) => {
        const userAnswer = userAnswers[index];
        if (question.isMultipleChoice) {
          const correctAnswers = question.correctAnswers.sort();
          const userAnswersSorted = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
          return !(correctAnswers.length === userAnswersSorted.length && 
            correctAnswers.every((val, idx) => val === userAnswersSorted[idx]));
        } else {
          return userAnswer !== null && userAnswer !== question.correctAnswer;
        }
      }).map(q => {
        const userAnswer = userAnswers[questions.indexOf(q)];
        if (q.isMultipleChoice) {
          const correctAnswers = q.correctAnswers.map(idx => q.options[idx]).join(', ');
          const userAnswersText = Array.isArray(userAnswer) ? 
            userAnswer.map(idx => q.options[idx]).join(', ') : 'Aucune réponse';
          return {
            question: q.question,
            category: q.category,
            correctAnswer: correctAnswers,
            userAnswer: userAnswersText
          };
        } else {
          return {
            question: q.question,
            category: q.category,
            correctAnswer: q.options[q.correctAnswer || 0],
            userAnswer: q.options[userAnswer as number || 0]
          };
        }
      });

      // Analyser les compétences par catégorie
      const competencesByCategory: { [key: string]: number } = {};
      questions.forEach((question, index) => {
        const category = question.category;
        const userAnswer = userAnswers[index];
        let isCorrect = false;
        
        if (question.isMultipleChoice) {
          const correctAnswers = question.correctAnswers.sort();
          const userAnswersSorted = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
          isCorrect = correctAnswers.length === userAnswersSorted.length && 
            correctAnswers.every((val, idx) => val === userAnswersSorted[idx]);
        } else {
          isCorrect = userAnswer === question.correctAnswer;
        }
        
        if (!competencesByCategory[category]) {
          competencesByCategory[category] = 0;
        }
        
        if (isCorrect) {
          competencesByCategory[category] += 1;
        }
      });

      // Convertir en pourcentage
      Object.keys(competencesByCategory).forEach(category => {
        const totalInCategory = questions.filter(q => q.category === category).length;
        competencesByCategory[category] = (competencesByCategory[category] / totalInCategory) * 100;
      });

      const { data, error } = await supabase.functions.invoke('generate-quiz-report', {
        body: { 
          profession: profession,
          score: score,
          totalQuestions: questions.length,
          incorrectQuestions: incorrectQuestions
        }
      });

      if (error) {
        console.error('Erreur lors de la génération du rapport:', error);
        throw error;
      }

      // Ajouter les données de compétences par catégorie
      const reportWithCompetences = {
        ...data,
        competencesByCategory
      };

      setQuizReport(reportWithCompetences);
      setShowReport(true);
      toast.success('Compte-rendu personnalisé généré !');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la génération du compte-rendu');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setProfession('');
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers([]);
    setQuizReport(null);
    setShowReport(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "Exceptionnel ! Vous maîtrisez parfaitement votre métier.";
    if (percentage >= 80) return "Excellent ! Vos connaissances sont très solides.";
    if (percentage >= 70) return "Bien ! Vous avez de bonnes bases.";
    if (percentage >= 60) return "Correct. Quelques points à approfondir.";
    if (percentage >= 50) return "Moyen. Il serait bénéfique de renforcer vos connaissances.";
    return "À améliorer. Considérez une formation complémentaire dans votre domaine.";
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const exportToPDF = () => {
    if (!quizReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // En-tête du rapport avec dégradé
    doc.setFillColor(164, 0, 124);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RAPPORT D\'ÉVALUATION PROFESSIONNELLE', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Métier: ${quizReport.profession}`, pageWidth / 2, 35, { align: 'center' });
    
    // Retour au noir pour le reste
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 60;

    // Fonction pour dessiner un graphique radar simplifié
    const drawRadarChart = (data: any[], centerX: number, centerY: number, radius: number) => {
      const numCategories = data.length;
      if (numCategories === 0) return;

      // Dessiner les axes
      for (let i = 0; i < numCategories; i++) {
        const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(centerX, centerY, x, y);
        
        // Ajouter les labels
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const labelX = centerX + (radius + 10) * Math.cos(angle);
        const labelY = centerY + (radius + 10) * Math.sin(angle);
        const label = data[i].category.length > 10 ? data[i].category.substring(0, 10) + '...' : data[i].category;
        doc.text(label, labelX, labelY, { align: 'center' });
      }

      // Dessiner les cercles concentriques
      for (let r = radius / 4; r <= radius; r += radius / 4) {
        doc.setDrawColor(230, 230, 230);
        doc.circle(centerX, centerY, r);
      }

      // Dessiner la ligne de données
      doc.setDrawColor(164, 0, 124);
      doc.setLineWidth(2);
      for (let i = 0; i < numCategories; i++) {
        const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
        const score = data[i].score / 100;
        const x = centerX + radius * score * Math.cos(angle);
        const y = centerY + radius * score * Math.sin(angle);
        
        if (i === 0) {
          doc.setFillColor(164, 0, 124);
          doc.circle(x, y, 2, 'F');
        } else {
          const prevAngle = ((i - 1) * 2 * Math.PI) / numCategories - Math.PI / 2;
          const prevScore = data[i - 1].score / 100;
          const prevX = centerX + radius * prevScore * Math.cos(prevAngle);
          const prevY = centerY + radius * prevScore * Math.sin(prevAngle);
          
          doc.line(prevX, prevY, x, y);
          doc.setFillColor(164, 0, 124);
          doc.circle(x, y, 2, 'F');
        }
      }
      
      // Fermer la forme
      if (numCategories > 2) {
        const firstAngle = -Math.PI / 2;
        const lastAngle = ((numCategories - 1) * 2 * Math.PI) / numCategories - Math.PI / 2;
        const firstScore = data[0].score / 100;
        const lastScore = data[numCategories - 1].score / 100;
        const firstX = centerX + radius * firstScore * Math.cos(firstAngle);
        const firstY = centerY + radius * firstScore * Math.sin(firstAngle);
        const lastX = centerX + radius * lastScore * Math.cos(lastAngle);
        const lastY = centerY + radius * lastScore * Math.sin(lastAngle);
        
        doc.line(lastX, lastY, firstX, firstY);
      }
    };

    // Fonction pour dessiner un graphique en secteurs simplifié
    const drawPieChart = (data: any[], centerX: number, centerY: number, radius: number) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Couleur selon l'index
        if (index === 0) {
          doc.setFillColor(16, 185, 129); // vert pour correct
        } else {
          doc.setFillColor(239, 68, 68); // rouge pour incorrect
        }
        
        // Dessiner un arc simplifié avec des triangles
        const numSteps = Math.max(3, Math.floor(sliceAngle / (Math.PI / 8)));
        for (let i = 0; i < numSteps; i++) {
          const angle1 = startAngle + (i * sliceAngle) / numSteps;
          const angle2 = startAngle + ((i + 1) * sliceAngle) / numSteps;
          
          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);
          
          // Créer un triangle pour chaque segment
          doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
        }
        
        // Ajouter le label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius + 15) * Math.cos(labelAngle);
        const labelY = centerY + (radius + 15) * Math.sin(labelAngle);
        
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.name}: ${item.value}`, labelX, labelY, { align: 'center' });
        
        startAngle += sliceAngle;
      });
      
      // Contour du cercle
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.circle(centerX, centerY, radius, 'S');
    };

    // Fonction pour dessiner un graphique en barres
    const drawBarChart = (data: any[], startX: number, startY: number, width: number, height: number) => {
      const barWidth = width / data.length;
      const maxValue = 100;
      
      data.forEach((item, index) => {
        const barHeight = (item.score / maxValue) * height;
        const x = startX + index * barWidth;
        const y = startY + height - barHeight;
        
        // Dessiner la barre
        doc.setFillColor(164, 0, 124);
        doc.rect(x + 5, y, barWidth - 10, barHeight, 'F');
        
        // Label de catégorie (nom complet)
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        const label = item.fullCategory || item.category;
        const shortLabel = label.length > 10 ? label.substring(0, 10) + '...' : label;
        doc.text(shortLabel, x + barWidth / 2, startY + height + 10, { align: 'center', angle: 45 });
        
        // Valeur avec indication claire
        doc.setFontSize(7);
        doc.text(`${item.score.toFixed(0)}%`, x + barWidth / 2, y - 2, { align: 'center' });
      });
      
      // Axes
      doc.setDrawColor(0, 0, 0);
      doc.line(startX, startY + height, startX + width, startY + height); // axe X
      doc.line(startX, startY, startX, startY + height); // axe Y
    };
    
    // Préparer les données pour les graphiques
    const radarData = quizReport.competencesByCategory ? 
      Object.entries(quizReport.competencesByCategory).map(([category, score]) => ({
        category: category,
        score: Number(score.toFixed(1)),
        fullMark: 100
      })) : [];

    const pieData = [
      { name: 'Réponses correctes', value: quizReport.score, color: '#10b981' },
      { name: 'Réponses incorrectes', value: quizReport.totalQuestions - quizReport.score, color: '#ef4444' }
    ];

    const barData = radarData.map(item => ({
      category: item.category.length > 12 ? item.category.substring(0, 12) + '...' : item.category,
      fullCategory: item.category, // Nom complet pour le PDF
      score: item.score
    }));

    // Score principal
    doc.setFontSize(18);
    doc.text('RÉSULTATS GLOBAUX', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Score obtenu: ${quizReport.score}/${quizReport.totalQuestions} (${quizReport.percentage}%)`, 20, yPosition);
    yPosition += 20;

    // Ajouter les graphiques
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 20;
    }

    // Graphique radar des compétences
    if (radarData.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(164, 0, 124);
      doc.text('ANALYSE DES COMPÉTENCES PAR DOMAINE', 20, yPosition);
      yPosition += 15;
      
      drawRadarChart(radarData, pageWidth / 4, yPosition + 40, 30);
      
      // Graphique en secteurs
      doc.text('RÉPARTITION DES RÉSULTATS', pageWidth * 3/4 - 40, yPosition);
      drawPieChart(pieData, pageWidth * 3/4, yPosition + 40, 25);
      
      yPosition += 100;

      // Graphique en barres
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text('PERFORMANCE DÉTAILLÉE PAR CATÉGORIE', 20, yPosition);
      yPosition += 15;
      
      if (barData.length > 0) {
        drawBarChart(barData, 20, yPosition, pageWidth - 40, 50);
        yPosition += 80;
      }
    }

    // Retour au noir pour le reste
    doc.setTextColor(0, 0, 0);
    
    // Évaluation globale
    doc.setFontSize(16);
    doc.text('ÉVALUATION GLOBALE', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const evaluationLines = doc.splitTextToSize(quizReport.evaluationGlobale, pageWidth - 40);
    doc.text(evaluationLines, 20, yPosition);
    yPosition += evaluationLines.length * 5 + 15;
    
    // Points forts
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('POINTS FORTS', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    quizReport.pointsForts.forEach((point, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const pointLines = doc.splitTextToSize(`• ${point}`, pageWidth - 40);
      doc.text(pointLines, 20, yPosition);
      yPosition += pointLines.length * 5 + 3;
    });
    
    yPosition += 10;
    
    // Axes d'amélioration
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('AXES D\'AMÉLIORATION', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    quizReport.axesAmelioration.forEach((axe, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const axeLines = doc.splitTextToSize(`• ${axe}`, pageWidth - 40);
      doc.text(axeLines, 20, yPosition);
      yPosition += axeLines.length * 5 + 3;
    });
    
    yPosition += 10;
    
    // Plan d'action
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('PLAN D\'ACTION POUR L\'ENTRETIEN', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    quizReport.planAction.forEach((action, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const actionLines = doc.splitTextToSize(`${index + 1}. ${action}`, pageWidth - 40);
      doc.text(actionLines, 20, yPosition);
      yPosition += actionLines.length * 5 + 5;
    });
    
    yPosition += 10;
    
    // Ressources recommandées
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('RESSOURCES RECOMMANDÉES', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    quizReport.ressources.forEach((ressource, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const ressourceLines = doc.splitTextToSize(`• ${ressource}`, pageWidth - 40);
      doc.text(ressourceLines, 20, yPosition);
      yPosition += ressourceLines.length * 5 + 3;
    });
    
    yPosition += 10;
    
    // Questions d'entretien probables
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('QUESTIONS D\'ENTRETIEN PROBABLES', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    quizReport.questionsTypes.forEach((question, index) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`Question ${index + 1}:`, 20, yPosition);
      yPosition += 5;
      const questionLines = doc.splitTextToSize(`"${question}"`, pageWidth - 40);
      doc.text(questionLines, 20, yPosition);
      yPosition += questionLines.length * 5 + 8;
    });
    
    // Pied de page sur toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, pageHeight - 10);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 40, pageHeight - 10);
    }
    
    // Télécharger le PDF
    const fileName = `rapport-evaluation-${quizReport.profession.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('Rapport PDF téléchargé avec succès !');
  };

  // Page d'accueil - saisie du métier
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-[#a4007c] hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Brain className="h-16 w-16 text-[#a4007c]" />
              </div>
              <CardTitle className="text-2xl">Test de connaissances sur votre métier</CardTitle>
              <p className="text-gray-600 mt-2">
                Évaluez vos compétences professionnelles avec un quiz personnalisé de 20 questions généré par IA
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profession">Votre métier / poste</Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ex: Développeur web, Comptable, Marketing digital..."
                  className="text-lg"
                />
              </div>

              <div className="space-y-4">
                <Label>Niveau de difficulté</Label>
                <div className="px-4">
                  <Slider
                    value={difficultyLevel}
                    onValueChange={setDifficultyLevel}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Connaisseur</span>
                    <span className="font-medium">
                      {difficultyLevel[0] === 1 && "Connaisseur"}
                      {difficultyLevel[0] === 2 && "Confirmé"}
                      {difficultyLevel[0] === 3 && "Expérimenté"}
                      {difficultyLevel[0] === 4 && "Avancé"}
                      {difficultyLevel[0] === 5 && "Expert"}
                    </span>
                    <span>Expert</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Ce qui vous attend :</h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• 20 questions personnalisées selon votre métier</li>
                  <li>• Progression du général au spécifique</li>
                  <li>• Explications détaillées pour chaque réponse</li>
                  <li>• Score final avec recommandations</li>
                </ul>
              </div>

              <Button 
                onClick={generateQuiz}
                disabled={!profession.trim() || isGenerating}
                className="w-full bg-[#a4007c] hover:bg-[#8a0066] text-lg py-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération du quiz personnalisé...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Commencer le test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Page de compte-rendu
  if (showReport && quizReport) {
    // Préparer les données pour les graphiques
    const radarData = quizReport.competencesByCategory ? 
      Object.entries(quizReport.competencesByCategory).map(([category, score]) => ({
        category: category,
        score: Number(score.toFixed(1)),
        fullMark: 100
      })) : [];

    const pieData = [
      { name: 'Réponses correctes', value: quizReport.score, color: '#10b981' },
      { name: 'Réponses incorrectes', value: quizReport.totalQuestions - quizReport.score, color: '#ef4444' }
    ];

    const barData = radarData.map(item => ({
      category: item.category.length > 12 ? item.category.substring(0, 12) + '...' : item.category,
      fullCategory: item.category, // Garder le nom complet pour les tooltips
      score: item.score
    }));

    const globalScore = parseFloat(quizReport.percentage);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="inline-flex items-center text-[#a4007c] hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
            <Button onClick={exportToPDF} className="flex items-center bg-[#a4007c] hover:bg-[#8a0066]">
              <Download className="mr-2 h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>

          <div className="space-y-6">
            {/* En-tête du rapport professionnel */}
            <Card className="bg-gradient-to-r from-[#a4007c] to-[#8a0066] text-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">Rapport d'Évaluation Professionnelle</CardTitle>
                <p className="text-lg opacity-90">
                  Métier : <span className="font-semibold">{quizReport.profession}</span>
                </p>
                <div className="mt-4 flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{quizReport.score}/{quizReport.totalQuestions}</div>
                    <div className="text-sm opacity-75">Score obtenu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{quizReport.percentage}%</div>
                    <div className="text-sm opacity-75">Taux de réussite</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tableaux de bord analytiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique radar des compétences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-[#a4007c]" />
                    Analyse des compétences par domaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis 
                          dataKey="category" 
                          tick={{ fontSize: 9, fill: '#374151' }}
                          tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fontSize: 9 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Radar
                          name="Pourcentage de réussite"
                          dataKey="score"
                          stroke="#a4007c"
                          fill="#a4007c"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Taux de réussite']}
                          labelFormatter={(label) => `Domaine: ${label}`}
                          contentStyle={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Répartition des réponses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-[#a4007c]" />
                    Répartition des résultats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique en barres détaillé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Performance détaillée par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 9 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}%`, 
                          'Taux de réussite'
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return `Domaine: ${item?.fullCategory || label}`;
                        }}
                        contentStyle={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#a4007c" 
                        radius={[4, 4, 0, 0]}
                      >
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#a4007c" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Indicateurs de performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{quizReport.score}</div>
                  <div className="text-sm text-gray-600">Réponses correctes</div>
                  <Progress value={(quizReport.score / quizReport.totalQuestions) * 100} className="mt-2" />
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{quizReport.totalQuestions - quizReport.score}</div>
                  <div className="text-sm text-gray-600">Réponses incorrectes</div>
                  <Progress value={((quizReport.totalQuestions - quizReport.score) / quizReport.totalQuestions) * 100} className="mt-2" />
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{globalScore.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Taux de réussite global</div>
                  <Progress value={globalScore} className="mt-2" />
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">{radarData.length}</div>
                  <div className="text-sm text-gray-600">Domaines évalués</div>
                  <Progress value={100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Évaluation globale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Évaluation globale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed text-lg">{quizReport.evaluationGlobale}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points forts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Points forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quizReport.pointsForts.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Axes d'amélioration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <XCircle className="mr-2 h-5 w-5" />
                    Axes d&apos;amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quizReport.axesAmelioration.map((axe, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{axe}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Plan d'action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Plan d&apos;action pour l&apos;entretien
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizReport.planAction.map((action, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <span className="bg-[#a4007c] text-white text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ressources recommandées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Ressources recommandées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quizReport.ressources.map((ressource, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{ressource}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Questions types d'entretien */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Questions d&apos;entretien probables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizReport.questionsTypes.map((question, index) => (
                    <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-gray-800 mb-2">Question {index + 1} :</p>
                      <p className="text-gray-700 italic">&quot;{question}&quot;</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center space-x-4 pb-8">
              <Button onClick={() => setShowReport(false)} variant="outline">
                Retour aux résultats
              </Button>
              <Button onClick={restartQuiz} className="bg-[#a4007c] hover:bg-[#8a0066]">
                Nouveau test
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page de résultats
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-[#a4007c] hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Quiz terminé !</CardTitle>
              <p className="text-gray-600">Métier testé : <span className="font-semibold">{profession}</span></p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor()} mb-2`}>
                  {score}/{questions.length}
                </div>
                <div className={`text-lg ${getScoreColor()} mb-2`}>
                  {((score / questions.length) * 100).toFixed(0)}%
                </div>
                <p className="text-gray-600">{getScoreMessage()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">{score} Correctes</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="font-semibold">{questions.length - score} Incorrectes</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">{questions.length} Questions</div>
                </div>
              </div>

              <Separator />

              {/* Bouton pour générer le compte-rendu */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Préparez votre entretien !</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    Obtenez un compte-rendu personnalisé avec vos points forts, axes d&apos;amélioration et un plan d&apos;action pour réussir votre entretien.
                  </p>
                  <Button
                    onClick={generateReport}
                    disabled={isGeneratingReport}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération du compte-rendu...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Générer mon compte-rendu personnalisé
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <Button onClick={restartQuiz} className="bg-[#a4007c] hover:bg-[#8a0066] mr-3">
                    Nouveau test
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setQuizCompleted(false);
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setSelectedAnswers([]);
                    setShowAnswer(false);
                    setScore(0);
                    setUserAnswers(new Array(questions.length).fill(null));
                  }}>
                    Refaire ce test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz en cours
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-[#a4007c] hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="mr-3 h-8 w-8 text-[#a4007c]" />
              Test : {profession}
            </h1>
            <Badge variant="outline">
              Question {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#a4007c] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{question.category}</Badge>
              <div className="text-sm text-gray-500">Score: {score}/{currentQuestion}</div>
            </div>
            <CardTitle className="text-xl">
              {question.question}
              {question.isMultipleChoice && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Plusieurs réponses possibles
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = question.isMultipleChoice 
                  ? selectedAnswers.includes(index)
                  : selectedAnswer === index;
                
                const isCorrect = question.isMultipleChoice
                  ? question.correctAnswers.includes(index)
                  : index === question.correctAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showAnswer}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      isSelected
                        ? showAnswer
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-[#a4007c] bg-purple-50'
                        : showAnswer && isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${showAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                      {showAnswer && isCorrect && (
                        <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <XCircle className="ml-auto h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Explication :</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {!showAnswer ? (
                <Button 
                  onClick={handleConfirmAnswer}
                  disabled={question.isMultipleChoice ? selectedAnswers.length === 0 : selectedAnswer === null}
                  className="bg-[#a4007c] hover:bg-[#8a0066] ml-auto"
                >
                  Confirmer {question.isMultipleChoice ? 'mes réponses' : 'ma réponse'}
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-[#a4007c] hover:bg-[#8a0066] ml-auto"
                >
                  {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Voir mes résultats'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TesterConnaissancesPage;