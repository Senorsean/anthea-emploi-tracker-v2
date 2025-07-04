
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export const AIInsights = () => {
  const stats = useStats();

  // Ensure we have valid stats before proceeding
  if (!stats || !stats.jobs || !stats.timeframes || !stats.conversionRates) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#a4007c]" />
            Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Chargement des insights...</p>
        </CardContent>
      </Card>
    );
  }

  const insights = [];

  // Analysis of conversion rates
  const { conversionRates, jobs, timeframes } = stats;
  
  if (conversionRates.appliedToScreening < 0.2 && jobs.applied > 5) {
    insights.push({
      type: 'warning',
      title: 'Taux de screening faible',
      description: `Seulement ${Math.round(conversionRates.appliedToScreening * 100)}% de vos candidatures passent au screening. Optimisez votre CV et lettre de motivation.`,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600 bg-yellow-50'
    });
  }

  if (conversionRates.screeningToInterview > 0.5) {
    insights.push({
      type: 'success',
      title: 'Excellent taux d\'entretien',
      description: `${Math.round(conversionRates.screeningToInterview * 100)}% de vos screenings se transforment en entretiens. Continuez !`,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 bg-green-50'
    });
  }

  if (timeframes.week.applications < 3) {
    insights.push({
      type: 'action',
      title: 'Augmentez votre rythme',
      description: `Seulement ${timeframes.week.applications} candidatures cette semaine. Visez 5-10 candidatures par semaine.`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-50'
    });
  }

  if (jobs.interview > 0 && conversionRates.interviewToFinal < 0.3) {
    insights.push({
      type: 'improvement',
      title: 'Améliorez vos entretiens',
      description: `${Math.round(conversionRates.interviewToFinal * 100)}% de vos entretiens passent en finale. Préparez mieux vos entretiens.`,
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'text-orange-600 bg-orange-50'
    });
  }

  // Default insight if no specific insights
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      title: 'Continuez vos efforts',
      description: 'Votre recherche d\'emploi progresse bien. Maintenez votre rythme de candidatures.',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-gray-600 bg-gray-50'
    });
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#a4007c]" />
          Insights IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.slice(0, 3).map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-lg ${insight.color}`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                IA
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
