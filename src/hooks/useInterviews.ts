import { useState, useEffect } from 'react';
import { Interview, initialInterviews } from '@/data/interviews';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setInterviews(initialInterviews);
        setCurrentUserId(null);
        return;
      }

      if (currentUserId && currentUserId !== user.id) {
        setInterviews(initialInterviews);
      }
      
      setCurrentUserId(user.id);
      
      const userSpecificKey = `interviews_${user.id}`;
      const saved = localStorage.getItem(userSpecificKey);
      
      if (saved) {
        try {
          const parsedInterviews = JSON.parse(saved);
          setInterviews(parsedInterviews);
          return;
        } catch (err) {
          console.error('Failed to parse saved interviews', err);
        }
      }
      
      try {
        const { data } = await downloadJson<Interview[]>('data-emploi-tracker', `${user.id}/interviews.json`);
        if (data) {
          setInterviews(data);
          localStorage.setItem(userSpecificKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to load interviews from Supabase:', error);
      }
    };

    initializeUserData();
  }, [currentUserId]);

  useEffect(() => {
    const saveInterviews = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userSpecificKey = `interviews_${user.id}`;
      localStorage.setItem(userSpecificKey, JSON.stringify(interviews));
      
      try {
        await uploadJson('data-emploi-tracker', `${user.id}/interviews.json`, interviews);
      } catch (error) {
        console.error('Failed to save interviews to Supabase:', error);
      }
    };

    if (currentUserId) {
      saveInterviews();
    }
  }, [interviews, currentUserId]);

  return { interviews, setInterviews };
}
