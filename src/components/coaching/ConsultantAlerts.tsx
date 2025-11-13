import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { downloadJson } from '@/integrations/supabase/storage';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Calendar,
  TrendingDown,
  Target,
  Briefcase,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertSettingsModal from './AlertSettingsModal';

interface CandidateAlert {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  alerts: {
    type: 'critical' | 'warning' | 'info';
    icon: any;
    title: string;
    description: string;
    daysCount?: number;
  }[];
}

interface AlertThresholds {
  NO_APPLICATION_DAYS: number;
  OBJECTIVE_OVERDUE_DAYS: number;
  NO_SESSION_DAYS: number;
  SESSION_TO_PLAN_DAYS: number;
  LOW_PROGRESS_THRESHOLD: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  NO_APPLICATION_DAYS: 14,
  OBJECTIVE_OVERDUE_DAYS: 7,
  NO_SESSION_DAYS: 30,
  SESSION_TO_PLAN_DAYS: 21,
  LOW_PROGRESS_THRESHOLD: 25,
};

const ConsultantAlerts = () => {
  const [candidateAlerts, setCandidateAlerts] = useState<CandidateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const { toast } = useToast();

  const loadThresholds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('consultant_alert_settings' as any)
        .select('*')
        .eq('consultant_id', user.id)
        .single() as any;

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setThresholds({
          NO_APPLICATION_DAYS: (data as any).no_application_days,
          OBJECTIVE_OVERDUE_DAYS: (data as any).objective_overdue_days,
          NO_SESSION_DAYS: (data as any).no_session_days,
          SESSION_TO_PLAN_DAYS: (data as any).session_to_plan_days,
          LOW_PROGRESS_THRESHOLD: (data as any).low_progress_threshold,
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement seuils:', error);
    }
  };

  useEffect(() => {
    loadThresholds();
  }, []);

  useEffect(() => {
    if (thresholds) {
      fetchAlerts();
    }
  }, [thresholds]);

  const fetchAlerts = async () => {
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
          setCandidateAlerts([]);
          setLoading(false);
          return;
        }

        const now = new Date();
        const alertsPromises = profiles.map(async (profile) => {
          const alerts: CandidateAlert['alerts'] = [];

          // 1. Vérifier les candidatures récentes
          try {
            const { data: jobsData } = await downloadJson<Record<string, any[]>>(
              'data-emploi-tracker',
              `${profile.id}/jobs.json`
            );

            if (jobsData) {
              const allJobs = Object.values(jobsData).flat();
              if (allJobs.length === 0) {
                alerts.push({
                  type: 'critical',
                  icon: Briefcase,
                  title: 'Aucune candidature',
                  description: 'Le candidat n\'a pas encore commencé ses démarches',
                });
              } else {
                // Trouver la date de la candidature la plus récente
                const latestJobDate = allJobs.reduce((latest, job) => {
                  const jobDate = new Date(job.dateAdded);
                  return jobDate > latest ? jobDate : latest;
                }, new Date(0));

                const daysSinceLastApplication = Math.floor(
                  (now.getTime() - latestJobDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceLastApplication > thresholds.NO_APPLICATION_DAYS) {
                  alerts.push({
                    type: 'warning',
                    icon: TrendingDown,
                    title: 'Inactivité prolongée',
                    description: `Aucune candidature depuis ${daysSinceLastApplication} jours`,
                    daysCount: daysSinceLastApplication,
                  });
                }
              }
            } else {
              alerts.push({
                type: 'critical',
                icon: Briefcase,
                title: 'Aucune candidature',
                description: 'Le candidat n\'a pas encore commencé ses démarches',
              });
            }
          } catch (error) {
            // Pas de données de jobs
            alerts.push({
              type: 'critical',
              icon: Briefcase,
              title: 'Aucune candidature',
              description: 'Le candidat n\'a pas encore commencé ses démarches',
            });
          }

          // 2. Vérifier les objectifs en retard
          const { data: objectives } = await supabase
            .from('coaching_objectives' as any)
            .select('*')
            .eq('candidate_id', profile.id) as any;

          if (objectives && (objectives as any[]).length > 0) {
            const overdueObjectives = (objectives as any[]).filter((obj: any) => {
              if (obj.status === 'en_cours' && obj.target_date) {
                const targetDate = new Date(obj.target_date);
                const daysOverdue = Math.floor(
                  (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysOverdue > thresholds.OBJECTIVE_OVERDUE_DAYS;
              }
              return false;
            });

            if (overdueObjectives.length > 0) {
              alerts.push({
                type: 'warning',
                icon: Target,
                title: 'Objectifs en retard',
                description: `${overdueObjectives.length} objectif(s) dépassent la date cible`,
              });
            }

            // Objectifs avec faible progression
            const lowProgressObjectives = (objectives as any[]).filter((obj: any) => 
              obj.status === 'en_cours' && obj.progress_percentage < thresholds.LOW_PROGRESS_THRESHOLD
            );

            if (lowProgressObjectives.length > 0) {
              alerts.push({
                type: 'info',
                icon: Target,
                title: 'Progression lente',
                description: `${lowProgressObjectives.length} objectif(s) avec moins de 25% de progression`,
              });
            }
          }

          // 3. Vérifier les sessions
          const { data: sessions } = await supabase
            .from('coaching_sessions' as any)
            .select('*')
            .eq('candidate_id', profile.id)
            .order('session_date', { ascending: false }) as any;

          if (sessions && (sessions as any[]).length > 0) {
            const upcomingSessions = (sessions as any[]).filter((s: any) => 
              new Date(s.session_date) > now && s.status === 'planifiée'
            );

            if (upcomingSessions.length === 0) {
              // Pas de session à venir, vérifier la dernière session
              const lastSession = (sessions as any[])[0];
              const lastSessionDate = new Date(lastSession.session_date);
              const daysSinceLastSession = Math.floor(
                (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              if (daysSinceLastSession > thresholds.NO_SESSION_DAYS) {
                alerts.push({
                  type: 'warning',
                  icon: Calendar,
                  title: 'Aucune session planifiée',
                  description: `Dernière session il y a ${daysSinceLastSession} jours`,
                  daysCount: daysSinceLastSession,
                });
              } else if (daysSinceLastSession > thresholds.SESSION_TO_PLAN_DAYS) {
                alerts.push({
                  type: 'info',
                  icon: Clock,
                  title: 'Session à planifier',
                  description: `Dernière session il y a ${daysSinceLastSession} jours`,
                  daysCount: daysSinceLastSession,
                });
              }
            }
          } else {
            // Aucune session jamais créée
            alerts.push({
              type: 'critical',
              icon: Calendar,
              title: 'Aucune session',
              description: 'Aucune session de coaching programmée',
            });
          }

          return {
            candidateId: profile.id,
            candidateName: profile.full_name || profile.email,
            candidateEmail: profile.email,
            alerts,
          };
        });

        const allAlerts = await Promise.all(alertsPromises);
        // Ne garder que les candidats ayant des alertes
        const candidatesWithAlerts = allAlerts.filter(c => c.alerts.length > 0);
        setCandidateAlerts(candidatesWithAlerts);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les alertes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return <div className="text-muted-foreground">Chargement des alertes...</div>;
  }

  // Compter les alertes par type
  const alertCounts = candidateAlerts.reduce(
    (acc, candidate) => {
      candidate.alerts.forEach(alert => {
        acc[alert.type]++;
      });
      return acc;
    },
    { critical: 0, warning: 0, info: 0 }
  );

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const handleSettingsSaved = () => {
    loadThresholds();
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de configuration */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Alertes</h2>
          <p className="text-sm text-muted-foreground">
            Candidats nécessitant votre attention
          </p>
        </div>
        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurer les seuils
        </Button>
      </div>

      {/* Résumé des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{alertCounts.critical}</div>
            <p className="text-xs text-muted-foreground">Nécessite action immédiate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{alertCounts.warning}</div>
            <p className="text-xs text-muted-foreground">À surveiller</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{alertCounts.info}</div>
            <p className="text-xs text-muted-foreground">Pour information</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes par candidat */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alertes par candidat</h3>
        
        {candidateAlerts.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucune alerte</AlertTitle>
            <AlertDescription>
              Tous vos candidats sont à jour dans leur suivi !
            </AlertDescription>
          </Alert>
        ) : (
          candidateAlerts.map((candidate) => (
            <Card key={candidate.candidateId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{candidate.candidateName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{candidate.candidateEmail}</p>
                  </div>
                  <Badge variant={getAlertColor(candidate.alerts[0].type)}>
                    {candidate.alerts.length} alerte{candidate.alerts.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.alerts.map((alert, index) => {
                    const AlertIcon = alert.icon;
                    const TypeIcon = getAlertIcon(alert.type);
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          alert.type === 'critical'
                            ? 'bg-destructive/5 border-destructive/20'
                            : alert.type === 'warning'
                            ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/20'
                            : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/20'
                        }`}
                      >
                        <AlertIcon
                          className={`h-5 w-5 mt-0.5 ${
                            alert.type === 'critical'
                              ? 'text-destructive'
                              : alert.type === 'warning'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{alert.title}</p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                alert.type === 'critical'
                                  ? 'border-destructive text-destructive'
                                  : alert.type === 'warning'
                                  ? 'border-orange-600 text-orange-600'
                                  : 'border-blue-600 text-blue-600'
                              }`}
                            >
                              {alert.type === 'critical' ? 'Critique' : alert.type === 'warning' ? 'Attention' : 'Info'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de configuration */}
      <AlertSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsSaved={handleSettingsSaved}
      />
    </div>
  );
};

export default ConsultantAlerts;
