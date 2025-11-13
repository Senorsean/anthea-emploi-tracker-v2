import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
}

interface CandidateSelectorProps {
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
}

const CandidateSelector = ({ selectedCandidateId, onSelectCandidate }: CandidateSelectorProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('consultant_id', user.id);

        if (error) throw error;

        setCandidates(profiles || []);
        
        // Auto-sélectionner le premier candidat s'il n'y en a pas de sélectionné
        if (profiles && profiles.length > 0 && !selectedCandidateId) {
          onSelectCandidate(profiles[0].id);
        }
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les candidats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Chargement des candidats...</div>;
  }

  if (candidates.length === 0) {
    return (
      <div className="text-muted-foreground p-4 bg-muted/50 rounded-lg">
        Aucun candidat assigné. Créez des candidats depuis le panneau d'administration.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Sélectionner un candidat</Label>
      <Select value={selectedCandidateId || ''} onValueChange={onSelectCandidate}>
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
    </div>
  );
};

export default CandidateSelector;
