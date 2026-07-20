import type { AgentAuthContext } from './agent-auth';
import { getOrCreateSession, loadChatHistory, persistChatTurn } from './agent-session';
import { normalizeAgentOutput, runAgentLlm } from './agent-llm';
import type { AgentChatResponse } from './agent-types';
import { AGENT_TYPES } from './agent-types';
import {
  formatRecruitmentActionResult,
  parseRecruitmentAgentFallbackIntent,
  RECRUITMENT_SUGGESTED_ACTIONS,
} from './recruitment-agent-fallback';
import { loadRecruitmentRetrievalContext } from './recruitment-agent-retrieval';
import {
  buildRecruitmentAgentSystemPrompt,
  recruitmentRetrievalToPrompt,
} from './recruitment-agent-rules';
import type { RecruitmentAgentAction } from './recruitment-agent-types';
import { RecruitmentAgentService } from '@/lib/services/agentic-ai';
import { getJobMatches } from './job-matching-ai';
import { AgenticAIProductionService } from '@/lib/services/agentic-ai/production-hardening.service';

async function executeRecruitmentAction(
  intent: RecruitmentAgentAction,
  params: Record<string, unknown>,
  auth: AgentAuthContext
): Promise<unknown> {
  const { tenantId } = auth;

  switch (intent) {
    case 'SCREEN_CANDIDATES': {
      const matches = await getJobMatches(tenantId, { userId: auth.userId }).catch(() => null);
      if (matches?.matches?.length) {
        return matches.matches.slice(0, 10);
      }
      const jobId = String(params.jobId || '');
      if (!jobId) {
        throw new Error('jobId is required for candidate screening');
      }
      return RecruitmentAgentService.screenCandidates(
        jobId,
        tenantId,
        params.criteria as import('@/lib/services/agentic-ai/types').ScreeningCriteria | undefined
      );
    }
    case 'GET_UPCOMING_INTERVIEWS':
      return RecruitmentAgentService.getUpcomingInterviews(tenantId, {
        interviewerId: params.interviewerId ? String(params.interviewerId) : undefined,
        candidateId: params.candidateId ? String(params.candidateId) : undefined,
        jobId: params.jobId ? String(params.jobId) : undefined,
        days: typeof params.days === 'number' ? params.days : undefined,
      });
    case 'GET_PIPELINE_STATS':
      return RecruitmentAgentService.getPipelineStats(tenantId);
    case 'GET_OPEN_POSITIONS':
      return RecruitmentAgentService.getOpenPositions(tenantId);
    case 'SEND_COMMUNICATION':
      return {
        draft: true,
        message:
          'Communication draft prepared. Review and send manually from the recruitment module.',
        template: params.templateType || 'APPLICATION_RECEIVED',
      };
    default:
      return null;
  }
}

export async function chatWithRecruitmentAgent(
  auth: AgentAuthContext,
  message: string,
  sessionId?: string
): Promise<AgentChatResponse> {
  const session = await getOrCreateSession(
    auth.tenantId,
    auth.userId,
    AGENT_TYPES.RECRUITMENT,
    sessionId
  );
  const retrieval = await loadRecruitmentRetrievalContext(auth.tenantId);
  const history = await loadChatHistory(session.id);

  const llmResult = await runAgentLlm({
    systemPrompt: buildRecruitmentAgentSystemPrompt(),
    userPrompt: `${recruitmentRetrievalToPrompt(retrieval)}\n\nUser message: ${message}`,
    history,
  });

  let intent: RecruitmentAgentAction = 'GENERAL_QUERY';
  let params: Record<string, unknown> = {};
  let responseMessage = '';
  let suggestedActions = RECRUITMENT_SUGGESTED_ACTIONS;
  let confidence = 0.75;
  let provider: AgentChatResponse['provider'] = 'fallback';
  let actionResult: unknown = null;

  if (llmResult) {
    const normalized = normalizeAgentOutput(llmResult.parsed);
    intent = normalized.intent as RecruitmentAgentAction;
    params = normalized.params;
    responseMessage = normalized.message;
    suggestedActions = normalized.suggestedActions.length
      ? normalized.suggestedActions
      : RECRUITMENT_SUGGESTED_ACTIONS;
    confidence = normalized.confidence;
    provider = llmResult.provider;
  } else {
    const fallback = parseRecruitmentAgentFallbackIntent(message);
    intent = fallback.intent;
    params = fallback.params;
    confidence = fallback.confidence;
    provider = 'fallback';
  }

  const guardrails = AgenticAIProductionService.getGuardrailsConfig().find(
    (g) => g.agentType === 'RECRUITMENT_AGENT'
  );
  const threshold = guardrails?.hallucination.confidenceThreshold ?? 0.75;

  if (confidence >= threshold && intent !== 'GENERAL_QUERY') {
    try {
      actionResult = await executeRecruitmentAction(intent, params, auth);
      if (!llmResult || !responseMessage) {
        responseMessage = formatRecruitmentActionResult(intent, actionResult);
      }
    } catch (err) {
      responseMessage = err instanceof Error ? err.message : 'Failed to execute action.';
    }
  } else if (confidence < threshold && intent !== 'GENERAL_QUERY') {
    responseMessage = guardrails?.hallucination.uncertaintyResponse || responseMessage;
    intent = 'GENERAL_QUERY';
  }

  if (!responseMessage) {
    responseMessage = formatRecruitmentActionResult('GENERAL_QUERY', retrieval);
  }

  await persistChatTurn(session.id, auth.userId, message, responseMessage, intent, actionResult);

  return {
    sessionId: session.sessionId,
    message: responseMessage,
    suggestedActions,
    actionExecuted: intent !== 'GENERAL_QUERY' ? { type: intent, result: actionResult } : undefined,
    confidence,
    provider,
  };
}
