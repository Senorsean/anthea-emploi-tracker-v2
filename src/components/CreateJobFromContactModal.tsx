import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/data/contacts';
import { Job } from '@/data/jobs';
import { Briefcase } from 'lucide-react';

interface CreateJobFromContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onCreateJob: (job: Omit<Job, 'id' | 'dateAdded'>) => void;
}

export const CreateJobFromContactModal: React.FC<CreateJobFromContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onCreateJob
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: contact.company,
    location: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    label: '',
    url: '',
    offerStatus: 'pending' as Job['offerStatus'],
    offerType: 'network' as Job['offerType']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.company && formData.location) {
      onCreateJob({
        ...formData,
        offerStatus: formData.offerStatus || 'pending',
        offerType: formData.offerType || 'network'
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        company: contact.company,
        location: '',
        priority: 'Medium',
        label: '',
        url: '',
        offerStatus: 'pending',
        offerType: 'network'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Créer une offre d'emploi
          </DialogTitle>
          <DialogDescription>
            Créer une offre d'emploi liée au contact : <strong>{contact.name}</strong> chez <strong>{contact.company}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du poste *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Product Manager Senior"
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
            <Label htmlFor="location">Localisation *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="ex: Paris, FR ou Remote"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priorité</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'High' | 'Medium' | 'Low') =>
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">Haute</SelectItem>
                <SelectItem value="Medium">Moyenne</SelectItem>
                <SelectItem value="Low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="label">Catégorie</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="ex: Tech, Marketing, Finance"
            />
          </div>

          <div>
            <Label htmlFor="url">URL de l'offre</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="offerStatus">Statut de l'offre</Label>
            <Select
              value={formData.offerStatus}
              onValueChange={(value: Job['offerStatus']) =>
                setFormData(prev => ({ ...prev, offerStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="follow_up_pending">Relance en attente</SelectItem>
                <SelectItem value="first_interview">Premier entretien</SelectItem>
                <SelectItem value="second_interview">Deuxième entretien</SelectItem>
                <SelectItem value="filled">Pourvu</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="offerType">Type d'offre</Label>
            <Select
              value={formData.offerType}
              onValueChange={(value: Job['offerType']) =>
                setFormData(prev => ({ ...prev, offerType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_offer">Offre d'emploi</SelectItem>
                <SelectItem value="spontaneous_application">Candidature spontanée</SelectItem>
                <SelectItem value="network">Réseau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[#e3007b] hover:bg-[#e3007b]/90">
              Créer l'offre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};