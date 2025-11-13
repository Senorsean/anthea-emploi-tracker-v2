import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachingObjectives } from '@/hooks/useCoachingObjectives';
import { supabase } from '@/integrations/supabase/client';

interface CreateObjectiveModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateObjectiveModal = ({ open, onClose }: CreateObjectiveModalProps) => {
  const { createObjective } = useCoachingObjectives();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    title: '',
    description: '',
    category: 'leadership' as 'leadership' | 'communication' | 'stratégie' | 'gestion_équipe' | 'développement_personnel' | 'autre',
    target_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await createObjective({
      ...formData,
      consultant_id: user.id,
      status: 'en_cours',
      progress_percentage: 0,
    });

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvel Objectif</DialogTitle>
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
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="stratégie">Stratégie</SelectItem>
                <SelectItem value="gestion_équipe">Gestion d'équipe</SelectItem>
                <SelectItem value="développement_personnel">Développement personnel</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Date cible</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer l\'objectif'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateObjectiveModal;