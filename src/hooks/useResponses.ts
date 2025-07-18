import { useState, useEffect } from 'react';
import { Response, initialResponses } from '@/data/responses';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useResponses() {
  const [responses, setResponses] = useState<Response[]>(initialResponses);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setResponses(initialResponses);
        setCurrentUserId(null);
        return;
      }

      if (currentUserId && currentUserId !== user.id) {
        setResponses(initialResponses);
      }
      
      setCurrentUserId(user.id);
      
      const userSpecificKey = `responses_${user.id}`;
      const saved = localStorage.getItem(userSpecificKey);
      
      if (saved) {
        try {
          const parsedResponses = JSON.parse(saved);
          setResponses(parsedResponses);
          return;
        } catch (err) {
          console.error('Failed to parse saved responses', err);
        }
      }
      
      try {
        const { data } = await downloadJson<Response[]>('data-emploi-tracker', `${user.id}/responses.json`);
        if (data) {
          setResponses(data);
          localStorage.setItem(userSpecificKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to load responses from Supabase:', error);
      }
    };

    initializeUserData();
  }, [currentUserId]);

  useEffect(() => {
    const saveResponses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userSpecificKey = `responses_${user.id}`;
      localStorage.setItem(userSpecificKey, JSON.stringify(responses));
      
      try {
        await uploadJson('data-emploi-tracker', `${user.id}/responses.json`, responses);
      } catch (error) {
        console.error('Failed to save responses to Supabase:', error);
      }
    };

    if (currentUserId) {
      saveResponses();
    }
  }, [responses, currentUserId]);

  return { responses, setResponses };
}
