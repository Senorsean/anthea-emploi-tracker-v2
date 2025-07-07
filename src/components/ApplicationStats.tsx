
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs';

export const ApplicationStats = () => {
  const { jobs } = useJobs();

  // Calculer les statistiques basées sur les statuts des offres
  const allJobs = Object.values(jobs).flat();
  
  const pendingOffers = allJobs.filter(job => job.offerStatus === 'pending').length;
  const suspendedOffers = allJobs.filter(job => job.offerStatus === 'suspended').length;
  const filledOffers = allJobs.filter(job => job.offerStatus === 'filled').length;
  const followUpPending = allJobs.filter(job => job.offerStatus === 'follow_up_pending').length;

  const statusStats = [
    { 
      label: 'En attente de réponse', 
      value: pendingOffers,
      color: 'text-[#e3007b]'
    },
    { 
      label: 'Offre suspendue', 
      value: suspendedOffers,
      color: 'text-[#a4007c]'
    },
    { 
      label: 'Offre pourvue', 
      value: filledOffers,
      color: 'text-gray-600'
    },
    { 
      label: 'Nombres de relances', 
      value: followUpPending,
      color: 'text-[#e3007b]'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statusStats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
