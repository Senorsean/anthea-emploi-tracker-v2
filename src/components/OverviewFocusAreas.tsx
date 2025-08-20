import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const OverviewFocusAreas = () => {
  const areas = [
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
      title: 'AIre de mobilité',
      description:
        'Identifiez les zones géographiques adaptées à votre profil et vos objectifs.',
      link: '/aire-mobilite',
      external: false,
    },
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
      title: 'Bilan de compétences (France / Europe)',
      description:
        'Méthode structurée et encadrée légalement. Analyse des compétences, motivations, valeurs et aptitudes. Débouche sur un projet professionnel ou de formation réaliste.',
      link: '/bilan-competences',
      external: false,
    },
    {
      title: 'Méthode SMART / OKR appliquée à la carrière',
      description:
        'Définir un objectif professionnel clair (Spécifique, Mesurable, Atteignable, Réaliste, Temporel). Puis découper en sous-objectifs comme dans la gestion de projet. Concret et actionnable.',
      link: '/methode-smart',
      external: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {areas.map((area, idx) => (
        <Card key={idx} className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {area.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">{area.description}</p>
            {area.external ? (
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
      ))}
    </div>
  );
};

export default OverviewFocusAreas;