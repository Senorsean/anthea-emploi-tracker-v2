
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const StatsOverview = () => {
  const stats = [
    {
      title: 'Objectif Actuel',
      value: "Décrocher plus d'entretiens",
      progress: 75,
      icon: Target,
      color: 'text-[#a4007c]',
      bgColor: 'bg-[#a4007c]/10',
      progressColor: 'bg-[#a4007c]',
    },
    {
      title: 'Candidatures Envoyées',
      value: '23/30',
      progress: 77,
      icon: TrendingUp,
      color: 'text-[#e3007b]',
      bgColor: 'bg-[#e3007b]/10',
      progressColor: 'bg-[#e3007b]',
    },
    {
      title: 'Taux de Réponse',
      value: '42%',
      progress: 42,
      icon: Calendar,
      color: 'text-[#b3d800]',
      bgColor: 'bg-[#b3d800]/10',
      progressColor: 'bg-[#b3d800]',
    },
    {
      title: 'Contacts Réseau',
      value: '15 actifs',
      progress: 60,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-600',
    },
  ];

  const weeklyMetrics = [
    {
      label: 'Temps moyen de réponse',
      value: '3.2 jours',
      trend: 'down',
      trendValue: '-12%'
    },
    {
      label: 'Candidatures cette semaine',
      value: '8',
      trend: 'up',
      trendValue: '+25%'
    },
    {
      label: 'Entretiens programmés',
      value: '2',
      trend: 'up',
      trendValue: '+100%'
    }
  ];

  const alerts = [
    {
      type: 'urgent',
      message: '3 candidatures nécessitent un suivi',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50'
    },
    {
      type: 'success',
      message: 'Objectif hebdomadaire atteint !',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
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
                <Progress
                  value={stat.progress}
                  indicatorClassName={stat.progressColor}
                  className="w-full h-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {stat.progress}% de progression
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métriques hebdomadaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Métriques de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    metric.trend === 'up' 
                      ? 'text-green-700 border-green-300 bg-green-50' 
                      : 'text-red-700 border-red-300 bg-red-50'
                  }`}
                >
                  {metric.trendValue}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <Card key={index} className={`border-l-4 ${
              alert.type === 'urgent' ? 'border-l-red-500' : 'border-l-green-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${alert.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {alert.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
