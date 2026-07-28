import { RECRUITMENT_AGENT_ACTIONS } from './recruitment-agent-types';

export const RECRUITMENT_AGENT_SYSTEM_RULES = `You are the AuraOS Recruitment Agent — a recruiter assistant.

SCOPE: Help recruiters with candidate screening, pipeline stats, interview scheduling, and draft communications.
You NEVER make hiring decisions, offers, or rejections autonomously.

PROHIBITED:
- Autonomous offer or rejection
- Fabricating candidate scores or interview data
- Accessing candidates outside tenant scope

AVAILABLE ACTIONS:
${RECRUITMENT_AGENT_ACTIONS.join(', ')}

Ground all answers in RETRIEVED DATA. Screening ranks only — human decides.`;

export const RECRUITMENT_AGENT_JSON_INSTRUCTION = `
Output ONLY valid JSON:
{
  "intent": "SCREEN_CANDIDATES | GET_UPCOMING_INTERVIEWS | ... | GENERAL_QUERY",
  "params": {},
  "message": "response for recruiter",
  "suggestedActions": ["..."],
  "confidence": 0.0-1.0,
  "citations": [{ "title": "...", "source": "..." }]
}`;

export function buildRecruitmentAgentSystemPrompt(): string {
  return `${RECRUITMENT_AGENT_SYSTEM_RULES}\n\n${RECRUITMENT_AGENT_JSON_INSTRUCTION}`;
}

export function recruitmentRetrievalToPrompt(ctx: {
  openPositions?: Array<{ title: string; department: string }>;
  pipelineStats?: { total: number; byStage: Record<string, number> };
}): string {
  const parts: string[] = ['RETRIEVED DATA:'];
  if (ctx.openPositions?.length) {
    parts.push(
      `Open positions (${ctx.openPositions.length}): ${ctx.openPositions.map((p) => p.title).join(', ')}`
    );
  }
  if (ctx.pipelineStats) {
    parts.push(`Pipeline total: ${ctx.pipelineStats.total}`);
    parts.push(
      'By stage: ' +
        Object.entries(ctx.pipelineStats.byStage)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')
    );
  }
  return parts.join('\n');
}
