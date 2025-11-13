import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useCoachingNotes } from '@/hooks/useCoachingNotes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface NotesSectionProps {
  userRole: string | null;
}

const NotesSection = ({ userRole }: NotesSectionProps) => {
  const { notes, loading } = useCoachingNotes();

  const getNoteTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'réflexion': 'Réflexion',
      'feedback': 'Feedback',
      'action': 'Action',
      'observation': 'Observation',
      'autre': 'Autre',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-muted-foreground">Chargement des notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notes de Coaching</h2>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune note</p>
            <p className="text-sm text-muted-foreground">
              Les notes de coaching apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getNoteTypeLabel(note.note_type)}
                    </Badge>
                    {note.is_private && userRole === 'consultant' && (
                      <Badge variant="secondary">Privée</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(note.created_at), 'PPP', { locale: fr })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesSection;