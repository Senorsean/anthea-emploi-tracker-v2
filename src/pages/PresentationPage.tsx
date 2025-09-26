import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen,
  Brain,
  MessageSquare,
  BarChart3,
  FileText,
  Calendar,
  Briefcase,
  UserCheck,
  Lightbulb,
  Award,
  Map,
  Settings,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  PieChart,
  Star
} from 'lucide-react';

export const PresentationPage = () => {
  const modules = [
    {
      category: "Tableau de bord principal",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-blue-50 border-blue-200",
      items: [
        {
          title: "Statistiques en temps réel",
          description: "Suivi complet de vos candidatures avec métriques avancées",
          features: ["Candidatures totales", "Taux de conversion", "Entretiens obtenus", "Offres reçues"],
          icon: <TrendingUp className="h-5 w-5" />,
          link: "/"
        },
        {
          title: "Kanban des candidatures", 
          description: "Organisation visuelle de vos candidatures par étape",
          features: ["Offres trouvées", "Candidatures envoyées", "Relances", "Entretiens", "Finales"],
          icon: <Target className="h-5 w-5" />,
          link: "/"
        },
        {
          title: "CRM Réseau",
          description: "Gestion complète de votre réseau professionnel",
          features: ["Contacts organisés", "Suivi des interactions", "Import/Export", "Relances automatiques"],
          icon: <Users className="h-5 w-5" />,
          link: "/"
        },
        {
          title: "Insights IA",
          description: "Analyses intelligentes de vos performances",
          features: ["Recommandations personnalisées", "Détection de tendances", "Points d'amélioration", "Conseils stratégiques"],
          icon: <Brain className="h-5 w-5" />,
          link: "/"
        }
      ]
    },
    {
      category: "Préparation d'entretiens",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-green-50 border-green-200",
      items: [
        {
          title: "Améliorer mes entretiens",
          description: "Module complet de préparation aux entretiens",
          features: ["Techniques d'entretien", "Gestion du stress", "Questions types", "Prise de notes"],
          icon: <MessageSquare className="h-5 w-5" />,
          link: "/ameliorer-entretiens"
        },
        {
          title: "Méthode STAR",
          description: "Maîtrisez la technique STAR pour structurer vos réponses",
          features: ["Situation", "Tâche", "Action", "Résultat"],
          icon: <Star className="h-5 w-5" />,
          link: "/methode-star"
        },
        {
          title: "Préparation entretien",
          description: "Préparation ciblée pour chaque entretien",
          features: ["Recherche entreprise", "Questions à poser", "Pitch personnel", "Simulation"],
          icon: <Calendar className="h-5 w-5" />,
          link: "/preparation-entretien"
        },
        {
          title: "Relancer un employeur",
          description: "Stratégies de relance après entretien",
          features: ["Timing optimal", "Messages types", "Canaux de communication", "Suivi des relances"],
          icon: <ArrowRight className="h-5 w-5" />,
          link: "/relancer-employeur"
        }
      ]
    },
    {
      category: "Recherche d'emploi",
      icon: <Briefcase className="h-6 w-6" />,
      color: "bg-indigo-50 border-indigo-200",
      items: [
        {
          title: "Analyse du CV et Générateur de lettre de motivation",
          description: "Optimisez vos candidatures avec l'IA",
          features: ["Analyse CV automatique", "Génération lettres personnalisées", "Conseils d'amélioration", "Optimisation ATS"],
          icon: <FileText className="h-5 w-5" />,
          link: "https://joyful-crepe-00afff.netlify.app/"
        }
      ]
    },
    {
      category: "Développement professionnel", 
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-purple-50 border-purple-200",
      items: [
        {
          title: "Parcours de carrière",
          description: "Planification et évolution de votre carrière",
          features: ["Analyse de trajectoire", "Opportunités d'évolution", "Compétences clés", "Roadmap personnalisée"],
          icon: <Map className="h-5 w-5" />,
          link: "/parcours-carriere"
        },
        {
          title: "Bilan de compétences",
          description: "Évaluation complète de vos compétences",
          features: ["Audit des compétences", "Identification des gaps", "Plan de développement", "Certification"],
          icon: <Award className="h-5 w-5" />,
          link: "/bilan-competences"
        },
        {
          title: "Apprentissage compétences",
          description: "Développement continu de vos compétences",
          features: ["Formation ciblée", "Ressources d'apprentissage", "Suivi de progression", "Certification"],
          icon: <BookOpen className="h-5 w-5" />,
          link: "/apprentissage-competences"
        },
        {
          title: "Intelligence marché",
          description: "Analyse du marché de l'emploi dans votre secteur",
          features: ["Tendances emploi", "Salaires moyens", "Compétences recherchées", "Opportunités"],
          icon: <PieChart className="h-5 w-5" />,
          link: "/intelligence-marche"
        }
      ]
    },
    {
      category: "Tests et évaluations",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-orange-50 border-orange-200", 
      items: [
        {
          title: "Test MBTI",
          description: "Découvrez votre type de personnalité Myers-Briggs",
          features: ["16 types de personnalité", "Préférences comportementales", "Carrières adaptées", "Rapport détaillé"],
          icon: <UserCheck className="h-5 w-5" />,
          link: "/mbti"
        },
        {
          title: "Test Big Five",
          description: "Analyse de personnalité selon les 5 grands facteurs",
          features: ["Ouverture", "Conscienciosité", "Extraversion", "Amabilité", "Névrosisme"],
          icon: <Brain className="h-5 w-5" />,
          link: "/big-five"
        },
        {
          title: "Ikigai",
          description: "Trouvez votre raison d'être professionnelle",
          features: ["Passion", "Mission", "Profession", "Vocation"],
          icon: <Target className="h-5 w-5" />,
          link: "/ikigai"
        },
        {
          title: "Analyse SWOT personnel",
          description: "Évaluez vos forces, faiblesses, opportunités et menaces",
          features: ["Forces", "Faiblesses", "Opportunités", "Menaces"],
          icon: <BarChart3 className="h-5 w-5" />,
          link: "/swot-personnel"
        },
        {
          title: "Golden Circle",
          description: "Clarifiez votre pourquoi, comment et quoi",
          features: ["Why (Pourquoi)", "How (Comment)", "What (Quoi)", "Vision claire"],
          icon: <Target className="h-5 w-5" />,
          link: "/golden-circle"
        }
      ]
    },
    {
      category: "Réseau et visibilité",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-pink-50 border-pink-200",
      items: [
        {
          title: "Renforcez votre réseau",
          description: "Stratégies pour développer votre réseau professionnel",
          features: ["Identification de contacts", "Événements networking", "Suivi des relations", "Recommandations"],
          icon: <Users className="h-5 w-5" />,
          link: "/renforcez-votre-reseau"
        },
        {
          title: "Optimiser profil LinkedIn",
          description: "Maximisez votre présence sur LinkedIn",
          features: ["Optimisation profil", "Contenu engageant", "Réseau stratégique", "Visibilité"],
          icon: <Globe className="h-5 w-5" />,
          link: "/optimiser-profil-linkedin"
        },
        {
          title: "Webzines Anthea",
          description: "Veille emploi et actualités sectorielles",
          features: ["Actualités emploi", "Tendances marché", "Opportunités", "Informations sectorielles"],
          icon: <ExternalLink className="h-5 w-5" />,
          link: "/"
        }
      ]
    },
    {
      category: "Outils avancés",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-gray-50 border-gray-200",
      items: [
        {
          title: "Référentiels salaires",
          description: "Données salariales pour négociation",
          features: ["Grilles salariales", "Benchmarks secteur", "Négociation", "Évolution"],
          icon: <BarChart3 className="h-5 w-5" />,
          link: "/referentiels-salaires"
        },
        {
          title: "Négociation d'offre",
          description: "Techniques de négociation salariale et contractuelle",
          features: ["Stratégies négociation", "Arguments clés", "Contre-propositions", "Finalisation"],
          icon: <Briefcase className="h-5 w-5" />,
          link: "/negociation-offre"
        },
        {
          title: "Aire de mobilité",
          description: "Analysez vos possibilités géographiques",
          features: ["Zones de mobilité", "Opportunités régionales", "Coût de la vie", "Transport"],
          icon: <Map className="h-5 w-5" />,
          link: "/aire-mobilite"
        },
        {
          title: "Export et rapports",
          description: "Génération de rapports personnalisés",
          features: ["Rapport PDF", "Données Excel", "Statistiques avancées", "Sauvegarde"],
          icon: <FileText className="h-5 w-5" />,
          link: "/"
        }
      ]
    }
  ];

  const stats = [
    { label: "Modules disponibles", value: "25+", icon: <Zap className="h-5 w-5" /> },
    { label: "Tests de personnalité", value: "8", icon: <Brain className="h-5 w-5" /> },
    { label: "Outils de suivi", value: "15", icon: <Target className="h-5 w-5" /> },
    { label: "Ressources externes", value: "50+", icon: <ExternalLink className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4007c] to-[#e3007b] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Emploi Tracker
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-8">
              Votre plateforme complète pour optimiser votre recherche d'emploi et développer votre carrière
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center min-w-[150px]">
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
            <Link to="/">
              <Button className="bg-white text-[#a4007c] hover:bg-gray-100 text-lg px-8 py-3">
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {modules.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-6">
              {/* Category Header */}
              <div className={`${category.color} rounded-xl p-6`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                    <p className="text-gray-600">
                      {category.items.length} module{category.items.length > 1 ? 's' : ''} disponible{category.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-[#a4007c]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-[#a4007c]/10 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                        </div>
                      </CardTitle>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Link to={item.link}>
                          <Button className="w-full bg-[#a4007c] hover:bg-[#a4007c]/90">
                            Accéder au module
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-[#a4007c]/5 to-[#e3007b]/5 border-[#a4007c]/20">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Prêt à booster votre recherche d'emploi ?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Utilisez tous ces outils pour maximiser vos chances de décrocher le poste de vos rêves
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="bg-[#a4007c] hover:bg-[#a4007c]/90 text-lg px-8 py-3">
                    <Target className="mr-2 h-5 w-5" />
                    Commencer maintenant
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline" className="text-lg px-8 py-3">
                    <Settings className="mr-2 h-5 w-5" />
                    Configuration
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;