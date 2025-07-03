import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WeeklyActionData {
  id?: string;
  action: string;
  target: number;
  completed: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface AddWeeklyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: WeeklyActionData) => void;
  initialData?: WeeklyActionData;
  templates: string[];
}

export const AddWeeklyActionModal: React.FC<AddWeeklyActionModalProps> = ({ isOpen, onClose, onSubmit, initialData, templates }) => {
  const [formData, setFormData] = useState<WeeklyActionData>({
    action: '',
    target: 1,
    completed: 0,
    status: 'pending'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        action: '',
        target: 1,
        completed: 0,
        status: 'pending'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.action) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier l'Action" : 'Ajouter une Action'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template">Modèle</Label>
            <Select onValueChange={val => setFormData(prev => ({ ...prev, action: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(tpl => (
                  <SelectItem key={tpl} value={tpl}>{tpl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="action">Action *</Label>
            <Input
              id="action"
              value={formData.action}
              onChange={e => setFormData(prev => ({ ...prev, action: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="target">Objectif</Label>
            <Input
              id="target"
              type="number"
              min="1"
              value={formData.target}
              onChange={e => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={val => setFormData(prev => ({ ...prev, status: val as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">À faire</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[#b3d800] hover:bg-[#b3d800]/90">
              {initialData ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWeeklyActionModal;
