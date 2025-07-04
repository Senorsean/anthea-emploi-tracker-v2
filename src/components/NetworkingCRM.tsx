
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ExternalLink, Mail, Search, Filter, Pencil, LayoutGrid, List, Upload } from 'lucide-react';
import { initialContacts, Contact } from '@/data/contacts';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';
import { AddContactModal } from './AddContactModal';
import EditContactModal from './EditContactModal';

interface NetworkingCRMProps {
  preview?: boolean;
  onPreviewClick?: () => void;
}

export const NetworkingCRM: React.FC<NetworkingCRMProps> = ({ preview = false, onPreviewClick }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Contact[]>('data-emploi-tracker', `${user.id}/contacts.json`);
      if (data) setContacts(data);
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/contacts.json`, contacts);
    };
    save();
  }, [contacts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-orange-100 text-orange-800';
      case 'referred': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'contacted': return 'Contacté';
      case 'replied': return 'Réponse reçue';
      case 'referred': return 'Référé';
      default: return status;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addContact = (contactData: Omit<Contact, 'id' | 'dateAdded'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setContacts(prev => [newContact, ...prev]);
  };

  const updateContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const exportContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await uploadJson('data-emploi-tracker', `${user.id}/contacts.json`, contacts);
  };

  if (preview) {
    return (
      <Card role="button" className="h-96 cursor-pointer" onClick={onPreviewClick}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>CRM de Réseautage</span>
            <Badge variant="secondary">{contacts.length} contacts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contacts.slice(0, 4).map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-600">{contact.position} • {contact.company}</p>
                </div>
                <Badge className={`text-xs ${getStatusColor(contact.status)}`}>
                  {getStatusLabel(contact.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">CRM de Réseautage</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#e3007b] hover:bg-[#e3007b]/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Contact
          </Button>
          <Button variant="outline" onClick={exportContacts} className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, entreprise ou poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="contacted">Contacté</SelectItem>
            <SelectItem value="replied">Réponse reçue</SelectItem>
            <SelectItem value="referred">Référé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
        {filteredContacts.map(contact => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                    <Badge className={`${getStatusColor(contact.status)}`}>
                      {getStatusLabel(contact.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{contact.position}</p>
                  <p className="text-sm font-medium text-gray-800 mb-3">{contact.company}</p>
                  
                  {contact.notes && (
                    <p className="text-sm text-gray-600 mb-3 italic">{contact.notes}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    {contact.linkedin && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`https://linkedin.com/${contact.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Ajouté le {new Date(contact.dateAdded).toLocaleDateString('fr-FR')}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditContact(contact)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addContact}
      />

      {editContact && (
        <EditContactModal
          isOpen={!!editContact}
          onClose={() => setEditContact(null)}
          contact={editContact}
          onUpdate={(data) => {
            updateContact(data);
            setEditContact(null);
          }}
        />
      )}
    </div>
  );
};
