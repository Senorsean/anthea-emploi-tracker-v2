import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProgressionCarrierePage = () => {
  const modules = [
    {
      title: 'Référentiels de Salaires',
      description: 'Connaître votre valeur et votre potentiel de croissance salariale',
      icon: BarChart3,
      link: '/referentiels-salaires',
    },
    {
      title: 'Parcours de Carrière',
      description: 'Possibles prochaines évolutions de carrière',
      icon: TrendingUp,
      link: '/parcours-carriere',
    },
    {
      title: 'Coaching Cadre',
      description: 'Accompagnement personnalisé pour le développement professionnel',
      icon: Users,
      link: '/coaching-cadre',
    },
    {
      title: 'Apprentissage & Montée en compétences',
      description: 'Opportunités de croissance personnelle',
      icon: Users,
      link: '/apprentissage-competences',
    },
    {
      title: 'Intelligence de Marché',
      description: 'Informations de marché personnalisées',
      icon: Target,
      link: '/intelligence-marche',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Progression de Carrière
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Progression de Carrière
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Préparez les prochaines étapes de votre parcours professionnel
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#a4007c]/10 rounded-lg">
                      <Icon className="h-6 w-6 text-[#a4007c]" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {module.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-base leading-relaxed">
                    {module.description}
                  </p>
                  <Button
                    asChild
                    className="w-full bg-[#a4007c] hover:bg-[#8a0066] text-white"
                  >
                    <Link to={module.link}>
                      Accéder au module
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ProgressionCarrierePage;