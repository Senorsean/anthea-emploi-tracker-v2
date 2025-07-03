import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';
import { initialJobs } from '@/data/jobs';

export const StatsOverview = () => {
  const [open, setOpen] = useState(false);

  const goal = 30;
  const now = new Date('2025-01-03');
  const diffDays = (dateStr: string) =>
    (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);

  const applications = Object.entries(initialJobs)
    .filter(([key]) => key !== 'targeted')
    .flatMap(([, jobs]) => jobs);

  const timeframes = [
    { label: 'Jour', days: 1 },
    { label: 'Semaine', days: 7 },
    { label: 'Mois', days: 30 },
    { label: '3 mois', days: 90 },
    { label: '6 mois', days: 180 },
  ];

  const progressData = timeframes.map((tf) => {
    const count = applications.filter((job) => diffDays(job.dateAdded) <= tf.days).length;
    const percent = Math.round((count / goal) * 100);
    return { ...tf, count, percent };
  });

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const card = (
          <Card
            key={index}
            className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
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

        if (stat.title === 'Candidatures Envoyées') {
          return (
            <Dialog key={index} open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>{card}</DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Progression des Candidatures</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Candidatures</TableHead>
                      <TableHead className="text-right">Progression</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressData.map((data) => (
                      <TableRow key={data.label}>
                        <TableCell>{data.label}</TableCell>
                        <TableCell>
                          {data.count}/{goal}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.percent}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          );
        }

        return card;
      })}
    </div>
  );
};
