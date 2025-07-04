import React from 'react';
import { Header } from '@/components/Header';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';

const ProgressionCandidaturesPage = () => {
  const { jobs } = useJobs();
  const now = new Date();
  const appliedJobs = jobs.applied;

  const diffDays = (dateStr: string) => {
    return (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  };

  const counts = {
    day: appliedJobs.filter(job => diffDays(job.dateAdded) <= 1).length,
    week: appliedJobs.filter(job => diffDays(job.dateAdded) <= 7).length,
    month: appliedJobs.filter(job => diffDays(job.dateAdded) <= 30).length,
    threeMonths: appliedJobs.filter(job => diffDays(job.dateAdded) <= 90).length,
    sixMonths: appliedJobs.filter(job => diffDays(job.dateAdded) <= 180).length,
  };

  const targets = {
    day: 1,
    week: 5,
    month: 20,
    threeMonths: 60,
    sixMonths: 120,
  };

  const timeframes = [
    { label: "Aujourd'hui", key: 'day' },
    { label: 'Cette semaine', key: 'week' },
    { label: 'Ce mois', key: 'month' },
    { label: '3 mois', key: 'threeMonths' },
    { label: '6 mois', key: 'sixMonths' },
  ] as const;

  const getProgress = (key: keyof typeof counts) => {
    const pct = (counts[key] / targets[key]) * 100;
    return Math.min(100, Math.round(pct));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Progression des candidatures</h1>
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Période</th>
                  <th className="pb-2">Objectif</th>
                  <th className="pb-2">Progression</th>
                </tr>
              </thead>
              <tbody>
                {timeframes.map(tf => (
                  <tr key={tf.key} className="border-t">
                    <td className="py-2">{tf.label}</td>
                    <td className="py-2">
                      {counts[tf.key]} / {targets[tf.key]}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={getProgress(tf.key)}
                          indicatorClassName="bg-[#e3007b]"
                          className="h-2 flex-1"
                        />
                        <span>{getProgress(tf.key)}%</span>
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

export default ProgressionCandidaturesPage;
