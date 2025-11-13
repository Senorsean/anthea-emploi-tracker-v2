import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachingNote {
  id: string;
  session_id?: string;
  candidate_id: string;
  consultant_id?: string;
  note_type: 'réflexion' | 'feedback' | 'action' | 'observation' | 'autre';
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export const useCoachingNotes = (sessionId?: string, candidateId?: string) => {
  const [notes, setNotes] = useState<CoachingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('coaching_notes').select('*');

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data as CoachingNote[] || []);
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

  const createNote = async (noteData: any) => {
    try {
      const { data, error } = await supabase
        .from('coaching_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Note créée',
        description: 'La note a été enregistrée.',
      });

      fetchNotes();
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

  const updateNote = async (noteId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('coaching_notes')
        .update({ content })
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Note mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });

      fetchNotes();
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
    fetchNotes();
  }, [sessionId, candidateId]);

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
  };
};