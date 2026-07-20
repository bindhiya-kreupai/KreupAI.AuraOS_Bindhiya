import type { AgentAuthContext } from './agent-auth';
import { getOrCreateSession, loadChatHistory, persistChatTurn } from './agent-session';
import { normalizeAgentOutput, runAgentLlm } from './agent-llm';
import type { AgentChatResponse } from './agent-types';
import { AGENT_TYPES } from './agent-types';
import {
  ANALYTICS_SUGGESTED_ACTIONS,
  formatAnalyticsActionResult,
  parseAnalyticsAgentFallbackIntent,
} from './analytics-agent-fallback';
import {
  analyticsRetrievalToCitations,
  loadAnalyticsRetrievalContext,
} from './analytics-agent-retrieval';
import {
  analyticsRetrievalToPrompt,
  buildAnalyticsAgentSystemPrompt,
} from './analytics-agent-rules';
import type { AnalyticsAgentAction } from './analytics-agent-types';
import { AnalyticsAgentService } from '@/lib/services/agentic-ai';
import { AgenticAIProductionService } from '@/lib/services/agentic-ai/production-hardening.service';

async function executeAnalyticsAction(
  intent: AnalyticsAgentAction,
  params: Record<string, unknown>,
  tenantId: string
): Promise<unknown> {
  switch (intent) {
    case 'GENERATE_INSIGHT':
      return AnalyticsAgentService.generateInsight(
        {
          domain:
            (String(params.category || 'workforce').toUpperCase() as 'HR' | 'WORKFORCE') ||
            'WORKFORCE',
          question: String(params.question || 'workforce overview'),
        },
        tenantId
      );
    case 'ANALYZE_TREND':
      return AnalyticsAgentService.analyzeTrend(
        String(params.metric || 'headcount'),
        tenantId,
        {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        'MONTH'
      );
    case 'DETECT_ANOMALIES':
      return AnalyticsAgentService.detectAnomalies(tenantId, 'WORKFORCE');
    case 'GENERATE_REPORT':
      return AnalyticsAgentService.generateReport('WORKFORCE_REVIEW', tenantId, { format: 'HTML' });
    default:
      return null;
  }
}

export async function chatWithAnalyticsAgent(
  auth: AgentAuthContext,
  message: string,
  sessionId?: string
): Promise<AgentChatResponse> {
  const session = await getOrCreateSession(
    auth.tenantId,
    auth.userId,
    AGENT_TYPES.ANALYTICS,
    sessionId
  );
  const retrieval = await loadAnalyticsRetrievalContext(auth.tenantId);
  const history = await loadChatHistory(session.id);

  const llmResult = await runAgentLlm({
    systemPrompt: buildAnalyticsAgentSystemPrompt(),
    userPrompt: `${analyticsRetrievalToPrompt(retrieval)}\n\nUser message: ${message}`,
    history,
  });

  let intent: AnalyticsAgentAction = 'GENERAL_QUERY';
  let params: Record<string, unknown> = {};
  let responseMessage = '';
  let suggestedActions = ANALYTICS_SUGGESTED_ACTIONS;
  let confidence = 0.75;
  let provider: AgentChatResponse['provider'] = 'fallback';
  let actionResult: unknown = null;

  if (llmResult) {
    const normalized = normalizeAgentOutput(llmResult.parsed);
    intent = normalized.intent as AnalyticsAgentAction;
    params = normalized.params;
    responseMessage = normalized.message;
    suggestedActions = normalized.suggestedActions.length
      ? normalized.suggestedActions
      : ANALYTICS_SUGGESTED_ACTIONS;
    confidence = normalized.confidence;
    provider = llmResult.provider;
  } else {
    const fallback = parseAnalyticsAgentFallbackIntent(message);
    intent = fallback.intent;
    params = fallback.params;
    confidence = fallback.confidence;
    provider = 'fallback';
  }

  const guardrails = AgenticAIProductionService.getGuardrailsConfig().find(
    (g) => g.agentType === 'ANALYTICS_AGENT'
  );
  const threshold = guardrails?.hallucination.confidenceThreshold ?? 0.75;

  if (confidence >= threshold && intent !== 'GENERAL_QUERY') {
    try {
      actionResult = await executeAnalyticsAction(intent, params, auth.tenantId);
      if (!llmResult || !responseMessage) {
        responseMessage = formatAnalyticsActionResult(intent, actionResult, retrieval);
      }
    } catch (err) {
      responseMessage = err instanceof Error ? err.message : 'Failed to execute analytics action.';
    }
  } else if (confidence < threshold && intent !== 'GENERAL_QUERY') {
    responseMessage = guardrails?.hallucination.uncertaintyResponse || responseMessage;
    intent = 'GENERAL_QUERY';
  }

  if (!responseMessage) {
    responseMessage = formatAnalyticsActionResult('GENERAL_QUERY', null, retrieval);
  }

  await persistChatTurn(session.id, auth.userId, message, responseMessage, intent, actionResult);

  const citations = analyticsRetrievalToCitations(retrieval);

  return {
    sessionId: session.sessionId,
    message: responseMessage,
    suggestedActions,
    actionExecuted: intent !== 'GENERAL_QUERY' ? { type: intent, result: actionResult } : undefined,
    confidence,
    provider,
    citations: citations.length ? citations : undefined,
  };
}
