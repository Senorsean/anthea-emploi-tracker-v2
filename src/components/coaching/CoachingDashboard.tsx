import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Target, TrendingUp, Users } from 'lucide-react';
import { useCoachingSessions } from '@/hooks/useCoachingSessions';
import { useCoachingObjectives } from '@/hooks/useCoachingObjectives';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CandidateSelector from './CandidateSelector';
import CandidateProgressOverview from './CandidateProgressOverview';

interface CoachingDashboardProps {
  userRole: string | null;
}

const CoachingDashboard = ({ userRole }: CoachingDashboardProps) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const { sessions, loading: loadingSessions } = useCoachingSessions(selectedCandidateId || undefined);
  const { objectives, loading: loadingObjectives } = useCoachingObjectives(selectedCandidateId || undefined);

  // Si c'est un consultant, afficher le sélecteur de candidat et la vue détaillée
  if (userRole === 'consultant' || userRole === 'admin') {
    return (
      <div className="space-y-6">
        <CandidateSelector 
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
        />
        {selectedCandidateId && (
          <CandidateProgressOverview candidateId={selectedCandidateId} />
        )}
      </div>
    );
  }

  // Vue candidat (code existant)

  const upcomingSessions = sessions.filter(s => 
    new Date(s.session_date) > new Date() && s.status === 'planifiée'
  );

  const activeObjectives = objectives.filter(o => o.status === 'en_cours');
  const completedObjectives = objectives.filter(o => o.status === 'atteint');

  const averageProgress = activeObjectives.length > 0
    ? Math.round(activeObjectives.reduce((acc, obj) => acc + obj.progress_percentage, 0) / activeObjectives.length)
    : 0;

  const stats = [
    {
      title: 'Prochaines sessions',
      value: upcomingSessions.length,
      icon: Calendar,
      description: 'Sessions planifiées',
    },
    {
      title: 'Objectifs actifs',
      value: activeObjectives.length,
      icon: Target,
      description: `${completedObjectives.length} atteints`,
    },
    {
      title: 'Progression moyenne',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      description: 'Des objectifs en cours',
    },
    {
      title: 'Total sessions',
      value: sessions.length,
      icon: Users,
      description: 'Sessions réalisées',
    },
  ];

  if (loadingSessions || loadingObjectives) {
    return <div className="text-muted-foreground">Chargement des données...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{format(new Date(session.session_date), 'PPP', { locale: fr })}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.session_date), 'p', { locale: fr })} - {session.duration} min
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {session.session_type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Objectives */}
      {activeObjectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objectifs en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeObjectives.slice(0, 3).map((objective) => (
                <div key={objective.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{objective.title}</p>
                    <span className="text-sm text-muted-foreground">{objective.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${objective.progress_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachingDashboard;