
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initialResponses } from '@/data/responses';
import { useJobs } from '@/hooks/useJobs';
import { useContacts } from '@/hooks/useContacts';

export const StatsOverview = () => {
  const { jobs } = useJobs();
  const { contacts } = useContacts();

  const appliedJobs = jobs.applied;
  const allJobs = Object.values(jobs).flat();
  const responseRate = allJobs.length === 0
    ? 0
    : Math.round((initialResponses.length / allJobs.length) * 100);

  const monthInterviews = jobs.interview.length;
  const interviewProgress = Math.min(100, Math.round((monthInterviews / 8) * 100));
  const applicationsTarget = 30;
  const applicationsProgress = Math.min(
    100,
    Math.round((appliedJobs.length / applicationsTarget) * 100)
  );
  const activeContacts = contacts.filter(c => c.status !== 'pending').length;
  const contactsProgress = Math.min(
    100,
    Math.round((activeContacts / 25) * 100)
  );

  const stats = [
    {
      title: 'Objectif Actuel',
      value: "Décrocher plus d'entretiens",
      progress: interviewProgress,
      icon: Target,
      color: 'text-[#a4007c]',
      bgColor: 'bg-[#a4007c]/10',
      progressColor: 'bg-[#a4007c]',
    },
    {
      title: 'Candidatures Envoyées',
      value: `${appliedJobs.length}/${applicationsTarget}`,
      progress: applicationsProgress,
      icon: TrendingUp,
      color: 'text-[#e3007b]',
      bgColor: 'bg-[#e3007b]/10',
      progressColor: 'bg-[#e3007b]',
    },
    {
      title: 'Taux de Réponse',
      value: `${responseRate}%`,
      progress: responseRate,
      icon: Calendar,
      color: 'text-[#b3d800]',
      bgColor: 'bg-[#b3d800]/10',
      progressColor: 'bg-[#b3d800]',
    },
    {
      title: 'Contacts Réseau',
      value: `${activeContacts} actifs`,
      progress: contactsProgress,
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
        const content = (
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
        if (index === 0) {
          return (
            <Link key={index} to="/progression-entretiens">
              {content}
            </Link>
          );
        }
        if (index === 1) {
          return (
            <Link key={index} to="/progression-candidatures">
              {content}
            </Link>
          );
        }
        if (index === 2) {
          return (
            <Link key={index} to="/taux-reponse">
              {content}
            </Link>
          );
        }
        if (index === 3) {
          return (
            <Link key={index} to="/progression-reseau">
              {content}
            </Link>
          );
        }
        return content;
      })}
    </div>
  );
};
