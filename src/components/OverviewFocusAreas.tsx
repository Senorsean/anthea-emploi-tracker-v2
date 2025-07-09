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
      link: 'https://cv-compass-generator.lovable.app/',
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
