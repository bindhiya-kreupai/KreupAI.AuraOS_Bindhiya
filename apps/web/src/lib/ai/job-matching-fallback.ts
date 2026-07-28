import type { MatchDashboard } from './job-matching-types';

export function emptyMatchDashboard(): MatchDashboard {
  return {
    matches: [],
    summary: { activeJobs: 0, totalCandidates: 0, matchesFound: 0, avgMatchScore: 0 },
  };
}
