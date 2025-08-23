import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { UserCheck, BookOpen, Plus, Minus, UserPlus } from 'lucide-react';

interface Candidate {
  id: string;
  email: string;
  full_name: string;
}

interface Module {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
}

interface CandidateModule {
  candidate_id: string;
  module_id: string;
  module_name: string;
  category: string;
}

export const ConsultantPanel = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [candidateModules, setCandidateModules] = useState<CandidateModule[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get candidates (users with candidat role)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        const candidatesWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: roleData } = await supabase.rpc('get_user_role', {
              _user_id: profile.id
            });
            return roleData === 'candidat' ? profile : null;
          })
        );
        setCandidates(candidatesWithRoles.filter(Boolean) as Candidate[]);
      }

      // Get all modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (modulesData) {
        setModules(modulesData);
      }

      // Get candidate-module assignments
      const { data: assignmentsData } = await supabase
        .from('candidate_modules')
        .select(`
          candidate_id,
          module_id,
          modules!inner(name, category)
        `)
        .eq('is_active', true);

      if (assignmentsData) {
        setCandidateModules(assignmentsData.map((assignment: any) => ({
          candidate_id: assignment.candidate_id,
          module_id: assignment.module_id,
          module_name: assignment.modules.name,
          category: assignment.modules.category
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const assignModule = async (candidateId: string, moduleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('candidate_modules')
        .insert({
          candidate_id: candidateId,
          module_id: moduleId,
          consultant_id: user.id
        });

      if (error) throw error;

      toast.success('Module assigné avec succès');
      fetchData();
    } catch (error) {
      console.error('Error assigning module:', error);
      toast.error('Erreur lors de l\'assignation du module');
    }
  };

  const removeModule = async (candidateId: string, moduleId: string) => {
    try {
      const { error } = await supabase
        .from('candidate_modules')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('module_id', moduleId);

      if (error) throw error;

      toast.success('Module retiré avec succès');
      fetchData();
    } catch (error) {
      console.error('Error removing module:', error);
      toast.error('Erreur lors du retrait du module');
    }
  };

  const createCandidate = async () => {
    if (!newCandidateEmail.trim() || !newCandidateName.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create profile
      const candidateId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: candidateId,
          email: newCandidateEmail.trim(),
          full_name: newCandidateName.trim()
        });

      if (profileError) throw profileError;

      // Assign candidat role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: candidateId,
          role: 'candidat',
          assigned_by: user.id
        });

      if (roleError) throw roleError;

      toast.success('Candidat créé avec succès');
      setNewCandidateEmail('');
      setNewCandidateName('');
      fetchData();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Erreur lors de la création du candidat');
    }
  };

  const isModuleAssigned = (candidateId: string, moduleId: string) => {
    return candidateModules.some(
      cm => cm.candidate_id === candidateId && cm.module_id === moduleId
    );
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'recherche_emploi': return 'Recherche Emploi';
      case 'definition_projet_pro': return 'Définition Projet Pro';
      case 'progression_carriere': return 'Progression Carrière';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recherche_emploi': return 'bg-blue-100 text-blue-800';
      case 'definition_projet_pro': return 'bg-purple-100 text-purple-800';
      case 'progression_carriere': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Panneau Consultant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gérez l'attribution des modules aux candidats.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un Nouveau Candidat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">Email du candidat</Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="email@example.com"
                value={newCandidateEmail}
                onChange={(e) => setNewCandidateEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateName">Nom complet</Label>
              <Input
                id="candidateName"
                placeholder="Prénom Nom"
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createCandidate} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Créer Candidat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un Candidat</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedCandidate} value={selectedCandidate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un candidat" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.full_name || candidate.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Attribution des Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(
                modules.reduce((acc, module) => {
                  if (!acc[module.category]) {
                    acc[module.category] = [];
                  }
                  acc[module.category].push(module);
                  return acc;
                }, {} as Record<string, Module[]>)
              ).map(([category, categoryModules]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Badge className={getCategoryColor(category)}>
                      {getCategoryLabel(category)}
                    </Badge>
                  </h3>
                  <div className="grid gap-2">
                    {categoryModules.map((module) => {
                      const isAssigned = isModuleAssigned(selectedCandidate, module.id);
                      return (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {module.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAssigned ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeModule(selectedCandidate, module.id)}
                              >
                                <Minus className="h-4 w-4" />
                                Retirer
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => assignModule(selectedCandidate, module.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Assigner
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};