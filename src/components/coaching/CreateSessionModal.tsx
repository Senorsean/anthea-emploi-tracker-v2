import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachingSessions } from '@/hooks/useCoachingSessions';
import { supabase } from '@/integrations/supabase/client';

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateSessionModal = ({ open, onClose }: CreateSessionModalProps) => {
  const { createSession } = useCoachingSessions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    session_date: '',
    session_type: 'individuel' as 'individuel' | 'groupe',
    duration: 60,
    objectives: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await createSession({
      ...formData,
      consultant_id: user.id,
      status: 'planifiée',
    });

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Session de Coaching</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate_id">ID Candidat *</Label>
            <Input
              id="candidate_id"
              value={formData.candidate_id}
              onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_date">Date et heure *</Label>
            <Input
              id="session_date"
              type="datetime-local"
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_type">Type de session *</Label>
            <Select
              value={formData.session_type}
              onValueChange={(value: 'individuel' | 'groupe') => 
                setFormData({ ...formData, session_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individuel">Individuel</SelectItem>
                <SelectItem value="groupe">Groupe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objectifs de la session</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionModal;