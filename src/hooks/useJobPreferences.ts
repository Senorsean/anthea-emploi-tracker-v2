import { useState, useEffect } from 'react';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

export interface JobPreferences {
  keywords: string;
  city: string;
  region: string;
  contractType: string;
}

export function useJobPreferences() {
  const [preferences, setPreferences] = useState<JobPreferences>({
    keywords: '',
    city: '',
    region: '',
    contractType: 'CDD',
  });

  useEffect(() => {
    const saved = localStorage.getItem('jobPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Failed to parse saved job preferences', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<JobPreferences>(
        'data-emploi-tracker',
        `${user.id}/jobPreferences.json`
      );
      if (data) setPreferences(data);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('jobPreferences', JSON.stringify(preferences));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson(
        'data-emploi-tracker',
        `${user.id}/jobPreferences.json`,
        preferences
      );
    };
    save();
  }, [preferences]);

  return { preferences, setPreferences } as const;
}
