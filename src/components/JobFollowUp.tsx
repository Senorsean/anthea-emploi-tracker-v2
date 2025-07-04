import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MessageSquare, Plus, AlertCircle } from 'lucide-react';

interface FollowUp {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  type: 'email' | 'phone' | 'linkedin' | 'visit';
  status: 'pending' | 'completed' | 'overdue';
  scheduledDate: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
}

export const JobFollowUp = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Product Manager',
      company: 'Google',
      type: 'email',
      status: 'overdue',
      scheduledDate: '2025-01-01',
      notes: 'Relancer le recruteur après 1 semaine',
      priority: 'high'
    },
    {
      id: '2',
      jobId: '3',
      jobTitle: 'Senior Product Manager',
      company: 'Amazon',
      type: 'linkedin',
      status: 'pending',
      scheduledDate: '2025-01-05',
      notes: 'Contacter le hiring manager directement',
      priority: 'medium'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<{
    jobTitle: string;
    company: string;
    type: 'email' | 'phone' | 'linkedin' | 'visit';
    scheduledDate: string;
    notes: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    jobTitle: '',
    company: '',
    type: 'email',
    scheduledDate: '',
    notes: '',
    priority: 'medium'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'linkedin': return '💼';
      case 'visit': return '🏢';
      default: return '📋';
    }
  };

  const addFollowUp = () => {
    const followUp: FollowUp = {
      id: Date.now().toString(),
      jobId: Date.now().toString(),
      jobTitle: newFollowUp.jobTitle,
      company: newFollowUp.company,
      type: newFollowUp.type,
      scheduledDate: newFollowUp.scheduledDate,
      notes: newFollowUp.notes,
      priority: newFollowUp.priority,
      status: 'pending'
    };
    
    setFollowUps([followUp, ...followUps]);
    setNewFollowUp({
      jobTitle: '',
      company: '',
      type: 'email',
      scheduledDate: '',
      notes: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const markCompleted = (id: string) => {
    setFollowUps(followUps.map(f => 
      f.id === id ? { ...f, status: 'completed' } : f
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Suivi des Candidatures</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#a4007c] hover:bg-[#a4007c]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Suivi
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Card className="border-[#a4007c]/20">
          <CardHeader>
            <CardTitle className="text-[#a4007c]">Nouveau Suivi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Titre du poste"
                value={newFollowUp.jobTitle}
                onChange={(e) => setNewFollowUp({...newFollowUp, jobTitle: e.target.value})}
              />
              <Input
                placeholder="Entreprise"
                value={newFollowUp.company}
                onChange={(e) => setNewFollowUp({...newFollowUp, company: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select 
                value={newFollowUp.type} 
                onValueChange={(value: 'email' | 'phone' | 'linkedin' | 'visit') => setNewFollowUp({...newFollowUp, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Téléphone</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="visit">Visite</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={newFollowUp.scheduledDate}
                onChange={(e) => setNewFollowUp({...newFollowUp, scheduledDate: e.target.value})}
              />
              
              <Select 
                value={newFollowUp.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewFollowUp({...newFollowUp, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Notes et rappels..."
              value={newFollowUp.notes}
              onChange={(e) => setNewFollowUp({...newFollowUp, notes: e.target.value})}
            />
            
            <div className="flex gap-2">
              <Button onClick={addFollowUp} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des suivis */}
      <div className="space-y-4">
        {followUps.map((followUp) => (
          <Card key={followUp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(followUp.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {followUp.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-600">{followUp.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(followUp.scheduledDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <Badge className={getStatusColor(followUp.status)}>
                      {followUp.status === 'pending' ? 'En attente' :
                       followUp.status === 'completed' ? 'Terminé' : 'En retard'}
                    </Badge>
                    
                    <Badge className={getPriorityColor(followUp.priority)}>
                      Priorité {followUp.priority === 'high' ? 'élevée' : 
                                followUp.priority === 'medium' ? 'moyenne' : 'faible'}
                    </Badge>
                  </div>
                  
                  {followUp.notes && (
                    <div className="flex items-start gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                      <p className="text-sm text-gray-700">{followUp.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {followUp.status === 'overdue' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">En retard</span>
                    </div>
                  )}
                  
                  {followUp.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => markCompleted(followUp.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marquer terminé
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
