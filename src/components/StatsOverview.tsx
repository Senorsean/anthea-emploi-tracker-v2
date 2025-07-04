
import React from 'react';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';

function generateInsights(stats: ReturnType<typeof useStats>) {
  const insights: string[] = [];
  const { conversionRates, jobs, timeframes } = stats;

  if (conversionRates.appliedToScreening < 0.2 && jobs.applied > 5) {
    insights.push(
      `Taux de screening faible : seulement ${Math.round(
        conversionRates.appliedToScreening * 100,
      )}% de vos candidatures passent au screening.`,
    );
  }

  if (conversionRates.screeningToInterview > 0.5) {
    insights.push(
      `Excellent taux d'entretien : ${Math.round(
        conversionRates.screeningToInterview * 100,
      )}% de vos screenings se transforment en entretiens.`,
    );
  }

  if (timeframes.week.applications < 3) {
    insights.push(
      `Augmentez votre rythme : seulement ${timeframes.week.applications} candidatures cette semaine.`,
    );
  }

  if (jobs.interview > 0 && conversionRates.interviewToFinal < 0.3) {
    insights.push(
      `Améliorez vos entretiens : ${Math.round(
        conversionRates.interviewToFinal * 100,
      )}% de vos entretiens passent en finale.`,
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Continuez vos efforts : votre recherche d'emploi progresse bien.",
    );
  }

  return insights;
}

export const StatsOverview = () => {
  const stats = useStats();

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Rapport de Statistiques', 105, 15, { align: 'center' });

    const insights = generateInsights(stats);
    doc.setFontSize(12);
    let y = 25;
    insights.forEach((line) => {
      doc.text(`- ${line}`, 10, y);
      y += 6;
    });

    y += 4;
    doc.text('Statistiques générales', 10, y);
    y += 6;
    cards.forEach((card) => {
      const progress =
        card.title === 'Entretiens ce Mois'
          ? ` (${stats.goals?.interviewsProgress || 0}% de l\'objectif)`
          : '';
      doc.text(`${card.title}: ${card.value}${progress}`, 10, y);
      y += 6;
    });

    y += 10;
    doc.text('Répartition des candidatures', 10, y);
    y += 2;
    const stages = [
      'Ciblées',
      'Envoyées',
      'Screening',
      'Entretien',
      'Finale',
      'Offre',
    ];
    const values = [
      stats.jobs.targeted,
      stats.jobs.applied,
      stats.jobs.screening,
      stats.jobs.interview,
      stats.jobs.final,
      stats.jobs.offer,
    ];
    const max = Math.max(...values, 1);
    const chartHeight = 40;
    const barWidth = 20;
    const gap = 4;
    const startX = 10;
    const startY = y + chartHeight;

    values.forEach((val, i) => {
      const barHeight = (val / max) * chartHeight;
      const x = startX + i * (barWidth + gap);
      doc.setFillColor('#a4007c');
      doc.rect(x, startY - barHeight, barWidth, barHeight, 'F');
      doc.text(String(val), x + barWidth / 2, startY - barHeight - 2, {
        align: 'center',
      });
      const pct = stats.jobs.total
        ? Math.round((val / stats.jobs.total) * 100)
        : 0;
      doc.text(`${pct}%`, x + barWidth / 2, startY + 6, { align: 'center' });
      doc.text(stages[i], x + barWidth / 2, startY + 12, { align: 'center' });
    });

    doc.save('rapport.pdf');
  };

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
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
          Exporter
        </Button>
      </div>
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
    </div>
  );
};
