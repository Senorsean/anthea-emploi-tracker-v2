
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export const StatsOverview = () => {
  const stats = useStats();

  const cards = [
    {
      title: 'Candidatures Totales',
      value: stats.jobs?.total || 0,
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Entretiens ce Mois',
      value: stats.timeframes?.month?.interviews || 0,
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Offres Obtenues',
      value: stats.jobs?.offer || 0,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Réponses Reçues',
      value: stats.timeframes?.month?.responses || 0,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            {card.title === 'Entretiens ce Mois' && (
              <div className="mt-2">
                <Badge 
                  variant={stats.goals?.interviewsProgress >= 100 ? 'default' : 'secondary'}
                  className={stats.goals?.interviewsProgress >= 100 ? 'bg-green-100 text-green-800' : ''}
                >
                  {stats.goals?.interviewsProgress || 0}% de l'objectif
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
