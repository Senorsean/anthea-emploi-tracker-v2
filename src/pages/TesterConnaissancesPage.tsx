import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Brain, Clock, Loader2, Play, FileText, Target, BookOpen, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const TesterConnaissancesPage = () => {
  const [profession, setProfession] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
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
        body: { profession: profession.trim() }
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
    setSelectedAnswer(answerIndex);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;

    setShowAnswer(true);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
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
        return userAnswer !== null && userAnswer !== question.correctAnswer;
      }).map(q => ({
        question: q.question,
        category: q.category,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: q.options[userAnswers[questions.indexOf(q)] || 0]
      }));

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

      setQuizReport(data);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-[#a4007c] hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>

          <div className="space-y-6">
            {/* En-tête du rapport */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <FileText className="h-16 w-16 text-[#a4007c]" />
                </div>
                <CardTitle className="text-2xl">Compte-rendu personnalisé</CardTitle>
                <p className="text-gray-600">
                  Métier : <span className="font-semibold">{quizReport.profession}</span> • 
                  Score : <span className={`font-semibold ${getScoreColor()}`}>{quizReport.score}/{quizReport.totalQuestions} ({quizReport.percentage}%)</span>
                </p>
              </CardHeader>
            </Card>

            {/* Évaluation globale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-[#a4007c]" />
                  Évaluation globale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{quizReport.evaluationGlobale}</p>
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
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selectedAnswer === index
                      ? showAnswer
                        ? index === question.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-[#a4007c] bg-purple-50'
                      : showAnswer && index === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                    {showAnswer && index === question.correctAnswer && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                    )}
                    {showAnswer && selectedAnswer === index && index !== question.correctAnswer && (
                      <XCircle className="ml-auto h-5 w-5 text-red-600" />
                    )}
                  </div>
                </button>
              ))}
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
                  disabled={selectedAnswer === null}
                  className="bg-[#a4007c] hover:bg-[#8a0066] ml-auto"
                >
                  Confirmer ma réponse
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