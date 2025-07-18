
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Clear data if no user
        setJobs(initialJobs);
        setCurrentUserId(null);
        return;
      }

      // If user changed, clear previous data
      if (currentUserId && currentUserId !== user.id) {
        setJobs(initialJobs);
      }
      
      setCurrentUserId(user.id);
      
      // Try to load from user-specific localStorage first
      const userSpecificKey = `jobs_${user.id}`;
      const saved = localStorage.getItem(userSpecificKey);
      
      if (saved) {
        try {
          const parsedJobs = JSON.parse(saved);
          setJobs(parsedJobs);
          return;
        } catch (err) {
          console.error('Failed to parse saved jobs', err);
        }
      }
      
      // If no localStorage data, try Supabase
      try {
        const { data } = await downloadJson<Record<string, Job[]>>('data-emploi-tracker', `${user.id}/jobs.json`);
        if (data) {
          setJobs(data);
          // Save to user-specific localStorage for faster access
          localStorage.setItem(userSpecificKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to load jobs from Supabase:', error);
      }
    };

    initializeUserData();
  }, [currentUserId]);

  useEffect(() => {
    const saveJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to user-specific localStorage
      const userSpecificKey = `jobs_${user.id}`;
      localStorage.setItem(userSpecificKey, JSON.stringify(jobs));
      
      // Save to Supabase
      try {
        await uploadJson('data-emploi-tracker', `${user.id}/jobs.json`, jobs);
      } catch (error) {
        console.error('Failed to save jobs to Supabase:', error);
      }
    };

    if (currentUserId) {
      saveJobs();
    }
  }, [jobs, currentUserId]);

  return { jobs, setJobs };
}

export const JobsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useJobsState();
  return React.createElement(JobsContext.Provider, { value }, children);
};

export function useJobs(): JobsContextValue {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
