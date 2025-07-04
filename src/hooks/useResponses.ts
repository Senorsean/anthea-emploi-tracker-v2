import { useState, useEffect } from 'react';
import { Response, initialResponses } from '@/data/responses';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useResponses() {
  const [responses, setResponses] = useState<Response[]>(initialResponses);

  useEffect(() => {
    const saved = localStorage.getItem('responses');
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Failed to parse saved responses', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Response[]>('data-emploi-tracker', `${user.id}/responses.json`);
      if (data) setResponses(data);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('responses', JSON.stringify(responses));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/responses.json`, responses);
    };
    save();
  }, [responses]);

  return { responses, setResponses };
}
