import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Star, ArrowRight } from "lucide-react";

const interviewQuestions = [
  {
    id: 1,
    category: "Présentation",
    question: "Parlez-moi de vous",
    tips: "Structure : parcours, compétences, motivations pour le poste",
    difficulty: "Facile"
  },
  {
    id: 2,
    category: "Motivation",
    question: "Pourquoi voulez-vous travailler dans notre entreprise ?",
    tips: "Recherchez l'entreprise, ses valeurs, ses projets",
    difficulty: "Moyen"
  },
  {
    id: 3,
    category: "Compétences",
    question: "Décrivez-moi une situation où vous avez surmonté un défi professionnel",
    tips: "Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)",
    difficulty: "Moyen"
  },
  {
    id: 4,
    category: "Faiblesses",
    question: "Quels sont vos points faibles ?",
    tips: "Choisissez une vraie faiblesse avec un plan d'amélioration",
    difficulty: "Difficile"
  },
  {
    id: 5,
    category: "Ambition",
    question: "Où vous voyez-vous dans 5 ans ?",
    tips: "Montrez de l'ambition alignée avec le poste proposé",
    difficulty: "Moyen"
  },
  {
    id: 6,
    category: "Gestion du stress",
    question: "Comment gérez-vous la pression et le stress au travail ?",
    tips: "Donnez des exemples concrets de techniques utilisées",
    difficulty: "Moyen"
  },
  {
    id: 7,
    category: "Travail d'équipe",
    question: "Racontez-moi une situation où vous avez eu un conflit avec un collègue",
    tips: "Focalisez sur la résolution et les leçons apprises",
    difficulty: "Difficile"
  },
  {
    id: 8,
    category: "Leadership",
    question: "Décrivez une situation où vous avez dû prendre des initiatives",
    tips: "Montrez votre proactivité et l'impact de vos actions",
    difficulty: "Difficile"
  }
];

export default function PreparationEntretienPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = (completedQuestions.size / interviewQuestions.length) * 100;

  const handleResponseChange = (questionId: number, response: string) => {
    setResponses(prev => ({ ...prev, [questionId]: response }));
  };

  const markQuestionComplete = () => {
    const response = responses[currentQuestion.id];
    if (response && response.trim().length > 50) {
      setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const getReadinessScore = () => {
    const totalQuestions = interviewQuestions.length;
    const completedCount = completedQuestions.size;
    const score = (completedCount / totalQuestions) * 100;
    
    if (score >= 90) return { level: "Excellent", color: "bg-green-500", message: "Vous êtes prêt pour l'entretien !" };
    if (score >= 70) return { level: "Bien", color: "bg-blue-500", message: "Bonne préparation, continuez !" };
    if (score >= 50) return { level: "Correct", color: "bg-orange-500", message: "Vous progressez bien" };
    return { level: "À améliorer", color: "bg-red-500", message: "Continuez à vous entraîner" };
  };

  const resetTraining = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setCompletedQuestions(new Set());
    setShowResults(false);
  };

  if (showResults) {
    const readiness = getReadinessScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">🎯 Résultats de votre préparation</h1>
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-white ${readiness.color} mb-4`}>
                <Star className="mr-2 h-5 w-5" />
                Niveau : {readiness.level}
              </div>
              <p className="text-lg text-gray-600">{readiness.message}</p>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto mb-6" />
            <p className="text-sm text-gray-500">{completedQuestions.size}/{interviewQuestions.length} questions complétées</p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>📝 Vos réponses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewQuestions.map((q) => (
                    <div key={q.id} className={`p-4 rounded-lg border ${completedQuestions.has(q.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{q.question}</h4>
                        {completedQuestions.has(q.id) && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      {responses[q.id] && (
                        <p className="text-sm text-gray-600 mt-2">{responses[q.id].substring(0, 100)}...</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💡 Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress < 100 && (
                    <p className="text-sm">• Complétez toutes les questions pour une préparation optimale</p>
                  )}
                  <p className="text-sm">• Relisez la <Link to="/methode-star" className="text-blue-600 hover:underline">méthode STAR</Link> pour structurer vos réponses</p>
                  <p className="text-sm">• Entraînez-vous à voix haute devant un miroir</p>
                  <p className="text-sm">• Préparez des questions à poser au recruteur</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetTraining} variant="outline">
              Recommencer l'entraînement
            </Button>
            <Link to="/ameliorer-entretiens">
              <Button>
                Voir les conseils d'entretien
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🎯 Préparation entretien</h1>
          <p className="text-gray-600 mb-6">
            Entraînez-vous sur les questions d'entretien les plus courantes et évaluez votre niveau de préparation.
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-gray-500">{completedQuestions.size}/{interviewQuestions.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-2">
                    Question {currentQuestionIndex + 1}/{interviewQuestions.length}
                  </CardTitle>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">{currentQuestion.category}</Badge>
                    <Badge variant={currentQuestion.difficulty === 'Facile' ? 'default' : currentQuestion.difficulty === 'Moyen' ? 'secondary' : 'destructive'}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
                {completedQuestions.has(currentQuestion.id) && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Conseil</p>
                    <p className="text-sm text-blue-600">{currentQuestion.tips}</p>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Écrivez votre réponse ici... (minimum 50 caractères)"
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                className="min-h-[150px] mb-4"
              />

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.min(interviewQuestions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === interviewQuestions.length - 1}
                  >
                    Suivant
                  </Button>
                </div>
                
                <Button
                  onClick={markQuestionComplete}
                  disabled={!responses[currentQuestion.id] || responses[currentQuestion.id].trim().length < 50}
                >
                  {completedQuestions.has(currentQuestion.id) ? 'Modifiée' : 'Valider'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Toutes les questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interviewQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentQuestionIndex 
                        ? 'bg-blue-50 border-blue-200' 
                        : completedQuestions.has(q.id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge size="sm" variant="outline">{q.category}</Badge>
                        </div>
                      </div>
                      {completedQuestions.has(q.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {completedQuestions.size > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => setShowResults(true)}
                    className="w-full"
                  >
                    Voir mes résultats
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/ameliorer-entretiens" className="text-sm text-gray-600 hover:underline">
            ← Retour aux conseils d'entretien
          </Link>
        </div>
      </main>
    </div>
  );
}