
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';

export const StatsOverview = () => {
  const stats = [
    {
      title: 'Objectif Actuel',
      value: 'Décrocher plus d\'entretiens',
      progress: 75,
      icon: Target,
      color: 'text-[#a4007c]',
      bgColor: 'bg-[#a4007c]/10',
    },
    {
      title: 'Candidatures Envoyées',
      value: '23/30',
      progress: 77,
      icon: TrendingUp,
      color: 'text-[#e3007b]',
      bgColor: 'bg-[#e3007b]/10',
    },
    {
      title: 'Taux de Réponse',
      value: '42%',
      progress: 42,
      icon: Calendar,
      color: 'text-[#b3d800]',
      bgColor: 'bg-[#b3d800]/10',
    },
    {
      title: 'Contacts Réseau',
      value: '15 actifs',
      progress: 60,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <Progress value={stat.progress} className="w-full h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {stat.progress}% de progression
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
