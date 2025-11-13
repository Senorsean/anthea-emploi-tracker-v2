import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Send, 
  Calendar, 
  TrendingUp, 
  Target,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CandidateProgressOverviewProps {
  candidateId: string;
}

interface CandidateData {
  sessions: any[];
  objectives: any[];
  notes: any[];
}

const CandidateProgressOverview = ({ candidateId }: CandidateProgressOverviewProps) => {
  const [data, setData] = useState<CandidateData>({
    sessions: [],
    objectives: [],
    notes: [],
  });
  const [loading, setLoading] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);

        // Récupérer les infos du candidat
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', candidateId)
          .single();

        if (profileError) throw profileError;
        setCandidateInfo(profile);

        // Récupérer les sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('coaching_sessions' as any)
          .select('*')
          .eq('candidate_id', candidateId)
          .order('session_date', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Récupérer les objectifs
        const { data: objectives, error: objectivesError } = await supabase
          .from('coaching_objectives' as any)
          .select('*')
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false });

        if (objectivesError) throw objectivesError;

        // Récupérer les notes
        const { data: notes, error: notesError } = await supabase
          .from('coaching_notes' as any)
          .select('*')
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false });

        if (notesError) throw notesError;

        setData({
          sessions: (sessions as any[]) || [],
          objectives: (objectives as any[]) || [],
          notes: (notes as any[]) || [],
        });
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId, toast]);

  if (loading) {
    return <div className="text-muted-foreground">Chargement des données...</div>;
  }

  // Calculs des statistiques
  const completedSessions = data.sessions.filter(s => s.status === 'complétée').length;
  const upcomingSessions = data.sessions.filter(s => 
    new Date(s.session_date) > new Date() && s.status === 'planifiée'
  ).length;
  
  const activeObjectives = data.objectives.filter(o => o.status === 'en_cours');
  const completedObjectives = data.objectives.filter(o => o.status === 'atteint').length;
  
  const averageProgress = activeObjectives.length > 0
    ? Math.round(activeObjectives.reduce((acc: number, obj: any) => acc + obj.progress_percentage, 0) / activeObjectives.length)
    : 0;

  const recentNotes = data.notes.slice(0, 3);

  const stats = [
    {
      title: 'Sessions réalisées',
      value: completedSessions,
      icon: CheckCircle2,
      description: `${upcomingSessions} à venir`,
      color: 'text-green-600',
    },
    {
      title: 'Objectifs en cours',
      value: activeObjectives.length,
      icon: Target,
      description: `${completedObjectives} atteints`,
      color: 'text-blue-600',
    },
    {
      title: 'Progression moyenne',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      description: 'Des objectifs',
      color: 'text-purple-600',
    },
    {
      title: 'Notes de suivi',
      value: data.notes.length,
      icon: FileText,
      description: 'Toutes périodes',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Informations du candidat */}
      {candidateInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du candidat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{candidateInfo.full_name}</p>
              <p className="text-sm text-muted-foreground">{candidateInfo.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
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

      {/* Objectifs actifs avec progression */}
      {activeObjectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objectifs en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeObjectives.map((objective: any) => (
                <div key={objective.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{objective.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {objective.progress_percentage}%
                    </span>
                  </div>
                  <Progress value={objective.progress_percentage} />
                  {objective.description && (
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes récentes */}
      {recentNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotes.map((note: any) => (
                <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary">
                      {note.note_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prochaines sessions */}
      {upcomingSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prochaines sessions planifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sessions
                .filter(s => new Date(s.session_date) > new Date() && s.status === 'planifiée')
                .slice(0, 3)
                .map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(session.session_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {session.duration} min
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
    </div>
  );
};

export default CandidateProgressOverview;
