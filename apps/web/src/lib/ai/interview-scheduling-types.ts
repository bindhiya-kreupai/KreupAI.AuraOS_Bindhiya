export type InterviewSlot = {
  start: string;
  end: string;
  duration: number;
  conflicts: number;
  score: number;
};
export type InterviewProposal = {
  id: string;
  candidateId: string;
  interviewers: string[];
  slots: InterviewSlot[];
  status: 'PROPOSED' | 'COMMITTED';
};
