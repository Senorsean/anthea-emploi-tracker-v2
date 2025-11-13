import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target } from 'lucide-react';
import { useCoachingObjectives } from '@/hooks/useCoachingObjectives';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateObjectiveModal from './CreateObjectiveModal';

interface ObjectivesListProps {
  userRole: string | null;
}

const ObjectivesList = ({ userRole }: ObjectivesListProps) => {
  const { objectives, loading } = useCoachingObjectives();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'leadership': 'Leadership',
      'communication': 'Communication',
      'stratégie': 'Stratégie',
      'gestion_équipe': 'Gestion d\'équipe',
      'développement_personnel': 'Développement personnel',
      'autre': 'Autre',
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'en_cours': 'En cours',
      'atteint': 'Atteint',
      'abandonné': 'Abandonné',
      'en_pause': 'En pause',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'atteint':
        return 'default';
      case 'en_cours':
        return 'secondary';
      case 'en_pause':
        return 'outline';
      case 'abandonné':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Chargement des objectifs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Objectifs</h2>
        {(userRole === 'consultant' || userRole === 'admin') && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel objectif
          </Button>
        )}
      </div>

      {objectives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun objectif</p>
            <p className="text-sm text-muted-foreground">
              {userRole === 'consultant' 
                ? 'Créez le premier objectif pour votre candidat'
                : 'Votre consultant définira des objectifs prochainement'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {objectives.map((objective) => (
            <Card key={objective.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">{objective.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getCategoryLabel(objective.category)}
                      </Badge>
                      <Badge variant={getStatusVariant(objective.status)}>
                        {getStatusLabel(objective.status)}
                      </Badge>
                    </div>
                  </div>
                  {objective.target_date && (
                    <span className="text-sm text-muted-foreground">
                      Échéance: {format(new Date(objective.target_date), 'PP', { locale: fr })}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {objective.description && (
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progression</span>
                    <span className="text-muted-foreground">{objective.progress_percentage}%</span>
                  </div>
                  <Progress value={objective.progress_percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateObjectiveModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ObjectivesList;