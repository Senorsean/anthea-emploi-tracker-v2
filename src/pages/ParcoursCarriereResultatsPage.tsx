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

  // Simuler des données de progression de carrière
  const careerSteps = [
    {
      title: `${careerData.jobTitle} Senior`,
      timeframe: '6-12 mois',
      description: 'Évolution naturelle avec plus de responsabilités',
      requirements: ['Leadership renforcé', 'Expertise technique approfondie'],
      salaryIncrease: '+15-25%',
      details: {
        responsibilities: [
          'Encadrement de 2-3 junior',
          'Participation aux décisions stratégiques',
          'Formation et mentorat',
          'Gestion de projets complexes'
        ],
        skills: [
          'Communication avancée',
          'Gestion de conflit',
          'Planification stratégique',
          'Technologies émergentes'
        ],
        opportunities: [
          'Certification en management',
          'Formation leadership',
          'Participation à des conférences',
          'Projets transversaux'
        ]
      }
    },
    {
      title: `Directeur ${careerData.jobTitle}`,
      timeframe: '1-2 ans',
      description: 'Prise de responsabilités managériales étendues',
      requirements: ['Management d\'équipe', 'Vision stratégique'],
      salaryIncrease: '+35-50%',
      details: {
        responsibilities: [
          'Management de 5-15 personnes',
          'Définition de la stratégie départementale',
          'Budget et ressources',
          'Relation avec les parties prenantes'
        ],
        skills: [
          'Management stratégique',
          'Gestion budgétaire',
          'Négociation avancée',
          'Intelligence émotionnelle'
        ],
        opportunities: [
          'MBA ou Executive Education',
          'Coaching exécutif',
          'Réseau de dirigeants',
          'Projets de transformation'
        ]
      }
    },
    {
      title: 'VP/Directeur Général',
      timeframe: '3-5 ans',
      description: 'Leadership exécutif et vision d\'entreprise',
      requirements: ['Leadership exécutif', 'Business development'],
      salaryIncrease: '+70-100%',
      details: {
        responsibilities: [
          'Vision et stratégie globale',
          'P&L de division',
          'Transformation organisationnelle',
          'Relations investisseurs/board'
        ],
        skills: [
          'Vision stratégique',
          'Leadership transformationnel',
          'Gestion du changement',
          'Acumen business'
        ],
        opportunities: [
          'Conseil d\'administration externe',
          'Speaking à des conférences',
          'Mentorat de dirigeants',
          'Acquisitions et partenariats'
        ]
      }
    }
  ];

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