import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, MapPin, Briefcase, Star, ChevronRight, ChevronDown, Clock, Target, BookOpen, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ParcoursCarriereResultatsPage = () => {
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState<any>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('careerPathData');
    if (savedData) {
      setCareerData(JSON.parse(savedData));
    } else {
      // Rediriger vers le formulaire si pas de données
      navigate('/parcours-carriere');
    }
  }, [navigate]);

  if (!careerData) {
    return <div>Chargement...</div>;
  }

  // Fonction pour générer des parcours personnalisés
  const generateCareerPath = () => {
    const experience = parseInt(careerData.experience) || 0;
    const jobTitle = careerData.jobTitle;
    const teamSize = careerData.teamSize;
    const scope = careerData.scope;
    
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

      if (scope === 'global' || careerData.industry?.includes('Finance') || careerData.industry?.includes('Technologie')) {
        steps.push({
          title: `Directeur ${jobTitle.replace(/(Responsable|Manager|Chef)/i, '')}`,
          timeframe: '4-6 ans',
          description: 'Responsabilités managériales étendues',
          requirements: ['Management stratégique', 'Business acumen'],
          salaryIncrease: '+50-70%',
          details: {
            responsibilities: [
              'Management de 10-20 personnes',
              'P&L département',
              'Stratégie business unit',
              'Développement commercial'
            ],
            skills: [
              'Leadership stratégique',
              'Gestion budgétaire',
              'Vision business',
              'Intelligence émotionnelle'
            ],
            opportunities: [
              'Executive MBA',
              'Coaching de dirigeant',
              'Conseil d\'administration',
              'Acquisitions et partenariats'
            ]
          }
        });
      }
    }

    else if (currentLevel === 'confirmed') {
      steps.push({
        title: `${jobTitle} Senior`,
        timeframe: '1-3 ans',
        description: 'Expertise technique et leadership',
        requirements: ['Expertise avancée', 'Leadership d\'équipe'],
        salaryIncrease: '+15-25%',
        details: {
          responsibilities: [
            'Encadrement technique d\'équipe',
            'Architecture et conception',
            'Interface clients stratégiques',
            'Innovation et R&D'
          ],
          skills: [
            'Expertise technique poussée',
            'Leadership technique',
            'Communication stratégique',
            'Innovation'
          ],
          opportunities: [
            'Spécialisations techniques',
            'Formation en leadership',
            'Conférences et publications',
            'Projets innovants'
          ]
        }
      });

      if (teamSize !== 'no') {
        steps.push({
          title: `Manager ${jobTitle.replace(/(Senior|Confirmé)/i, '')}`,
          timeframe: '2-4 ans',
          description: 'Transition vers le management',
          requirements: ['Management d\'équipe', 'Vision produit'],
          salaryIncrease: '+30-45%',
          details: {
            responsibilities: [
              'Management de 5-15 personnes',
              'Définition de roadmap',
              'Budget et ressources',
              'Développement d\'équipe'
            ],
            skills: [
              'Management opérationnel',
              'Gestion budgétaire',
              'Développement des talents',
              'Communication executive'
            ],
            opportunities: [
              'Formation management',
              'Coaching professionnel',
              'Réseaux de managers',
              'Projets de transformation'
            ]
          }
        });

        steps.push({
          title: `Directeur ${jobTitle.replace(/(Senior|Confirmé|Manager)/i, '')}`,
          timeframe: '3-5 ans',
          description: 'Leadership départemental',
          requirements: ['Vision stratégique', 'Business development'],
          salaryIncrease: '+60-80%',
          details: {
            responsibilities: [
              'Management multi-équipes',
              'Stratégie départementale',
              'P&L responsability',
              'Partenariats stratégiques'
            ],
            skills: [
              'Leadership stratégique',
              'Business acumen',
              'Négociation complexe',
              'Change management'
            ],
            opportunities: [
              'Executive MBA',
              'Mandats externes',
              'Speaking international',
              'Board participation'
            ]
          }
        });
      }
    }

    else if (currentLevel === 'senior') {
      if (teamSize === 'no' || teamSize === '1-4') {
        steps.push({
          title: `Lead ${jobTitle}`,
          timeframe: '6-18 mois',
          description: 'Leadership technique avancé',
          requirements: ['Expertise reconnue', 'Influence technique'],
          salaryIncrease: '+10-20%',
          details: {
            responsibilities: [
              'Architecture technique globale',
              'Mentoring d\'experts',
              'Standards et best practices',
              'Innovation technologique'
            ],
            skills: [
              'Expertise technique reconnue',
              'Leadership d\'influence',
              'Vision technologique',
              'Communication executive'
            ],
            opportunities: [
              'Conférences internationales',
              'Publications techniques',
              'Comités techniques',
              'Innovation labs'
            ]
          }
        });
      }

      steps.push({
        title: `Manager ${jobTitle.replace(/Senior|Lead/i, '')}`,
        timeframe: '1-2 ans',
        description: 'Management d\'équipe élargie',
        requirements: ['Management avancé', 'Vision business'],
        salaryIncrease: '+25-40%',
        details: {
          responsibilities: [
            'Management de 8-20 personnes',
            'Budget et ROI',
            'Stratégie opérationnelle',
            'Développement business'
          ],
          skills: [
            'Management stratégique',
            'Business analysis',
            'Leadership transformationnel',
            'Gestion du changement'
          ],
          opportunities: [
            'Executive education',
            'Board advisory',
            'Industry leadership',
            'Strategic partnerships'
          ]
        }
      });

      steps.push({
        title: scope === 'global' ? 'VP/Directeur Régional' : 'Directeur',
        timeframe: '2-4 ans',
        description: 'Leadership exécutif',
        requirements: ['Vision stratégique', 'Leadership exécutif'],
        salaryIncrease: '+50-80%',
        details: {
          responsibilities: [
            'P&L multi-millions',
            'Stratégie corporate',
            'M&A et partenariats',
            'Board reporting'
          ],
          skills: [
            'Strategic thinking',
            'Executive presence',
            'Financial acumen',
            'Stakeholder management'
          ],
          opportunities: [
            'CEO track',
            'Board positions',
            'Industry thought leadership',
            'Global assignments'
          ]
        }
      });
    }

    else if (currentLevel === 'senior-manager') {
      steps.push({
        title: 'Directeur Senior',
        timeframe: '1-2 ans',
        description: 'Leadership multi-départements',
        requirements: ['Leadership matrix', 'Transformation'],
        salaryIncrease: '+20-35%',
        details: {
          responsibilities: [
            'Management transversal',
            'Transformation digitale',
            'Stratégie corporate',
            'Gouvernance'
          ],
          skills: [
            'Matrix leadership',
            'Digital transformation',
            'Corporate strategy',
            'Governance'
          ],
          opportunities: [
            'C-level transition',
            'Board mandates',
            'Industry transformation',
            'Global leadership'
          ]
        }
      });

      steps.push({
        title: scope === 'global' ? 'VP Global' : 'Directeur Général',
        timeframe: '2-3 ans',
        description: 'Leadership exécutif global',
        requirements: ['Vision globale', 'Transformation business'],
        salaryIncrease: '+40-70%',
        details: {
          responsibilities: [
            'P&L global',
            'Vision et stratégie',
            'Transformation organisationnelle',
            'Stakeholder management'
          ],
          skills: [
            'Global leadership',
            'Strategic visioning',
            'Organizational transformation',
            'Investor relations'
          ],
          opportunities: [
            'CEO succession',
            'Multiple board seats',
            'Industry spokesperson',
            'Thought leadership'
          ]
        }
      });

      steps.push({
        title: 'CEO/Président',
        timeframe: '3-5 ans',
        description: 'Direction générale',
        requirements: ['Leadership visionnaire', 'Création de valeur'],
        salaryIncrease: '+70-150%',
        details: {
          responsibilities: [
            'Vision entreprise',
            'Création de valeur',
            'Écosystème stratégique',
            'Legacy building'
          ],
          skills: [
            'Visionary leadership',
            'Value creation',
            'Ecosystem thinking',
            'Legacy mindset'
          ],
          opportunities: [
            'Industry transformation',
            'Multiple board mandates',
            'Thought leadership global',
            'Entrepreneurship'
          ]
        }
      });
    }

    return steps;
  };

  const careerSteps = generateCareerPath();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/parcours-carriere"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au formulaire
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Votre Parcours de Carrière Personnalisé
            </h1>
            <p className="text-lg text-gray-600">
              Basé sur votre profil : {careerData.jobTitle} avec {careerData.experience} ans d'expérience
            </p>
          </div>

          {/* Current Profile Summary */}
          <Card className="mb-8 bg-gradient-to-r from-[#a4007c]/10 to-[#a4007c]/5 border-[#a4007c]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#a4007c]" />
                Votre Profil Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Équipe: {careerData.teamSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{careerData.scope}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{careerData.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{careerData.workArrangement}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Path */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Évolutions Possibles</h2>
            <div className="space-y-6">
              {careerSteps.map((step, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-[#a4007c] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {step.salaryIncrease}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {step.requirements.map((req, reqIndex) => (
                            <span key={reqIndex} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {req}
                            </span>
                          ))}
                        </div>

                        {/* Expanded Details */}
                        {expandedStep === index && (
                          <div className="mt-6 space-y-6 border-t pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Responsibilities */}
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                                  <Target className="h-4 w-4 text-[#a4007c]" />
                                  Responsabilités clés
                                </h4>
                                <ul className="space-y-2">
                                  {step.details.responsibilities.map((resp, respIndex) => (
                                    <li key={respIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 bg-[#a4007c] rounded-full mt-2 flex-shrink-0" />
                                      {resp}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Skills */}
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                                  <BookOpen className="h-4 w-4 text-[#a4007c]" />
                                  Compétences requises
                                </h4>
                                <ul className="space-y-2">
                                  {step.details.skills.map((skill, skillIndex) => (
                                    <li key={skillIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      {skill}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Opportunities */}
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                                  <TrendingUp className="h-4 w-4 text-[#a4007c]" />
                                  Opportunités de développement
                                </h4>
                                <ul className="space-y-2">
                                  {step.details.opportunities.map((opp, oppIndex) => (
                                    <li key={oppIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                      {opp}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end">
                        <div className="flex items-center gap-1 text-sm text-gray-500 font-medium mb-2">
                          <Clock className="h-4 w-4" />
                          {step.timeframe}
                        </div>
                        {expandedStep === index ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index} className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg text-[#a4007c]">{rec.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {rec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#a4007c] rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate('/parcours-carriere')}
              variant="outline"
              className="mr-4"
            >
              Modifier mes informations
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-[#a4007c] hover:bg-[#8a0066] text-white"
            >
              Télécharger le rapport
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParcoursCarriereResultatsPage;