export type RecruitmentAgentAction =
  | 'SCREEN_CANDIDATES'
  | 'GET_UPCOMING_INTERVIEWS'
  | 'GET_PIPELINE_STATS'
  | 'GET_OPEN_POSITIONS'
  | 'SEND_COMMUNICATION'
  | 'GENERAL_QUERY';

export const RECRUITMENT_AGENT_ACTIONS: RecruitmentAgentAction[] = [
  'SCREEN_CANDIDATES',
  'GET_UPCOMING_INTERVIEWS',
  'GET_PIPELINE_STATS',
  'GET_OPEN_POSITIONS',
  'SEND_COMMUNICATION',
  'GENERAL_QUERY',
];

export type RecruitmentRetrievalContext = {
  openPositions?: Array<{ id: string; title: string; department: string; status: string }>;
  pipelineStats?: { total: number; byStage: Record<string, number> };
  upcomingInterviews?: Array<{ id: string; candidate: string; date: string; type: string }>;
};
