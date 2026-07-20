export type JobMatch = {
  candidateId?: string;
  jobId?: string;
  name?: string;
  role: string;
  jobTitle: string;
  department?: string;
  matchScore: number;
  match_score: number;
  skillsMatched?: string[];
  skillsMissing?: string[];
  action?: string;
};

export type JobMatchRow = JobMatch;

export type MatchDashboard = {
  matches: JobMatch[];
  summary: {
    activeJobs: number;
    totalCandidates: number;
    matchesFound: number;
    avgMatchScore: number;
  };
};
