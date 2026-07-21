import type { RecruitmentAgentAction } from './recruitment-agent-types';

export function parseRecruitmentAgentFallbackIntent(message: string): {
  intent: RecruitmentAgentAction;
  params: Record<string, unknown>;
  confidence: number;
} {
  const lower = message.toLowerCase();

  if (lower.includes('screen') || lower.includes('rank') || lower.includes('candidate')) {
    return { intent: 'SCREEN_CANDIDATES', params: {}, confidence: 0.8 };
  }
  if (lower.includes('interview') && (lower.includes('upcoming') || lower.includes('schedule'))) {
    return { intent: 'GET_UPCOMING_INTERVIEWS', params: {}, confidence: 0.85 };
  }
  if (lower.includes('pipeline') || lower.includes('stats')) {
    return { intent: 'GET_PIPELINE_STATS', params: {}, confidence: 0.85 };
  }
  if (
    lower.includes('open') &&
    (lower.includes('position') || lower.includes('job') || lower.includes('role'))
  ) {
    return { intent: 'GET_OPEN_POSITIONS', params: {}, confidence: 0.85 };
  }
  if (lower.includes('send') || lower.includes('email') || lower.includes('communication')) {
    return { intent: 'SEND_COMMUNICATION', params: { draft: true }, confidence: 0.7 };
  }

  return { intent: 'GENERAL_QUERY', params: {}, confidence: 0.5 };
}

export function formatRecruitmentActionResult(
  intent: RecruitmentAgentAction,
  data: unknown
): string {
  switch (intent) {
    case 'GET_OPEN_POSITIONS':
      if (Array.isArray(data) && data.length) {
        return `Open positions (${data.length}):\n\n${data
          .map(
            (j: { title?: string; department?: string; status?: string }) =>
              `• ${j.title} — ${j.department} (${j.status})`
          )
          .join('\n')}`;
      }
      return 'No open positions found.';
    case 'GET_PIPELINE_STATS': {
      const stats = data as { total?: number; byStage?: Record<string, number> };
      if (stats?.byStage) {
        return `Pipeline overview (${stats.total ?? 0} candidates):\n${Object.entries(stats.byStage)
          .map(([stage, count]) => `• ${stage}: ${count}`)
          .join('\n')}`;
      }
      return 'Pipeline statistics unavailable.';
    }
    case 'GET_UPCOMING_INTERVIEWS':
      if (Array.isArray(data) && data.length) {
        return `Upcoming interviews:\n\n${data
          .map(
            (i: { candidate?: string; date?: string; type?: string }) =>
              `• ${i.candidate} — ${i.date ? new Date(i.date).toLocaleString() : 'TBD'} (${i.type})`
          )
          .join('\n')}`;
      }
      return 'No upcoming interviews scheduled.';
    case 'SCREEN_CANDIDATES':
      if (Array.isArray(data) && data.length) {
        return `Top candidate matches:\n\n${data
          .slice(0, 5)
          .map(
            (c: { name?: string; matchScore?: number; role?: string }) =>
              `• ${c.name} — ${c.matchScore}% match for ${c.role}`
          )
          .join('\n')}`;
      }
      return 'No candidates available for screening.';
    case 'SEND_COMMUNICATION':
      return 'Communication draft prepared. Review and send manually from the recruitment module.';
    default:
      return "I'm your recruitment assistant. I can help with candidate screening, pipeline stats, interviews, and open positions.";
  }
}

export const RECRUITMENT_SUGGESTED_ACTIONS = [
  'Show open positions',
  'Get pipeline statistics',
  'List upcoming interviews',
  'Screen top candidates',
];
