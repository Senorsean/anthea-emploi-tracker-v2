import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachingObjective {
  id: string;
  candidate_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  category: 'leadership' | 'communication' | 'stratégie' | 'gestion_équipe' | 'développement_personnel' | 'autre';
  status: 'en_cours' | 'atteint' | 'abandonné' | 'en_pause';
  target_date?: string;
  completion_date?: string;
  progress_percentage: number;
  measurable_criteria: any[];
  created_at: string;
  updated_at: string;
}

export const useCoachingObjectives = (candidateId?: string) => {
  const [objectives, setObjectives] = useState<CoachingObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const targetId = candidateId || user.id;

      const { data, error } = await supabase
        .from('coaching_objectives' as any)
        .select('*')
        .eq('candidate_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjectives((data as unknown as CoachingObjective[]) || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createObjective = async (objectiveData: any) => {
    try {
      const { data, error } = await supabase
        .from('coaching_objectives' as any)
        .insert([objectiveData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Objectif créé',
        description: 'L\'objectif a été créé avec succès.',
      });

      fetchObjectives();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateObjective = async (objectiveId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('coaching_objectives' as any)
        .update(updates)
        .eq('id', objectiveId);

      if (error) throw error;

      toast({
        title: 'Objectif mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });

      fetchObjectives();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updateProgress = async (objectiveId: string, progress: number) => {
    return updateObjective(objectiveId, { progress_percentage: progress });
  };

  useEffect(() => {
    fetchObjectives();
  }, [candidateId]);

  return {
    objectives,
    loading,
    fetchObjectives,
    createObjective,
    updateObjective,
    updateProgress,
  };
};