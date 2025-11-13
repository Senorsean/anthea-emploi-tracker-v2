import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Target, BarChart3, Calendar } from 'lucide-react';

const QuickAccessModules = () => {
  const quickAccessModules = [
    {
      title: 'Coaching Cadre',
      description: 'Suivi de développement professionnel',
      icon: Users,
      link: '/coaching-cadre',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Parcours de Carrière',
      description: 'Évolutions possibles',
      icon: TrendingUp,
      link: '/parcours-carriere',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'Intelligence de Marché',
      description: 'Informations personnalisées',
      icon: Target,
      link: '/intelligence-marche',
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Référentiels Salaires',
      description: 'Connaître votre valeur',
      icon: BarChart3,
      link: '/referentiels-salaires',
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Accès Rapide</CardTitle>
        <p className="text-muted-foreground">
          Vos modules les plus utilisés
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={index}
                to={module.link}
                className="group"
              >
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 hover:scale-105 h-full">
                  <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAccessModules;
