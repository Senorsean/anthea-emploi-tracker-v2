import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Job, initialJobs } from '@/data/jobs';
import { uploadJson, downloadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

interface JobsContextValue {
  jobs: Record<string, Job[]>;
  setJobs: React.Dispatch<React.SetStateAction<Record<string, Job[]>>>;
}

const JobsContext = createContext<JobsContextValue | null>(null);

function useJobsState(): JobsContextValue {
  const [jobs, setJobs] = useState<Record<string, Job[]>>(initialJobs);

  useEffect(() => {
    const saved = localStorage.getItem('jobs');
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Failed to parse saved jobs', err);
      }
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await downloadJson<Record<string, Job[]>>('data-emploi-tracker', `${user.id}/jobs.json`);
      if (data) setJobs(data);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    const save = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await uploadJson('data-emploi-tracker', `${user.id}/jobs.json`, jobs);
    };
    save();
  }, [jobs]);

  return { jobs, setJobs };
}

export const JobsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useJobsState();
  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};

export function useJobs(): JobsContextValue {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
