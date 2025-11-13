import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachingSession {
  id: string;
  candidate_id: string;
  consultant_id: string;
  session_date: string;
  session_type: 'individuel' | 'groupe';
  duration: number;
  status: 'planifiée' | 'en_cours' | 'complétée' | 'annulée';
  objectives?: string;
  notes_consultant?: string;
  notes_candidate?: string;
  action_items: any[];
  next_session_date?: string;
  created_at: string;
  updated_at: string;
}

export const useCoachingSessions = (userId?: string) => {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const targetUserId = userId || user.id;

      const { data, error } = await supabase
        .from('coaching_sessions' as any)
        .select('*')
        .or(`candidate_id.eq.${targetUserId},consultant_id.eq.${targetUserId}`)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions((data as unknown as CoachingSession[]) || []);
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

  const createSession = async (sessionData: any) => {
    try {
      const { data, error } = await supabase
        .from('coaching_sessions' as any)
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Session créée',
        description: 'La session de coaching a été créée avec succès.',
      });

      fetchSessions();
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

  const updateSession = async (sessionId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('coaching_sessions' as any)
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });

      fetchSessions();
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

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('coaching_sessions' as any)
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session supprimée',
        description: 'La session a été supprimée avec succès.',
      });

      fetchSessions();
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

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
};