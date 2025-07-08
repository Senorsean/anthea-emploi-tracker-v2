import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";

export const OffresDuJour = () => {
  const { jobs } = useJobs();
  const allJobs = Object.values(jobs).flat();
  const todayOffers = allJobs.filter((job) => {
    const diffDays =
      (Date.now() - new Date(job.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 1 && job.offerType === "job_offer";
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Briefcase className="h-5 w-5 text-[#a4007c]" />
          Offres du jour
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayOffers.length === 0 ? (
          <p className="text-gray-600">Pas de nouvelles offres aujourd\'hui.</p>
        ) : (
          <ul className="space-y-2">
            {todayOffers.map((job) => (
              <li key={job.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-600">
                    {job.company} - {job.location}
                  </p>
                </div>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a4007c] text-sm hover:underline"
                  >
                    Voir l'offre
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default OffresDuJour;
