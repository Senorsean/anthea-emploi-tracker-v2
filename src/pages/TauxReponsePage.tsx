import React from 'react';
import { Header } from '@/components/Header';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { initialResponses } from '@/data/responses';
import { initialJobs } from '@/data/jobs';

const TauxReponsePage = () => {
  const now = new Date('2025-01-03');
  const allJobs = Object.values(initialJobs).flat();

  const diffDays = (dateStr: string) => {
    return (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  };

  const counts = {
    day: {
      responses: initialResponses.filter(r => diffDays(r.date) <= 1).length,
      sent: allJobs.filter(j => diffDays(j.dateAdded) <= 1).length,
    },
    week: {
      responses: initialResponses.filter(r => diffDays(r.date) <= 7).length,
      sent: allJobs.filter(j => diffDays(j.dateAdded) <= 7).length,
    },
    month: {
      responses: initialResponses.filter(r => diffDays(r.date) <= 30).length,
      sent: allJobs.filter(j => diffDays(j.dateAdded) <= 30).length,
    },
    threeMonths: {
      responses: initialResponses.filter(r => diffDays(r.date) <= 90).length,
      sent: allJobs.filter(j => diffDays(j.dateAdded) <= 90).length,
    },
    sixMonths: {
      responses: initialResponses.filter(r => diffDays(r.date) <= 180).length,
      sent: allJobs.filter(j => diffDays(j.dateAdded) <= 180).length,
    },
  } as const;

  const timeframes = [
    { label: "Aujourd'hui", key: 'day' },
    { label: 'Cette semaine', key: 'week' },
    { label: 'Ce mois', key: 'month' },
    { label: '3 mois', key: 'threeMonths' },
    { label: '6 mois', key: 'sixMonths' },
  ] as const;

  const getRate = (key: keyof typeof counts) => {
    const { responses, sent } = counts[key];
    if (sent === 0) return 0;
    return Math.round((responses / sent) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">
          Taux de réponse des candidatures envoyées
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Période</th>
                  <th className="pb-2">Réponses/Candidatures</th>
                  <th className="pb-2">Taux</th>
                </tr>
              </thead>
              <tbody>
                {timeframes.map(tf => (
                  <tr key={tf.key} className="border-t">
                    <td className="py-2">{tf.label}</td>
                    <td className="py-2">
                      {counts[tf.key].responses} / {counts[tf.key].sent}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={getRate(tf.key)}
                          indicatorClassName="bg-[#b3d800]"
                          className="h-2 flex-1"
                        />
                        <span>{getRate(tf.key)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <div className="mt-4">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Retour au tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TauxReponsePage;
