import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Brain, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const TesterConnaissancesPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // Questions d'exemple (à personnaliser selon le métier)
  const questions: Question[] = [
    {
      id: 1,
      question: "Quelle est la meilleure pratique pour gérer un projet avec des délais serrés ?",
      options: [
        "Travailler plus d'heures sans pause",
        "Prioriser les tâches critiques et déléguer",
        "Reporter toutes les réunions",
        "Ignorer la qualité pour gagner du temps"
      ],
      correctAnswer: 1,
      explanation: "La priorisation et la délégation permettent d'optimiser l'efficacité tout en maintenant la qualité.",
      category: "Gestion de projet"
    },
    {
      id: 2,
      question: "Comment réagir face à un conflit avec un collègue ?",
      options: [
        "Éviter complètement la personne",
        "Discuter ouvertement et chercher une solution",
        "Rapporter immédiatement à la hiérarchie",
        "Laisser le temps résoudre le problème"
      ],
      correctAnswer: 1,
      explanation: "La communication directe et constructive est la meilleure approche pour résoudre les conflits.",
      category: "Relations interpersonnelles"
    },
    {
      id: 3,
      question: "Quelle est l'importance de la formation continue dans votre carrière ?",
      options: [
        "Elle n'est pas nécessaire si on maîtrise déjà son poste",
        "Elle est essentielle pour rester compétitif",
        "Elle ne sert qu'à obtenir des promotions",
        "Elle est uniquement utile en début de carrière"
      ],
      correctAnswer: 1,
      explanation: "La formation continue permet de s'adapter aux évolutions du marché et de développer de nouvelles compétences.",
      category: "Développement professionnel"
    },
    {
      id: 4,
      question: "Comment gérer efficacement ses priorités au quotidien ?",
      options: [
        "Traiter les tâches dans l'ordre d'arrivée",
        "Utiliser la matrice urgence/importance",
        "Se concentrer uniquement sur les tâches urgentes",
        "Faire d'abord les tâches les plus faciles"
      ],
      correctAnswer: 1,
      explanation: "La matrice d'Eisenhower (urgence/importance) est un outil reconnu pour une gestion efficace des priorités.",
      category: "Organisation"
    },
    {
      id: 5,
      question: "Quelle attitude adopter lors d'un entretien de feedback ?",
      options: [
        "Justifier systématiquement ses actions",
        "Écouter activement et poser des questions",
        "Rester silencieux et acquiescer",
        "Critiquer en retour son manager"
      ],
      correctAnswer: 1,
      explanation: "L'écoute active et les questions constructives montrent votre engagement dans votre développement.",
      category: "Communication"
    }
  ];

  useEffect(() => {
    setUserAnswers(new Array(questions.length).fill(null));
  }, []);

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
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers(new Array(questions.length).fill(null));
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "Excellent ! Vos connaissances sont solides.";
    if (percentage >= 60) return "Bien ! Quelques points à améliorer.";
    if (percentage >= 40) return "Moyen. Il serait bénéfique d'approfondir certains aspects.";
    return "À améliorer. Considérez une formation complémentaire.";
  };

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
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-[#a4007c] mb-2">
                  {score}/{questions.length}
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

              <Button onClick={restartQuiz} className="bg-[#a4007c] hover:bg-[#8a0066]">
                Recommencer le quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Test de connaissances
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