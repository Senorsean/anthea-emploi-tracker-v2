
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: {
    name: string;
    company: string;
    position: string;
    email: string;
    linkedin?: string;
    status: 'pending' | 'contacted' | 'replied' | 'referred';
    notes?: string;
  }) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    linkedin: '',
    status: 'pending' as 'pending' | 'contacted' | 'replied' | 'referred',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.company && formData.email) {
      onAdd(formData);
      setFormData({
        name: '',
        company: '',
        position: '',
        email: '',
        linkedin: '',
        status: 'pending',
        notes: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un Nouveau Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Jean Dupont"
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Entreprise *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="ex: Microsoft"
              required
            />
          </div>

          <div>
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="ex: Directeur Marketing"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="ex: jean.dupont@entreprise.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="linkedin">Profil LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="ex: in/jean-dupont"
            />
          </div>

          <div>
            <Label htmlFor="status">Statut de relation</Label>
            <Select value={formData.status} onValueChange={(value: 'pending' | 'contacted' | 'replied' | 'referred') => 
              setFormData(prev => ({ ...prev, status: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="replied">Réponse reçue</SelectItem>
                <SelectItem value="referred">Référé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes sur cette personne ou vos interactions..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[#e3007b] hover:bg-[#e3007b]/90">
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
