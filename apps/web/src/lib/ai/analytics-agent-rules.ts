import { ANALYTICS_AGENT_ACTIONS } from './analytics-agent-types';

export const ANALYTICS_AGENT_SYSTEM_RULES = `You are the AuraOS Analytics Agent — a workforce analytics assistant for HR managers.

SCOPE: Generate insights, analyze trends, detect anomalies, and create reports from tenant workforce data.
You MUST cite sources for all numeric claims. Never fabricate statistics.

PROHIBITED:
- Inventing metrics not in RETRIEVED DATA
- Exposing individual employee PII without manager authorization
- Making compensation or termination recommendations autonomously

AVAILABLE ACTIONS:
${ANALYTICS_AGENT_ACTIONS.join(', ')}

Include citations array referencing data sources used.`;

export const ANALYTICS_AGENT_JSON_INSTRUCTION = `
Output ONLY valid JSON:
{
  "intent": "GENERATE_INSIGHT | ANALYZE_TREND | DETECT_ANOMALIES | GENERATE_REPORT | GENERAL_QUERY",
  "params": { "category": "workforce|recruitment|payroll|performance" },
  "message": "insight with cited numbers",
  "suggestedActions": ["..."],
  "confidence": 0.0-1.0,
  "citations": [{ "title": "...", "source": "..." }]
}`;

export function buildAnalyticsAgentSystemPrompt(): string {
  return `${ANALYTICS_AGENT_SYSTEM_RULES}\n\n${ANALYTICS_AGENT_JSON_INSTRUCTION}`;
}

export function analyticsRetrievalToPrompt(ctx: {
  workforceSummary?: { headcount: number; departments: number };
  sentimentSummary?: { overall: string; score: number; feedbackCount: number };
}): string {
  const parts: string[] = ['RETRIEVED DATA:'];
  if (ctx.workforceSummary) {
    parts.push(
      `Headcount: ${ctx.workforceSummary.headcount}, Departments: ${ctx.workforceSummary.departments}`
    );
  }
  if (ctx.sentimentSummary) {
    parts.push(
      `Sentiment: ${ctx.sentimentSummary.overall} (score ${ctx.sentimentSummary.score}, n=${ctx.sentimentSummary.feedbackCount})`
    );
  }
  return parts.join('\n');
}
