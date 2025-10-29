import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { addAntheaHeader } from '@/lib/pdf-utils';

interface Activity {
  id: number;
  title: string;
  image: string;
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

const activities: Activity[] = [
  { id: 1, title: "Réparer une voiture", image: "🔧", category: 'R' },
  { id: 2, title: "Donner un cours", image: "👩‍🏫", category: 'S' },
  { id: 3, title: "Peindre une toile", image: "🎨", category: 'A' },
  { id: 4, title: "Analyser des données", image: "📊", category: 'I' },
  { id: 5, title: "Vendre un produit", image: "💼", category: 'E' },
  { id: 6, title: "Organiser des dossiers", image: "📁", category: 'C' },
  { id: 7, title: "Construire une maison", image: "🏗️", category: 'R' },
  { id: 8, title: "Faire de la recherche", image: "🔬", category: 'I' },
  { id: 9, title: "Écrire un livre", image: "✍️", category: 'A' },
  { id: 10, title: "Aider des personnes", image: "🤝", category: 'S' },
  { id: 11, title: "Diriger une équipe", image: "👥", category: 'E' },
  { id: 12, title: "Tenir une comptabilité", image: "🧮", category: 'C' },
  { id: 13, title: "Jardiner", image: "🌱", category: 'R' },
  { id: 14, title: "Programmer", image: "💻", category: 'I' },
  { id: 15, title: "Jouer de la musique", image: "🎵", category: 'A' },
  { id: 16, title: "Conseiller", image: "💬", category: 'S' },
  { id: 17, title: "Négocier", image: "🤝", category: 'E' },
  { id: 18, title: "Classer des documents", image: "📋", category: 'C' },
  { id: 19, title: "Cuisiner", image: "👨‍🍳", category: 'R' },
  { id: 20, title: "Étudier", image: "📚", category: 'I' },
  { id: 21, title: "Dessiner", image: "✏️", category: 'A' },
  { id: 22, title: "Former", image: "🎓", category: 'S' },
  { id: 23, title: "Entreprendre", image: "🚀", category: 'E' },
  { id: 24, title: "Planifier", image: "📅", category: 'C' },
  { id: 25, title: "Bricoler", image: "🔨", category: 'R' },
  { id: 26, title: "Chercher", image: "🔍", category: 'I' },
  { id: 27, title: "Créer", image: "💡", category: 'A' },
  { id: 28, title: "Soigner", image: "🏥", category: 'S' },
  { id: 29, title: "Organiser un événement", image: "🎉", category: 'E' },
  { id: 30, title: "Archiver", image: "📦", category: 'C' },
];

const riasecCategories = {
  R: { name: "Réaliste", description: "Activités pratiques et concrètes", color: "bg-blue-100 text-blue-800" },
  I: { name: "Investigateur", description: "Recherche et analyse", color: "bg-purple-100 text-purple-800" },
  A: { name: "Artistique", description: "Création et expression", color: "bg-pink-100 text-pink-800" },
  S: { name: "Social", description: "Aide et accompagnement", color: "bg-green-100 text-green-800" },
  E: { name: "Entreprenant", description: "Leadership et influence", color: "bg-orange-100 text-orange-800" },
  C: { name: "Conventionnel", description: "Organisation et structure", color: "bg-gray-100 text-gray-800" }
};

export const PictotestMetiersPage = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'results'>('intro');
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);
  const [evaluated, setEvaluated] = useState<number[]>([]);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = () => {
    if (liked.length < 15 && !evaluated.includes(activities[currentActivityIndex].id)) {
      setLiked([...liked, activities[currentActivityIndex].id]);
      setEvaluated([...evaluated, activities[currentActivityIndex].id]);
      nextActivity();
    }
  };

  const handleDislike = () => {
    if (disliked.length < 10 && !evaluated.includes(activities[currentActivityIndex].id)) {
      setDisliked([...disliked, activities[currentActivityIndex].id]);
      setEvaluated([...evaluated, activities[currentActivityIndex].id]);
      nextActivity();
    }
  };

  const handleSkip = () => {
    if (!evaluated.includes(activities[currentActivityIndex].id)) {
      setEvaluated([...evaluated, activities[currentActivityIndex].id]);
    }
    nextActivity();
  };

  const nextActivity = () => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    }
    // Ne plus boucler - on s'arrête à la dernière activité
  };

  const generateResults = async () => {
    setIsLoading(true);
    try {
      const likedActivities = activities.filter(a => liked.includes(a.id));
      const dislikedActivities = activities.filter(a => disliked.includes(a.id));

      const { data, error } = await supabase.functions.invoke('generate-riasec-analysis', {
        body: {
          likedActivities: likedActivities.map(a => ({ title: a.title, category: a.category })),
          dislikedActivities: dislikedActivities.map(a => ({ title: a.title, category: a.category }))
        }
      });

      if (error) throw error;

      setResults(data);
      setCurrentStep('results');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des résultats');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!results) return;
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    let yPosition = addAntheaHeader(pdf, 'Profil RIASEC - Pictotest des métiers');
    
    // Fonction pour ajouter une nouvelle page si nécessaire
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = addAntheaHeader(pdf, 'Profil RIASEC - Pictotest des métiers');
      }
    };
    
    // Section Pôles dominants
    checkNewPage(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vos pôles dominants', margin, yPosition);
    yPosition += 10;
    
    if (Array.isArray(results.dominantProfiles)) {
      results.dominantProfiles.forEach((profile: any) => {
        checkNewPage(20);
        // Extraire le code RIASEC de profile.type
        const match = profile.type?.match(/\(([RIASEC])\)/);
        const profileCode = match ? match[1] : profile.code || profile.category;
        const category = riasecCategories[profileCode as keyof typeof riasecCategories];
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${category?.name || 'Non défini'}`, margin + 5, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(profile.description, maxWidth - 10);
        descLines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin + 10, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      });
    }
    
    // Section Recommandations de métiers
    yPosition += 5;
    checkNewPage(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Métiers recommandés', margin, yPosition);
    yPosition += 10;
    
    if (Array.isArray(results.recommendations)) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      results.recommendations.forEach((rec: string) => {
        checkNewPage(8);
        const recLines = pdf.splitTextToSize(`• ${rec}`, maxWidth - 5);
        recLines.forEach((line: string) => {
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });
    }
    
    // Section Plan d'exploration
    yPosition += 5;
    checkNewPage(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Plan d\'exploration', margin, yPosition);
    yPosition += 10;
    
    if (Array.isArray(results.actionPlan)) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      results.actionPlan.forEach((action: string) => {
        checkNewPage(8);
        const actionLines = pdf.splitTextToSize(action, maxWidth - 5);
        actionLines.forEach((line: string) => {
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });
    }
    
    // Section Opportunités marché (si disponible)
    if (Array.isArray(results.marketOpportunities) && results.marketOpportunities.length > 0) {
      yPosition += 5;
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Opportunités de marché', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      results.marketOpportunities.forEach((opp: string) => {
        checkNewPage(8);
        pdf.text(`• ${opp}`, margin + 5, yPosition);
        yPosition += 6;
      });
    }
    
    pdf.save('profil-riasec-pictotest.pdf');
    toast.success('PDF exporté avec succès');
  };

  const progressPercentage = (evaluated.length / activities.length) * 100;
  const hasEvaluatedAll = evaluated.length === activities.length;
  const canContinue = hasEvaluatedAll && liked.length >= 5;

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour accueil
          </Link>

          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold mb-4">
                Pictotest des métiers
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Découvrez vos préférences professionnelles à travers des activités concrètes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-4">Comment ça marche ?</h3>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold">Explorez les activités</h4>
                    <p className="text-muted-foreground">30 activités professionnelles vous seront présentées sous forme d'images</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold">Évaluez toutes les activités</h4>
                    <p className="text-muted-foreground">Parcourez les 30 activités et sélectionnez au minimum 5 activités que vous aimez pour obtenir vos résultats</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold">Découvrez votre profil RIASEC</h4>
                    <p className="text-muted-foreground">Obtenez vos pôles dominants et des recommandations de métiers personnalisées</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Important :</strong> Il n'y a pas de bonnes ou mauvaises réponses, 
                  seulement vos attirances naturelles. Faites-vous confiance !
                </p>
              </div>

              <Button 
                onClick={() => setCurrentStep('test')} 
                className="w-full"
                size="lg"
              >
                Commencer le test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'test') {
    const currentActivity = activities[currentActivityIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour accueil
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Activité {currentActivityIndex + 1} sur {activities.length}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">Évaluées : {evaluated.length}/{activities.length}</span>
                  <span className="text-green-600">❤️ {liked.length}/15</span>
                  <span className="text-red-600">❌ {disliked.length}/10</span>
                </div>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-8xl mb-6">{currentActivity.image}</div>
                <h3 className="text-2xl font-bold mb-8">{currentActivity.title}</h3>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleLike}
                    disabled={liked.length >= 15}
                    variant="default"
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    J'aime ({liked.length})
                  </Button>
                  
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="lg"
                  >
                    Passer
                  </Button>
                  
                  <Button
                    onClick={handleDislike}
                    disabled={disliked.length >= 10}
                    variant="destructive"
                    size="lg"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Je n'aime pas ({disliked.length})
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  {!hasEvaluatedAll && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 text-center">
                        Évaluez toutes les activités ({evaluated.length}/{activities.length}) pour voir vos résultats
                      </p>
                    </div>
                  )}
                  
                  {hasEvaluatedAll && liked.length < 5 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-800 text-center">
                        Vous devez avoir sélectionné au moins 5 activités que vous aimez ({liked.length}/5)
                      </p>
                    </div>
                  )}
                  
                  {canContinue && (
                    <Button 
                      onClick={generateResults}
                      disabled={isLoading}
                      className="w-full bg-primary"
                      size="lg"
                    >
                      {isLoading ? 'Analyse en cours...' : 'Voir mes résultats'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Retour accueil
            </Link>
            <Button onClick={exportToPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Votre Profil RIASEC
                </CardTitle>
                <p className="text-muted-foreground">
                  Découvrez vos pôles d'intérêt dominants
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Vos pôles dominants :</h3>
                  <div className="grid gap-3">
                    {Array.isArray(results.dominantProfiles) && results.dominantProfiles.map((profile: any, index: number) => {
                      // L'API retourne 'type' comme "Social (S)" - extraire le code entre parenthèses
                      const match = profile.type?.match(/\(([RIASEC])\)/);
                      const profileCode = match ? match[1] : profile.code || profile.category;
                      const category = riasecCategories[profileCode as keyof typeof riasecCategories];
                      if (!category) return null;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                          <Badge className={category.color}>
                            {category.name}
                          </Badge>
                          <span>{profile.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Métiers recommandés :</h3>
                  <div className="grid gap-2">
                    {Array.isArray(results.recommendations) && results.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Plan d'exploration :</h3>
                  <div className="space-y-3">
                    {Array.isArray(results.actionPlan) && results.actionPlan.map((action: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};