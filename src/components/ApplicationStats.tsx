import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs';

export const ApplicationStats = () => {
  const { jobs } = useJobs();
  const now = new Date();
  const appliedJobs = jobs.applied;

  const diffDays = (dateStr: string) => {
    return (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  };

  const week = appliedJobs.filter(job => diffDays(job.dateAdded) <= 7).length;
  const month = appliedJobs.filter(job => diffDays(job.dateAdded) <= 30).length;
  const threeMonths = appliedJobs.filter(job => diffDays(job.dateAdded) <= 90).length;
  const sixMonths = appliedJobs.filter(job => diffDays(job.dateAdded) <= 180).length;

  const stats = [
    { label: 'Cette semaine', value: week },
    { label: 'Ce mois', value: month },
    { label: '3 mois', value: threeMonths },
    { label: '6 mois', value: sixMonths },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
