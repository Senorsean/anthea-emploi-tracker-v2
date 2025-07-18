import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase } from 'lucide-react';
import type { Contact } from '@/data/contacts';
import type { Job } from '@/data/jobs';
import { CreateJobFromContactModal } from './CreateJobFromContactModal';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onUpdate: (contact: Contact) => void;
  onCreateJob?: (job: Omit<Job, 'id' | 'dateAdded'>) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onUpdate,
  onCreateJob,
}) => {
  const [formData, setFormData] = useState<Contact>(contact);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.company && formData.email) {
      onUpdate(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Entreprise *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="linkedin">Profil LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut de relation</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'contacted' | 'replied' | 'referred') =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
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
              value={formData.notes ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            {onCreateJob && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateJobModal(true)}
                className="flex-1 flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Créer offre
              </Button>
            )}
            <Button type="submit" className="flex-1 bg-[#e3007b] hover:bg-[#e3007b]/90">
              Enregistrer
            </Button>
          </div>
        </form>

        {onCreateJob && (
          <CreateJobFromContactModal
            isOpen={showCreateJobModal}
            onClose={() => setShowCreateJobModal(false)}
            contact={contact}
            onCreateJob={onCreateJob}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditContactModal;
