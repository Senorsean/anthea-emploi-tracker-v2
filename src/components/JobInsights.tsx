
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

export const JobInsights = () => {
  const insights = [
    {
      title: 'Tendance des Candidatures',
      description: 'Vos candidatures sont en hausse ce mois-ci',
      type: 'positive',
      value: '+23%',
      icon: TrendingUp,
      details: 'Continuez sur cette lancée ! Votre rythme de candidatures s\'améliore.'
    },
    {
      title: 'Temps de Réponse Moyen',
      description: 'Les entreprises vous répondent plus rapidement',
      type: 'positive',
      value: '3.2 jours',
      icon: Clock,
      details: 'Excellente nouvelle ! Le temps de réponse moyen a diminué de 1.5 jours.'
    },
    {
      title: 'Taux de Conversion',
      description: 'Candidatures → Entretiens',
      type: 'warning',
      value: '15%',
      icon: Target,
      details: 'Améliorable. La moyenne du secteur est de 20-25%.'
    },
    {
      title: 'Score de Performance',
      description: 'Basé sur votre activité globale',
      type: 'positive',
      value: '8.2/10',
      icon: Award,
      details: 'Excellent travail ! Vous êtes dans le top 20% des utilisateurs.'
    }
  ];

  const recommendations = [
    {
      priority: 'high',
      title: 'Optimisez vos candidatures',
      description: 'Personnalisez davantage vos lettres de motivation pour améliorer votre taux de réponse.',
      action: 'Voir les conseils'
    },
    {
      priority: 'medium', 
      title: 'Élargissez votre réseau',
      description: 'Contactez 2-3 nouvelles personnes cette semaine sur LinkedIn.',
      action: 'Gérer les contacts'
    },
    {
      priority: 'low',
      title: 'Préparez vos entretiens',
      description: 'Révisez la méthode STAR pour vos prochains entretiens.',
      action: 'Accéder aux ressources'
    }
  ];

  const marketTrends = [
    {
      sector: 'Tech',
      trend: 'up',
      change: '+12%',
      description: 'Forte demande en développeurs et PM'
    },
    {
      sector: 'Finance',
      trend: 'stable',
      change: '+2%',
      description: 'Marché stable avec quelques opportunités'
    },
    {
      sector: 'Marketing',
      trend: 'down',
      change: '-5%',
      description: 'Ralentissement temporaire'
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analyses et Insights</h2>

      {/* Insights principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className={`border-2 ${getInsightColor(insight.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6" />
                  <Badge variant="outline" className="text-xs">
                    {insight.value}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold">
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-2">
                  {insight.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {insight.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommandations IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#a4007c]" />
            Recommandations Personnalisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {rec.title}
                    </h4>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? 'Urgent' :
                       rec.priority === 'medium' ? 'Important' : 'Optionnel'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>
                  <button className="text-xs text-[#a4007c] hover:underline font-medium">
                    {rec.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendances du marché */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#e3007b]" />
            Tendances du Marché de l'Emploi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {trend.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : trend.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-400 rounded-full" />
                    )}
                    <span className="font-semibold text-sm">{trend.sector}</span>
                  </div>
                  <span className="text-sm text-gray-600">{trend.description}</span>
                </div>
                <Badge 
                  variant="outline"
                  className={`${
                    trend.trend === 'up' ? 'text-green-700 border-green-300' :
                    trend.trend === 'down' ? 'text-red-700 border-red-300' :
                    'text-gray-700 border-gray-300'
                  }`}
                >
                  {trend.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
