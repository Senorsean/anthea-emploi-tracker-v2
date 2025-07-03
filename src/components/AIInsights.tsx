
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIInsights = () => {
  const bottleneck = {
    type: 'Interview Success Rate',
    description:
      "Votre taux de succès en entretien est 50% plus bas que recommandé. Concentrez-vous sur l'amélioration pour débloquer votre recherche d'emploi.",
    actionText: 'Améliorer mes entretiens',
    actionUrl: '/ameliorer-entretiens',
  };

  const recommendations = [
    {
      priority: 'high',
      title: 'Augmentez votre rythme de candidatures',
      description: 'Basé sur vos données, vous devriez postuler à 2 postes par semaine pour décrocher 1 entretien par semaine.',
      action: 'Voir les opportunités',
      actionUrl: '#'
    },
    {
      priority: 'medium',
      title: 'Diversifiez vos approches',
      description: 'Seulement 38% de vos candidatures passent le screening initial. Essayez d\'optimiser vos candidatures.',
      action: 'Optimiser mon CV',
      actionUrl: '#'
    },
    {
      priority: 'low',
      title: 'Renforcez votre réseau',
      description: '67% de vos entretiens aboutissent à des entretiens finaux. Votre réseau peut vous aider à décrocher plus d\'opportunités.',
      action: 'Développer mon réseau',
      actionUrl: '/renforcez-votre-reseau'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-[#a4007c]" />
        <h2 className="text-2xl font-bold text-gray-900">Insights IA</h2>
        <Badge className="bg-[#b3d800] text-gray-900">Nouveau</Badge>
      </div>

      {/* Bottleneck Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-1">🚨 Goulot d'étranglement détecté: {bottleneck.type}</p>
              <p className="text-sm mb-3">{bottleneck.description}</p>
              <Button
                asChild
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Link to={bottleneck.actionUrl}>
                  {bottleneck.actionText}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#b3d800]" />
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'high' ? 'Priorité haute' : 
                     rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{rec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full border-[#a4007c] text-[#a4007c] hover:bg-[#a4007c] hover:text-white"
              >
                <Link to={rec.actionUrl}>{rec.action}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#b3d800]" />
            Métriques de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a4007c] mb-1">13%</div>
              <div className="text-sm text-gray-600">Taux de candidature</div>
              <div className="text-xs text-gray-500 mt-1">vs 80% ciblé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#e3007b] mb-1">80%</div>
              <div className="text-sm text-gray-600">Apps → Phone screens</div>
              <div className="text-xs text-green-600 mt-1">Excellent!</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#b3d800] mb-1">50%</div>
              <div className="text-sm text-gray-600">Phone → Entretiens</div>
              <div className="text-xs text-orange-600 mt-1">À améliorer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-1">0%</div>
              <div className="text-sm text-gray-600">Entretiens → Offres</div>
              <div className="text-xs text-gray-500 mt-1">En cours...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
