import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Brain, Clock, Loader2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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