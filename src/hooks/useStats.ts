
import { useState, useEffect } from 'react';
import { useJobs } from './useJobs';
import { useInterviews } from './useInterviews';
import { useResponses } from './useResponses';

export interface CentralizedStats {
  jobs: {
    targeted: number;
    applied: number;
    screening: number;
    interview: number;
    final: number;
    offer: number;
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
    targetedToApplied: number;
    appliedToScreening: number;
    screeningToInterview: number;
    interviewToFinal: number;
    finalToOffer: number;
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
  const { interviews } = useInterviews();
  const { responses } = useResponses();
  
  const [stats, setStats] = useState<CentralizedStats>({
    jobs: {
      targeted: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      final: 0,
      offer: 0,
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
      targetedToApplied: 0,
      appliedToScreening: 0,
      screeningToInterview: 0,
      interviewToFinal: 0,
      finalToOffer: 0,
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

    // Job counts by stage
    const jobCounts = {
      targeted: jobs.targeted?.length || 0,
      applied: jobs.applied?.length || 0,
      screening: jobs.screening?.length || 0,
      interview: jobs.interview?.length || 0,
      final: jobs.final?.length || 0,
      offer: jobs.offer?.length || 0,
      total: allJobs.length,
    };

    // Time-based statistics
    const timeframes = {
      today: {
        applications: jobs.applied?.filter(job => diffDays(job.dateAdded) <= 1).length || 0,
        interviews: interviews?.filter(interview => diffDays(interview.date) <= 1).length || 0,
        responses: responses?.filter(response => diffDays(response.date) <= 1).length || 0,
      },
      week: {
        applications: jobs.applied?.filter(job => diffDays(job.dateAdded) <= 7).length || 0,
        interviews: interviews?.filter(interview => diffDays(interview.date) <= 7).length || 0,
        responses: responses?.filter(response => diffDays(response.date) <= 7).length || 0,
      },
      month: {
        applications: jobs.applied?.filter(job => diffDays(job.dateAdded) <= 30).length || 0,
        interviews: interviews?.filter(interview => diffDays(interview.date) <= 30).length || 0,
        responses: responses?.filter(response => diffDays(response.date) <= 30).length || 0,
      },
      threeMonths: {
        applications: jobs.applied?.filter(job => diffDays(job.dateAdded) <= 90).length || 0,
        interviews: interviews?.filter(interview => diffDays(interview.date) <= 90).length || 0,
        responses: responses?.filter(response => diffDays(response.date) <= 90).length || 0,
      },
      sixMonths: {
        applications: jobs.applied?.filter(job => diffDays(job.dateAdded) <= 180).length || 0,
        interviews: interviews?.filter(interview => diffDays(interview.date) <= 180).length || 0,
        responses: responses?.filter(response => diffDays(response.date) <= 180).length || 0,
      },
    };

    // Conversion rates
    const conversionRates = {
      targetedToApplied: jobCounts.targeted ? jobCounts.applied / jobCounts.targeted : 0,
      appliedToScreening: jobCounts.applied ? jobCounts.screening / jobCounts.applied : 0,
      screeningToInterview: jobCounts.screening ? jobCounts.interview / jobCounts.screening : 0,
      interviewToFinal: jobCounts.interview ? jobCounts.final / jobCounts.interview : 0,
      finalToOffer: jobCounts.final ? jobCounts.offer / jobCounts.final : 0,
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
  }, [jobs, interviews, responses]);

  return stats;
}
