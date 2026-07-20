export type AnalyticsAgentAction =
  | 'GENERATE_INSIGHT'
  | 'ANALYZE_TREND'
  | 'DETECT_ANOMALIES'
  | 'GENERATE_REPORT'
  | 'GENERAL_QUERY';

export const ANALYTICS_AGENT_ACTIONS: AnalyticsAgentAction[] = [
  'GENERATE_INSIGHT',
  'ANALYZE_TREND',
  'DETECT_ANOMALIES',
  'GENERATE_REPORT',
  'GENERAL_QUERY',
];

export type AnalyticsRetrievalContext = {
  workforceSummary?: { headcount: number; departments: number };
  sentimentSummary?: { overall: string; score: number; feedbackCount: number };
  predictions?: Array<{ type: string; count: number }>;
};
