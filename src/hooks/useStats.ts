
import { useState, useEffect } from 'react';
import { useJobs } from './useJobs';
import { useResponses } from './useResponses';
import { useInterviews } from './useInterviews';

export interface CentralizedStats {
  jobs: {
    offer: number;
    applied: number;
    screening: number;
    interview: number;
    final: number;
    total: number;
  };
  timeframes: {
    today: {
      applications: number;
      interviews: number;
      responses: number;
    };
    week: {
      applications: number;
      interviews: number;
      responses: number;
    };
    month: {
      applications: number;
      interviews: number;
      responses: number;
    };
    threeMonths: {
      applications: number;
      interviews: number;
      responses: number;
    };
    sixMonths: {
      applications: number;
      interviews: number;
      responses: number;
    };
  };
  conversionRates: {
    offerToApplied: number;
    appliedToScreening: number;
    screeningToInterview: number;
    interviewToFinal: number;
  };
  goals: {
    interviewsThisWeek: number;
    interviewsTarget: number;
    interviewsProgress: number;
    responsesThisWeek: number;
    responsesTarget: number;
    responsesProgress: number;
  };
}

export function useStats(): CentralizedStats {
  const { jobs } = useJobs();
  const { responses } = useResponses();
  const { interviews } = useInterviews();
  
  const [stats, setStats] = useState<CentralizedStats>({
    jobs: {
      offer: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      final: 0,
      total: 0,
    },
    timeframes: {
      today: { applications: 0, interviews: 0, responses: 0 },
      week: { applications: 0, interviews: 0, responses: 0 },
      month: { applications: 0, interviews: 0, responses: 0 },
      threeMonths: { applications: 0, interviews: 0, responses: 0 },
      sixMonths: { applications: 0, interviews: 0, responses: 0 },
    },
    conversionRates: {
      offerToApplied: 0,
      appliedToScreening: 0,
      screeningToInterview: 0,
      interviewToFinal: 0,
    },
    goals: {
      interviewsThisWeek: 0,
      interviewsTarget: 2,
      interviewsProgress: 0,
      responsesThisWeek: 0,
      responsesTarget: 3,
      responsesProgress: 0,
    },
  });

  useEffect(() => {
    const now = new Date();
    const allJobs = Object.values(jobs).flat();
    
    const diffDays = (dateStr: string) => {
      return (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    };

    // Get interview jobs (jobs in the "interview" column + jobs with interview status)
    const interviewJobs = jobs.interview || [];
    const jobsWithInterviewStatus = allJobs.filter(
      (job) => job.offerStatus === 'first_interview' || job.offerStatus === 'second_interview'
    );

    // Combine both sets of interview jobs, avoiding duplicates
    const allInterviewJobs = [
      ...interviewJobs,
      ...jobsWithInterviewStatus.filter(
        (job) => !interviewJobs.some((interviewJob) => interviewJob.id === job.id)
      ),
    ];

    // Job counts by stage - applied now includes all progressed jobs
    const jobCounts = {
      offer: jobs.offer?.length || 0,
      applied:
        (jobs.applied?.length || 0) +
        (jobs.screening?.length || 0) +
        allInterviewJobs.length +
        (jobs.final?.length || 0),
      screening: (jobs.screening?.length || 0) + allInterviewJobs.length + (jobs.final?.length || 0),
      interview: allInterviewJobs.length,
      final: jobs.final?.length || 0,
      total: allJobs.length,
    };

    // Time-based statistics
    const allAppliedJobs = [
      ...(jobs.applied || []),
      ...(jobs.screening || []),
      ...allInterviewJobs,
      ...(jobs.final || []),
    ];

    const interviewCounts = {
      day: interviews.filter(i => diffDays(i.date) <= 1).length || 0,
      week: interviews.filter(i => diffDays(i.date) <= 7).length || 0,
      month: interviews.filter(i => diffDays(i.date) <= 30).length || 0,
      threeMonths: interviews.filter(i => diffDays(i.date) <= 90).length || 0,
      sixMonths: interviews.filter(i => diffDays(i.date) <= 180).length || 0,
    };

    const timeframes = {
      today: {
        applications: allAppliedJobs.filter(job => diffDays(job.dateAdded) <= 1).length || 0,
        interviews: interviewCounts.day,
        responses: responses?.filter(response => diffDays(response.date) <= 1).length || 0,
      },
      week: {
        applications: allAppliedJobs.filter(job => diffDays(job.dateAdded) <= 7).length || 0,
        interviews: interviewCounts.week,
        responses: responses?.filter(response => diffDays(response.date) <= 7).length || 0,
      },
      month: {
        applications: allAppliedJobs.filter(job => diffDays(job.dateAdded) <= 30).length || 0,
        interviews: interviewCounts.month,
        responses: responses?.filter(response => diffDays(response.date) <= 30).length || 0,
      },
      threeMonths: {
        applications: allAppliedJobs.filter(job => diffDays(job.dateAdded) <= 90).length || 0,
        interviews: interviewCounts.threeMonths,
        responses: responses?.filter(response => diffDays(response.date) <= 90).length || 0,
      },
      sixMonths: {
        applications: allAppliedJobs.filter(job => diffDays(job.dateAdded) <= 180).length || 0,
        interviews: interviewCounts.sixMonths,
        responses: responses?.filter(response => diffDays(response.date) <= 180).length || 0,
      },
    };

    // Conversion rates - updated for new structure
    const conversionRates = {
      offerToApplied: jobCounts.offer ? jobCounts.applied / jobCounts.offer : 0,
      appliedToScreening: jobCounts.applied ? jobCounts.screening / jobCounts.applied : 0,
      screeningToInterview: jobCounts.screening ? jobCounts.interview / jobCounts.screening : 0,
      interviewToFinal: jobCounts.interview ? jobCounts.final / jobCounts.interview : 0,
    };

    // Goals calculation
    const interviewsTarget = 2;
    const responsesTarget = 3;
    const goals = {
      interviewsThisWeek: timeframes.week.interviews,
      interviewsTarget,
      interviewsProgress: Math.min(100, Math.round((timeframes.week.interviews / interviewsTarget) * 100)),
      responsesThisWeek: timeframes.week.responses,
      responsesTarget,
      responsesProgress: Math.min(100, Math.round((timeframes.week.responses / responsesTarget) * 100)),
    };

    setStats({
      jobs: jobCounts,
      timeframes,
      conversionRates,
      goals,
    });
  }, [jobs, responses, interviews]);

  return stats;
}
