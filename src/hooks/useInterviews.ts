import { useState, useEffect } from 'react';
import { Interview, initialInterviews } from '@/data/interviews';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);

  useEffect(() => {
    const saved = localStorage.getItem('interviews');
    if (saved) {
      try {
        setInterviews(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Failed to parse saved interviews', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Interview[]>('data-emploi-tracker', `${user.id}/interviews.json`);
      if (data) setInterviews(data);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('interviews', JSON.stringify(interviews));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/interviews.json`, interviews);
    };
    save();
  }, [interviews]);

  return { interviews, setInterviews };
}
