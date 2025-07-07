import { useState, useMemo } from 'react';
import { Alert, initialAlerts } from '@/data/alerts';
import { useJobs } from './useJobs';

export function useAlerts() {
  const { jobs, setJobs } = useJobs();
  const [manualAlerts, setManualAlerts] = useState<Alert[]>(initialAlerts);
  const [readJobIds, setReadJobIds] = useState<string[]>([]);

  const jobAlerts: Alert[] = useMemo(() => {
    const list: Alert[] = [];
    for (const job of Object.values(jobs).flat()) {
      if (job.followUpDate) {
        list.push({
          id: `job-${job.id}`,
          type: 'application',
          company: job.company,
          message: `Relance ${job.company} - ${job.title}`,
          date: job.followUpDate,
          read: readJobIds.includes(job.id)
        });
      }
    }
    return list;
  }, [jobs, readJobIds]);

  const alerts = useMemo(
    () => [...manualAlerts, ...jobAlerts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [manualAlerts, jobAlerts]
  );

  const markAsRead = (id: string) => {
    if (id.startsWith('job-')) {
      const jobId = id.slice(4);
      setReadJobIds(prev => (prev.includes(jobId) ? prev : [...prev, jobId]));
    } else {
      setManualAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
    }
  };

  const cancelAlert = (id: string) => {
    if (id.startsWith('job-')) {
      const jobId = id.slice(4);
      setJobs(prev => {
        const newJobs = { ...prev };
        for (const col in newJobs) {
          newJobs[col] = newJobs[col].map(job =>
            job.id === jobId ? { ...job, followUpDate: undefined } : job
          );
        }
        return newJobs;
      });
      setReadJobIds(prev => prev.filter(j => j !== jobId));
    } else {
      setManualAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const updateAlertDate = (id: string, newDate: string) => {
    if (id.startsWith('job-')) {
      const jobId = id.slice(4);
      setJobs(prev => {
        const newJobs = { ...prev };
        for (const col in newJobs) {
          newJobs[col] = newJobs[col].map(job =>
            job.id === jobId ? { ...job, followUpDate: newDate } : job
          );
        }
        return newJobs;
      });
    } else {
      setManualAlerts(prev => prev.map(a => (a.id === id ? { ...a, date: newDate } : a)));
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return { alerts, markAsRead, cancelAlert, updateAlertDate, unreadCount };
}
