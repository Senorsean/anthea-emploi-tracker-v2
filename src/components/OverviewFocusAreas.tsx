import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ExternalLink, Search, Target, TrendingUp, GraduationCap, Grid3X3, Lock } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export const OverviewFocusAreas = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { userRole, hasModuleAccess, isAdmin, isConsultant, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderModuleCard = (area: any, idx: number) => {
    const hasAccess = area.external || hasModuleAccess(area.link);
    const isLocked = !hasAccess && userRole === 'candidat';

    return (
      <Card 
        key={idx} 
        className={`h-full transition-shadow ${hasAccess ? 'hover:shadow-lg' : 'opacity-60'} ${isLocked ? 'border-red-200' : ''}`}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {area.title}
            {isLocked && <Lock className="h-4 w-4 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{area.description}</p>
          {isLocked ? (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Module non assigné
            </div>
          ) : area.external ? (
            <a
              href={area.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#a4007c] hover:underline flex items-center gap-1"
            >
              En savoir plus <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <Link
              to={area.link}
              className="text-sm text-[#a4007c] hover:underline flex items-center gap-1"
            >
              En savoir plus <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDetailedModuleCard = (area: any, idx: number) => {
    const hasAccess = area.external || hasModuleAccess(area.link);
    const isLocked = !hasAccess && userRole === 'candidat';

    return (
      <Card 
        key={idx} 
        className={`h-full transition-all duration-200 ${hasAccess ? 'hover:shadow-lg hover:scale-105' : 'opacity-60'} ${isLocked ? 'border-red-200' : ''}`}
      >
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {area.title}
            {isLocked && <Lock className="h-5 w-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">{area.description}</p>
          {isLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
              <Lock className="h-4 w-4" />
              Module non assigné
            </div>
          ) : area.external ? (
            <a
              href={area.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#a4007c] text-white rounded-lg hover:bg-[#8a0069] transition-colors font-medium"
            >
              Accéder <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <Link
              to={area.link}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#a4007c] text-white rounded-lg hover:bg-[#8a0069] transition-colors font-medium"
            >
              Commencer <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  const categories = [
    {
      title: "Recherche Emploi",
      icon: Search,
      description: "Outils et méthodes pour optimiser vos recherches d'emploi",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-500",
      areas: [
        {
          title: "Concentrer vos recherches d'emploi",
          description:
            "Identifiez les secteurs et entreprises les plus alignés avec votre projet professionnel.",
          link: 'https://match.anthea-rh.com/',
          external: true,
        },
        {
          title: 'Créer votre CV',
          description:
            'Générez un CV professionnel en quelques minutes avec des modèles adaptés.',
          link: 'https://anthea-cv-ready.lovable.app/',
          external: true,
        },
        {
          title: 'Optimiser votre CV',
          description:
            'Mettez en valeur vos compétences clés pour augmenter votre taux de réponse.',
          link: 'https://cv-compass-optimizer.lovable.app/',
          external: true,
        },
        {
          title: 'Analyse du CV et Générateur de lettre de motivation',
          description:
            'Optimisez vos candidatures avec l\'IA pour analyser votre CV et générer des lettres personnalisées.',
          link: 'https://joyful-crepe-00afff.netlify.app/',
          external: true,
        },
        {
          title: 'Développer votre Réseau',
          description:
            'Tirez parti de LinkedIn et de vos contacts pour découvrir de nouvelles opportunités.',
          link: '/renforcez-votre-reseau',
          external: false,
        },
        {
          title: 'Optimiser son profil LinkedIn',
          description:
            'Améliorez votre visibilité et attractivité professionnelle sur LinkedIn.',
          link: '/optimiser-profil-linkedin',
          external: false,
        },
        {
          title: 'Améliorer mes entretiens',
          description:
            'Préparez-vous aux questions d\'entretien et entraînez-vous pour le jour J.',
          link: '/ameliorer-entretiens',
          external: false,
        },
        {
          title: 'Négociation d\'offre',
          description:
            'Comment négocier sa rémunération (salaire + avantages) en entretien suite à une candidature.',
          link: '/negociation-offre',
          external: false,
        },
        {
          title: 'AIre de mobilité',
          description:
            'Identifiez les zones géographiques adaptées à votre profil et vos objectifs.',
          link: '/aire-mobilite',
          external: false,
        },
      ]
    },
    {
      title: "Définition du projet Pro",
      icon: Target,
      description: "Analysez-vous et définissez votre projet professionnel",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-500",
      areas: [
        {
          title: 'Découvrez votre IKIGAÏ',
          description:
            'Trouvez l\'intersection entre passion, mission, profession et vocation pour votre épanouissement professionnel.',
          link: '/ikigai',
          external: false,
        },
        {
          title: 'L\'Analyse Transactionnelle & Drivers',
          description:
            'Identifiez vos schémas inconscients ("Sois parfait", "Fais plaisir", "Sois fort", "Dépêche-toi", "Fais des efforts") et comprenez leur impact professionnel.',
          link: '/analyse-transactionnelle',
          external: false,
        },
        {
          title: 'SWOT Personnel',
          description:
            'Analysez vos Forces, Faiblesses, Opportunités et Menaces. Issu du management stratégique, adapté à l\'individu pour une vision claire de votre situation professionnelle.',
          link: '/swot-personnel',
          external: false,
        },
        {
          title: 'Méthode SMART / OKR appliquée à la carrière',
          description:
            'Définir un objectif professionnel clair (Spécifique, Mesurable, Atteignable, Réaliste, Temporel). Puis découper en sous-objectifs comme dans la gestion de projet. Concret et actionnable.',
          link: '/methode-smart',
          external: false,
        },
        {
          title: 'Le Golden Circle de Simon Sinek',
          description:
            'Trouver son Why (raison d\'être), puis son How (forces / méthodes), puis son What (activités concrètes). Simple, très inspirant, bon complément de l\'Ikigai.',
          link: '/golden-circle',
          external: false,
        },
        {
          title: 'Ancres de carrière de Schein 📍',
          description:
            '8 motivateurs de carrière (technique, management, autonomie, sécurité, créativité, etc.). Aide à comprendre ce qui vous retient vraiment dans un emploi.',
          link: '/ancres-carriere',
          external: false,
        },
      ]
    },
    {
      title: "Progression de Carrière",
      icon: TrendingUp,
      description: "Évoluez et progressez dans votre carrière",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-500",
      areas: [
        {
          title: 'Progression de Carrière',
          description:
            'Préparez les prochaines étapes de votre parcours professionnel',
          link: '/progression-carriere',
          external: false,
        },
        {
          title: 'Tester vos connaissances sur votre métier',
          description:
            'Évaluez vos compétences professionnelles avec un quiz adapté',
          link: '/tester-connaissances',
          external: false,
        },
        {
          title: 'Compétences & Formation continue',
          description:
            'Identifiez les compétences clés de demain (IA, digital, soft skills). Plan de montée en compétences (MOOC, formations certifiantes, mentorat). Suivi via un portfolio ou carnet de progression.',
          link: '/competences-formation',
          external: false,
        },
        // Tests d'intérêts
        {
          title: 'IRMR3 [Intérêts] (Inventaire des Intérêts Professionnels)',
          description:
            'Tests d\'intérêts - Mesure les centres d\'intérêt professionnels selon 7 grands domaines : Artistique, Contact, Entreprise, Gestion, Manuel, Sciences, Social. Adapté aux jeunes comme aux adultes en reconversion.',
          link: '/irmr3',
          external: false,
        },
        {
          title: 'Pictotest des métiers [Intérêts] (RIASEC)',
          description:
            'Tests d\'intérêts - Explorez vos préférences professionnelles à partir d\'images d\'activités concrètes pour révéler vos pôles d\'intérêt dominants selon le modèle RIASEC.',
          link: '/pictotest-metiers',
          external: false,
        },
        // Tests de personnalité
        {
          title: 'MBTI [Personnalité] (Myers-Briggs Type Indicator)',
          description:
            'Tests de personnalité - Mesure la personnalité sur 4 axes → 16 types de profils. Utile pour comprendre son style de communication, de travail et de management.',
          link: '/mbti',
          external: false,
        },
        {
          title: 'Big Five [Personnalité] / OCEAN',
          description:
            'Tests de personnalité - Mesure la personnalité selon 5 grands traits (Ouverture, Conscienciosité, Extraversion, Agréabilité, Neuroticisme). Très utilisé scientifiquement.',
          link: '/big-five',
          external: false,
        },
        // Tests de motivations
        {
          title: 'Questionnaire Motivations [Motivations] (MVPI, Reiss)',
          description:
            'Tests de motivations - Explore les moteurs profonds (pouvoir, sécurité, liberté, reconnaissance, curiosité, etc.). Aide à comprendre ce qui soutient l\'engagement sur le long terme.',
          link: '/questionnaire-motivations',
          external: false,
        },
        {
          title: 'CAP [Motivations] (Cartographie des Atouts Professionnels)',
          description:
            'Tests de motivations - Utilisé en France dans les bilans de compétences. Combine centres d\'intérêt, valeurs et compétences transversales pour des plans d\'action concrets.',
          link: '/bilan-competences',
          external: false,
        },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      {/* Navigation par onglets */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-4xl mx-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Tout voir
          </TabsTrigger>
          <TabsTrigger value="recherche" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Recherche Emploi
          </TabsTrigger>
          <TabsTrigger value="projet" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projet Pro
          </TabsTrigger>
          <TabsTrigger value="carriere" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progression
          </TabsTrigger>
        </TabsList>

        {/* Vue "Tout voir" */}
        <TabsContent value="all" className="space-y-12 mt-8">
          {categories.map((category, categoryIdx) => (
            <div key={categoryIdx} className="space-y-6">
              {/* Category Header */}
              <div className={`p-6 rounded-lg ${category.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                </div>
                <p className="text-gray-600">{category.description}</p>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.areas.map((area, idx) => renderModuleCard(area, idx))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Vue par catégorie individuelle */}
        {categories.map((category, categoryIdx) => (
          <TabsContent 
            key={categoryIdx} 
            value={categoryIdx === 0 ? "recherche" : categoryIdx === 1 ? "projet" : "carriere"} 
            className="space-y-6 mt-8"
          >
            {/* Category Header */}
            <div className={`p-8 rounded-lg ${category.color} text-center`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <category.icon className={`h-8 w-8 ${category.iconColor}`} />
                <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.areas.map((area, idx) => renderDetailedModuleCard(area, idx))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OverviewFocusAreas;