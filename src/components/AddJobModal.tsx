
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  label: string;
  url?: string;
  offerStatus?: 'pending' | 'follow_up_pending' | 'filled' | 'suspended' | 'first_interview' | 'second_interview';
  offerType?: 'job_offer' | 'spontaneous_application' | 'network';
}

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: JobData) => void;
  initialData?: JobData;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<JobData>({
    title: '',
    company: '',
    location: '',
    priority: 'Medium',
    label: '',
    url: '',
    offerStatus: 'pending',
    offerType: 'job_offer',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        priority: 'Medium',
        label: '',
        url: '',
        offerStatus: 'pending',
        offerType: 'job_offer',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.company) {
      onSubmit(formData);
      setFormData({
        title: '',
        company: '',
        location: '',
        priority: 'Medium',
        label: '',
        url: '',
        offerStatus: 'pending',
        offerType: 'job_offer',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Modifier le Poste' : 'Ajouter un Nouveau Poste'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du Poste *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Product Manager"
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Entreprise *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="ex: Google"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="ex: Paris, FR"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priorité</Label>
            <Select value={formData.priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
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
            <Label htmlFor="label">Label/Catégorie</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="ex: Tech, Marketing, Sales"
            />
          </div>

          <div>
            <Label htmlFor="offerType">Nature de l'offre</Label>
            <Select 
              value={formData.offerType} 
              onValueChange={(value: 'job_offer' | 'spontaneous_application' | 'network') => 
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

          <div>
            <Label htmlFor="offerStatus">Statut de l'offre</Label>
            <Select 
              value={formData.offerStatus} 
              onValueChange={(value: 'pending' | 'follow_up_pending' | 'filled' | 'suspended' | 'first_interview' | 'second_interview') => 
                setFormData(prev => ({ ...prev, offerStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente de réponse</SelectItem>
                <SelectItem value="follow_up_pending">Relance en attente</SelectItem>
                <SelectItem value="filled">Offre pourvue</SelectItem>
                <SelectItem value="suspended">Offre suspendue</SelectItem>
                <SelectItem value="first_interview">1er entretien</SelectItem>
                <SelectItem value="second_interview">2ème entretien</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[#a4007c] hover:bg-[#a4007c]/90">
              {initialData ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
