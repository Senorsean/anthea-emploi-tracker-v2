
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useStats';

export const ApplicationStats = () => {
  const stats = useStats();

  const timeframeStats = [
    { label: 'Cette semaine', applications: stats.timeframes?.week?.applications || 0, interviews: stats.timeframes?.week?.interviews || 0 },
    { label: 'Ce mois', applications: stats.timeframes?.month?.applications || 0, interviews: stats.timeframes?.month?.interviews || 0 },
    { label: '3 mois', applications: stats.timeframes?.threeMonths?.applications || 0, interviews: stats.timeframes?.threeMonths?.interviews || 0 },
    { label: '6 mois', applications: stats.timeframes?.sixMonths?.applications || 0, interviews: stats.timeframes?.sixMonths?.interviews || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {timeframeStats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold text-[#e3007b]">{stat.applications}</div>
                <div className="text-xs text-gray-500">Candidatures</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#a4007c]">{stat.interviews}</div>
                <div className="text-xs text-gray-500">Entretiens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
