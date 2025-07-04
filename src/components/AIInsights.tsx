
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStats } from '@/hooks/useStats';

export const AIInsights = () => {
  const stats = useStats();

  // Vérifier si les stats sont disponibles avant de procéder
  if (!stats || !stats.conversionRates || !stats.timeframes || !stats.jobs) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-[#a4007c]" />
          <h2 className="text-2xl font-bold text-gray-900">Insights IA</h2>
          <Badge className="bg-[#b3d800] text-gray-900">Nouveau</Badge>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des insights...</p>
        </div>
      </div>
    );
  }

  const detectBottleneck = () => {
    const thresholds = {
      targetedToApplied: 0.4,
      appliedToScreening: 0.5,
      screeningToInterview: 0.4,
      interviewToFinal: 0.5,
      finalToOffer: 0.5,
    };

    const rates = stats.conversionRates;
    let worst: { stage: string; rate: number; label: string } | null = null;

    const stageLabels = {
      targetedToApplied: 'Ciblés → Postulé',
      appliedToScreening: 'Postulé → Screening',
      screeningToInterview: 'Screening → Entretien',
      interviewToFinal: 'Entretien → Finale',
      finalToOffer: 'Finale → Offre',
    };

    // Vérifier que rates existe avant d'utiliser Object.entries
    if (rates) {
      Object.entries(rates).forEach(([stage, rate]) => {
        const threshold = thresholds[stage as keyof typeof thresholds];
        if (rate < threshold && (!worst || rate < worst.rate)) {
          worst = { 
            stage, 
            rate, 
            label: stageLabels[stage as keyof typeof stageLabels] 
          };
        }
      });
    }

    return worst;
  };

  const bottleneck = detectBottleneck();

  const computeRecommendedApplications = () => {
    const successRate = stats.conversionRates?.screeningToInterview || 0.2;
    const weeklyApps = stats.timeframes?.week?.applications || 0;
    const goalInterviews = 1;
    
    if (successRate <= 0) return goalInterviews * 5;
    const needed = goalInterviews / successRate;
    return Math.max(0, Math.ceil(needed - weeklyApps));
  };

  const additionalApps = computeRecommendedApplications();

  const bottleneckInfo = bottleneck
    ? {
        type: bottleneck.label,
        description: `Votre taux de conversion est de ${(bottleneck.rate * 100).toFixed(0)}%, ce qui est inférieur au seuil recommandé.`,
        actionText: 'Voir nos conseils',
        actionUrl: '/ameliorer-entretiens',
      }
    : {
        type: 'Aucun goulot détecté',
        description: 'Continuez sur cette lancée pour atteindre vos objectifs.',
        actionText: 'Découvrir nos astuces',
        actionUrl: '/ameliorer-entretiens',
      };

  const recommendations = [
    {
      priority: 'high',
      title: 'Augmentez votre rythme de candidatures',
      description: `Avec un taux de conversion de ${((stats.conversionRates?.screeningToInterview || 0) * 100).toFixed(0)}%, ajoutez ${additionalApps} candidatures/semaine pour décrocher un entretien.`,
      action: 'Voir les opportunités',
      actionUrl: 'https://match.anthea-rh.com/',
    },
    {
      priority: 'medium',
      title: 'Diversifiez vos approches',
      description: 'Analysez vos candidatures et testez de nouvelles méthodes pour augmenter vos réponses.',
      action: 'Optimiser mon CV',
      actionUrl: 'https://cv-compass-optimizer.lovable.app/',
    },
    {
      priority: 'low',
      title: 'Renforcez votre réseau',
      description: 'Votre réseau peut vous aider à décrocher plus d\'opportunités.',
      action: 'Développer mon réseau',
      actionUrl: '/renforcez-votre-reseau',
    },
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
              <p className="font-semibold mb-1">🚨 Goulot d'étranglement détecté: {bottleneckInfo.type}</p>
              <p className="text-sm mb-3">{bottleneckInfo.description}</p>
              <Button
                asChild
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Link to={bottleneckInfo.actionUrl}>
                  {bottleneckInfo.actionText}
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
                {rec.actionUrl.startsWith('http') ? (
                  <a href={rec.actionUrl} target="_blank" rel="noopener noreferrer">
                    {rec.action}
                  </a>
                ) : (
                  <Link to={rec.actionUrl}>{rec.action}</Link>
                )}
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
              <div className="text-2xl font-bold text-[#a4007c] mb-1">
                {Math.round((stats.conversionRates?.targetedToApplied || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Taux de candidature</div>
              <div className="text-xs text-gray-500 mt-1">vs 80% ciblé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#e3007b] mb-1">
                {Math.round((stats.conversionRates?.appliedToScreening || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Apps → Screening</div>
              <div className={`text-xs ${(stats.conversionRates?.appliedToScreening || 0) > 0.7 ? 'text-green-600' : 'text-orange-600'} mt-1`}>
                {(stats.conversionRates?.appliedToScreening || 0) > 0.7 ? 'Excellent!' : 'À améliorer'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#b3d800] mb-1">
                {Math.round((stats.conversionRates?.screeningToInterview || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Screening → Entretiens</div>
              <div className={`text-xs ${(stats.conversionRates?.screeningToInterview || 0) > 0.5 ? 'text-green-600' : 'text-orange-600'} mt-1`}>
                {(stats.conversionRates?.screeningToInterview || 0) > 0.5 ? 'Excellent!' : 'À améliorer'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-1">
                {Math.round((stats.conversionRates?.interviewToFinal || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Entretiens → Offre</div>
              <div className={`text-xs ${(stats.conversionRates?.interviewToFinal || 0) > 0.5 ? 'text-green-600' : 'text-gray-500'} mt-1`}>
                {(stats.conversionRates?.interviewToFinal || 0) > 0.5 ? 'Excellent!' : 'En cours...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
