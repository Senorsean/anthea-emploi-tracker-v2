import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { downloadJson } from '@/integrations/supabase/storage';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Briefcase, 
  Send, 
  Calendar, 
  TrendingUp,
  Award,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CandidateStats {
  id: string;
  name: string;
  email: string;
  totalApplications: number;
  pending: number;
  interviews: number;
  offers: number;
  activeSessions: number;
  completedSessions: number;
  activeObjectives: number;
  completedObjectives: number;
  averageProgress: number;
}

const ConsultantMonitoring = () => {
  const [candidates, setCandidates] = useState<CandidateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Récupérer tous les candidats du consultant
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('consultant_id', user.id);

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Pour chaque candidat, récupérer ses données
        const candidateStatsPromises = profiles.map(async (profile) => {
          // Récupérer les jobs depuis le storage
          let totalApplications = 0;
          let pending = 0;
          let interviews = 0;
          let offers = 0;

          try {
            const { data: jobsData } = await downloadJson<Record<string, any[]>>(
              'data-emploi-tracker',
              `${profile.id}/jobs.json`
            );

            if (jobsData) {
              Object.entries(jobsData).forEach(([stage, jobs]) => {
                totalApplications += jobs.length;
                if (stage === 'offer' || stage === 'applied') pending += jobs.length;
                if (stage === 'interview') interviews += jobs.length;
                if (stage === 'final') offers += jobs.length;
              });
            }
          } catch (error) {
            // Pas de données de jobs pour ce candidat
          }

          // Récupérer les sessions
          const { data: sessions } = await supabase
            .from('coaching_sessions' as any)
            .select('*')
            .eq('candidate_id', profile.id) as any;

          const activeSessions = (sessions as any[])?.filter((s: any) => s.status === 'planifiée').length || 0;
          const completedSessions = (sessions as any[])?.filter((s: any) => s.status === 'complétée').length || 0;

          // Récupérer les objectifs
          const { data: objectives } = await supabase
            .from('coaching_objectives' as any)
            .select('*')
            .eq('candidate_id', profile.id) as any;

          const activeObjectivesData = (objectives as any[])?.filter((o: any) => o.status === 'en_cours') || [];
          const completedObjectives = (objectives as any[])?.filter((o: any) => o.status === 'atteint').length || 0;

          const averageProgress = activeObjectivesData.length > 0
            ? Math.round(activeObjectivesData.reduce((acc: number, obj: any) => acc + obj.progress_percentage, 0) / activeObjectivesData.length)
            : 0;

          return {
            id: profile.id,
            name: profile.full_name || profile.email,
            email: profile.email,
            totalApplications,
            pending,
            interviews,
            offers,
            activeSessions,
            completedSessions,
            activeObjectives: activeObjectivesData.length,
            completedObjectives,
            averageProgress,
          };
        });

        const candidateStats = await Promise.all(candidateStatsPromises);
        setCandidates(candidateStats);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données de monitoring',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, [toast]);

  if (loading) {
    return <div className="text-muted-foreground">Chargement des données de monitoring...</div>;
  }

  // Statistiques globales
  const globalStats = candidates.reduce(
    (acc, candidate) => ({
      totalCandidates: acc.totalCandidates + 1,
      totalApplications: acc.totalApplications + candidate.totalApplications,
      totalInterviews: acc.totalInterviews + candidate.interviews,
      totalOffers: acc.totalOffers + candidate.offers,
      totalActiveSessions: acc.totalActiveSessions + candidate.activeSessions,
      totalActiveObjectives: acc.totalActiveObjectives + candidate.activeObjectives,
    }),
    {
      totalCandidates: 0,
      totalApplications: 0,
      totalInterviews: 0,
      totalOffers: 0,
      totalActiveSessions: 0,
      totalActiveObjectives: 0,
    }
  );

  const globalStatsCards = [
    {
      title: 'Candidats suivis',
      value: globalStats.totalCandidates,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Candidatures totales',
      value: globalStats.totalApplications,
      icon: Send,
      color: 'text-purple-600',
    },
    {
      title: 'Entretiens en cours',
      value: globalStats.totalInterviews,
      icon: Calendar,
      color: 'text-orange-600',
    },
    {
      title: 'Offres obtenues',
      value: globalStats.totalOffers,
      icon: Award,
      color: 'text-green-600',
    },
    {
      title: 'Sessions planifiées',
      value: globalStats.totalActiveSessions,
      icon: CheckCircle2,
      color: 'text-indigo-600',
    },
    {
      title: 'Objectifs actifs',
      value: globalStats.totalActiveObjectives,
      icon: Target,
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalStatsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Détails par candidat */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Suivi par candidat</h2>
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Aucun candidat assigné pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {candidate.averageProgress}%
                      </div>
                      <p className="text-xs text-muted-foreground">Progression</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Barre de progression */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progression des objectifs</span>
                        <span className="font-medium">{candidate.averageProgress}%</span>
                      </div>
                      <Progress value={candidate.averageProgress} />
                    </div>

                    {/* Statistiques du candidat */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Candidatures</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                          {candidate.totalApplications}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Entretiens</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          {candidate.interviews}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Offres</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <Award className="h-4 w-4 text-green-600" />
                          {candidate.offers}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Sessions</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                          {candidate.completedSessions}/{candidate.activeSessions + candidate.completedSessions}
                        </p>
                      </div>
                    </div>

                    {/* Objectifs */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Objectifs: {candidate.activeObjectives} en cours, {candidate.completedObjectives} atteints
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantMonitoring;
