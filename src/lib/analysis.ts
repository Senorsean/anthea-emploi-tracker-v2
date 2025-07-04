export interface ConversionRates {
  targetedToApplied: number;
  appliedToScreening: number;
  screeningToInterview: number;
  interviewToFinal: number;
  finalToOffer: number;
}

export function calculateConversionRates(counts: Record<string, number>): ConversionRates {
  return {
    targetedToApplied: counts.targeted ? counts.applied / counts.targeted : 0,
    appliedToScreening: counts.applied ? counts.screening / counts.applied : 0,
    screeningToInterview: counts.screening ? counts.interview / counts.screening : 0,
    interviewToFinal: counts.interview ? counts.final / counts.interview : 0,
    finalToOffer: counts.final ? counts.offer / counts.final : 0,
  };
}

export function detectBottleneck(rates: ConversionRates) {
  const thresholds: Record<keyof ConversionRates, number> = {
    targetedToApplied: 0.4,
    appliedToScreening: 0.5,
    screeningToInterview: 0.4,
    interviewToFinal: 0.5,
    finalToOffer: 0.5,
  };
  let worst: { stage: keyof ConversionRates; rate: number } | null = null;
  (Object.keys(rates) as (keyof ConversionRates)[]).forEach(stage => {
    const rate = rates[stage];
    if (rate < thresholds[stage] && (!worst || rate < worst.rate)) {
      worst = { stage, rate };
    }
  });
  return worst;
}

export function computeRecommendedApplications(currentPerWeek: number, successRate: number, goalInterviews = 1) {
  if (successRate <= 0) return goalInterviews * 5;
  const needed = goalInterviews / successRate;
  return Math.max(0, Math.ceil(needed - currentPerWeek));
}

export function countRecentApplications(allDates: string[], days: number, now: Date) {
  const ms = 1000 * 60 * 60 * 24;
  return allDates.filter(d => (now.getTime() - new Date(d).getTime()) / ms <= days).length;
}
