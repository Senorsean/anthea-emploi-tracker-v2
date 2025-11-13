import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock } from 'lucide-react';
import { useCoachingSessions } from '@/hooks/useCoachingSessions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateSessionModal from './CreateSessionModal';

interface SessionsListProps {
  userRole: string | null;
}

const SessionsList = ({ userRole }: SessionsListProps) => {
  const { sessions, loading } = useCoachingSessions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'complétée':
        return 'default';
      case 'planifiée':
        return 'secondary';
      case 'en_cours':
        return 'default';
      case 'annulée':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'planifiée': 'Planifiée',
      'en_cours': 'En cours',
      'complétée': 'Complétée',
      'annulée': 'Annulée',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-muted-foreground">Chargement des sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Sessions</h2>
        {(userRole === 'consultant' || userRole === 'admin') && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune session</p>
            <p className="text-sm text-muted-foreground">
              {userRole === 'consultant' 
                ? 'Créez votre première session de coaching'
                : 'Votre consultant programmera une session prochainement'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Session {session.session_type}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(session.session_date), 'PPP', { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} min
                      </span>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(session.status)}>
                    {getStatusLabel(session.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {session.objectives && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Objectifs de la session :</p>
                    <p className="text-sm text-muted-foreground">{session.objectives}</p>
                  </div>
                )}
                {session.notes_consultant && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes du consultant :</p>
                    <p className="text-sm text-muted-foreground">{session.notes_consultant}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateSessionModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SessionsList;