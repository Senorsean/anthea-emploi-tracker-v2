
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';

export const StatsOverview = () => {
  const stats = useStats();

  const handleExport = () => {
    const cardHtml = cards
      .map((card) => {
        const badge =
          card.title === 'Entretiens ce Mois'
            ? `<div class="badge ${
                stats.goals?.interviewsProgress >= 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }">${
                stats.goals?.interviewsProgress || 0
              }% de l'objectif</div>`
            : '';
        return `<div class="card">
            <div class="card-header">
              <span class="card-title">${card.title}</span>
              <span class="icon ${card.bgColor} ${card.color}">●</span>
            </div>
            <div class="value">${card.value}</div>
            ${badge}
          </div>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Rapport de Statistiques</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f9fafb; color: #111827; padding: 24px; }
            h1 { text-align: center; color: #a4007c; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
            .card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
            .card-title { font-size: 14px; color: #4b5563; }
            .icon { border-radius: 8px; padding: 4px; color: #fff; font-size: 12px; }
            .value { font-size: 24px; font-weight: 700; color: #111827; }
            .badge { display: inline-block; border-radius: 9999px; padding: 2px 6px; font-size: 12px; }
            .bg-blue-50 { background-color: #eff6ff; }
            .text-blue-600 { color: #2563eb; }
            .bg-green-50 { background-color: #ecfdf5; }
            .text-green-600 { color: #16a34a; }
            .bg-purple-50 { background-color: #f5f3ff; }
            .text-purple-600 { color: #7e22ce; }
            .bg-orange-50 { background-color: #fff7ed; }
            .text-orange-600 { color: #ea580c; }
            .bg-green-100 { background-color: #d1fae5; }
            .text-green-800 { color: #166534; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .text-gray-800 { color: #1f2937; }
          </style>
        </head>
        <body>
          <h1>Rapport de Statistiques</h1>
          <div class="grid">${cardHtml}</div>
        </body>
      </html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapport.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
