import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, ChevronDown, ChevronUp, User, MapPin, Briefcase, GraduationCap, Calendar, Users, Target, TrendingUp, Star, BookOpen, Network, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

const ParcoursCarriereResultatsPage = () => {
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [careerSteps, setCareerSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('careerPathData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setCareerData(data);
      generateAICareerPath(data);
    } else {
      navigate('/parcours-carriere');
    }
  }, [navigate]);

  const generateAICareerPath = async (data) => {
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-career-path', {
        body: { careerData: data }
      });

      if (error) {
        console.error('Error generating career path:', error);
        toast.error('Erreur lors de la génération du parcours. Utilisation du parcours par défaut.');
        setCareerSteps(getDefaultCareerPath(data));
      } else {
        setCareerSteps(result.steps || []);
        toast.success('Parcours de carrière personnalisé généré avec succès !');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la génération du parcours. Utilisation du parcours par défaut.');
      setCareerSteps(getDefaultCareerPath(data));
    } finally {
      setIsGenerating(false);
    }
  };

  const getDefaultCareerPath = (data) => {
    if (!data) return [];
    
    const experience = parseInt(data.experience) || 0;
    const jobTitle = data.jobTitle;
    const teamSize = data.teamSize;
    const scope = data.scope;
    
    // Déterminer le niveau actuel
    let currentLevel = 'junior';
    if (experience >= 8 && (teamSize === '5-10' || teamSize === '10+')) {
      currentLevel = 'senior-manager';
    } else if (experience >= 5 || teamSize === '1-4' || teamSize === '5-10') {
      currentLevel = 'senior';
    } else if (experience >= 3) {
      currentLevel = 'confirmed';
    }

    // Générer les étapes selon le niveau actuel et le profil
    const steps = [];

    if (currentLevel === 'junior') {
      steps.push({
        title: `${jobTitle} Confirmé(e)`,
        timeframe: '1-2 ans',
        description: 'Montée en compétences et prise d\'autonomie',
        requirements: ['Maîtrise technique', 'Autonomie opérationnelle'],
        salaryIncrease: '+10-20%',
        details: {
          responsibilities: [
            'Gestion de projets en autonomie',
            'Formation des nouveaux arrivants',
            'Participation aux décisions techniques',
            'Interface avec les clients'
          ],
          skills: [
            'Expertise métier approfondie',
            'Communication client',
            'Gestion de projet',
            'Analyse et résolution de problèmes'
          ],
          opportunities: [
            'Certifications professionnelles',
            'Formation en gestion de projet',
            'Participation à des conférences',
            'Projets transversaux'
          ]
        }
      });

      steps.push({
        title: `${jobTitle} Senior`,
        timeframe: '2-4 ans',
        description: 'Leadership technique et encadrement',
        requirements: ['Leadership technique', 'Mentoring'],
        salaryIncrease: '+25-35%',
        details: {
          responsibilities: [
            'Encadrement de 2-4 personnes',
            'Définition des standards techniques',
            'Pilotage de projets complexes',
            'Relation avec les parties prenantes'
          ],
          skills: [
            'Leadership technique',
            'Management d\'équipe',
            'Vision stratégique',
            'Négociation'
          ],
          opportunities: [
            'Formation en management',
            'MBA ou formation executive',
            'Réseau professionnel',
            'Projets d\'innovation'
          ]
        }
      });
    }

    return steps;
  };

  if (!careerData) {
    return <div>Chargement...</div>;
  }

  const recommendations = [
    {
      category: 'Compétences à développer',
      items: ['Leadership stratégique', 'Intelligence émotionnelle', 'Négociation avancée']
    },
    {
      category: 'Certifications recommandées',
      items: ['MBA ou Executive MBA', 'Certification PMP', 'Formation en Digital Leadership']
    },
    {
      category: 'Réseautage',
      items: ['Rejoindre des associations professionnelles', 'Mentoring de jeunes talents', 'Conférences sectorielles']
    }
  ];

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Titre
    pdf.setFontSize(20);
    pdf.text('Parcours de Carrière Personnalisé', 20, 30);
    
    // Profil actuel
    pdf.setFontSize(14);
    pdf.text(`Profil: ${careerData.jobTitle} - ${careerData.experience} ans d'expérience`, 20, 50);
    
    let yPosition = 70;
    
    // Étapes de carrière
    careerSteps.forEach((step, index) => {
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${step.title}`, 20, yPosition);
      pdf.setFontSize(10);
      pdf.text(`Délai: ${step.timeframe} | Augmentation: ${step.salaryIncrease}`, 20, yPosition + 10);
      pdf.text(step.description, 20, yPosition + 20);
      yPosition += 40;
      
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
    });
    
    pdf.save('parcours-carriere.pdf');
    toast.success('Rapport téléchargé avec succès !');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/parcours-carriere')}
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au formulaire</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Votre Parcours de Carrière Personnalisé
            </h1>
            <p className="text-lg text-muted-foreground">
              Basé sur votre profil actuel et généré par l'IA pour correspondre à vos objectifs
            </p>
          </div>

          {/* Current Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-6 w-6 text-primary" />
                <span>Votre Profil Actuel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{careerData.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{careerData.experience} ans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Équipe: {careerData.teamSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{careerData.scope}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Évolutions possibles */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Évolutions Possibles</span>
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Génération de votre parcours personnalisé avec l'IA...</p>
                </div>
              ) : (
                careerSteps.map((step, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.timeframe}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{step.salaryIncrease}</Badge>
                          {expandedStep === index ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="space-y-4 pt-4 border-t">
                        <p className="text-muted-foreground">{step.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {step.requirements?.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="outline">{req}</Badge>
                          ))}
                        </div>

                        {step.details && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold flex items-center space-x-2 mb-2">
                                <Target className="h-4 w-4 text-primary" />
                                <span>Responsabilités</span>
                              </h4>
                              <ul className="space-y-1">
                                {step.details.responsibilities?.map((resp, respIndex) => (
                                  <li key={respIndex} className="text-sm text-muted-foreground">
                                    • {resp}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold flex items-center space-x-2 mb-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span>Compétences</span>
                              </h4>
                              <ul className="space-y-1">
                                {step.details.skills?.map((skill, skillIndex) => (
                                  <li key={skillIndex} className="text-sm text-muted-foreground">
                                    • {skill}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold flex items-center space-x-2 mb-2">
                                <Star className="h-4 w-4 text-primary" />
                                <span>Opportunités</span>
                              </h4>
                              <ul className="space-y-1">
                                {step.details.opportunities?.map((opp, oppIndex) => (
                                  <li key={oppIndex} className="text-sm text-muted-foreground">
                                    • {opp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {index === 0 && <BookOpen className="h-5 w-5 text-primary" />}
                    {index === 1 && <Award className="h-5 w-5 text-primary" />}
                    {index === 2 && <Network className="h-5 w-5 text-primary" />}
                    <span>{rec.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {rec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/parcours-carriere')}
            >
              Modifier mes informations
            </Button>
            <Button
              onClick={downloadPDF}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger le rapport</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParcoursCarriereResultatsPage;