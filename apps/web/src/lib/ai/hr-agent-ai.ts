import type { AgentAuthContext } from './agent-auth';
import { normalizeAgentOutput, runAgentLlm } from './agent-llm';
import type { AgentChatResponse } from './agent-types';
import {
  formatHRActionResult,
  HR_SUGGESTED_ACTIONS,
  parseHRAgentFallbackIntent,
} from './hr-agent-fallback';
import { loadHRRetrievalContext, retrievalToCitations } from './hr-agent-retrieval';
import { buildHRAgentSystemPrompt, retrievalToPromptBlock } from './hr-agent-rules';
import type { HRAgentAction } from './hr-agent-types';
import { getOrCreateSession, loadChatHistory, persistChatTurn } from './agent-session';
import { AGENT_TYPES } from './agent-types';
import { HRAgentService } from '@/lib/services/agentic-ai';
import { AgenticAIProductionService } from '@/lib/services/agentic-ai/production-hardening.service';

/** Intents whose reply must be grounded in live action results (not LLM prose alone). */
const LIVE_DATA_INTENTS: HRAgentAction[] = [
  'GET_LEAVE_BALANCE',
  'APPLY_LEAVE',
  'GET_LEAVE_REQUESTS',
  'GET_ATTENDANCE',
  'GET_ATTENDANCE_SUMMARY',
  'GET_PAYSLIP',
  'GET_TAX_DETAILS',
  'GET_SALARY_STRUCTURE',
  'SEARCH_POLICIES',
  'REQUEST_DOCUMENT',
];

const MUTATING_INTENTS: HRAgentAction[] = ['APPLY_LEAVE', 'REQUEST_DOCUMENT'];

async function executeHRAction(
  intent: HRAgentAction,
  params: Record<string, unknown>,
  auth: AgentAuthContext
): Promise<unknown> {
  const employeeId = auth.employeeId;
  if (!employeeId && intent !== 'GENERAL_QUERY' && intent !== 'SEARCH_POLICIES') {
    throw new Error('Employee profile not linked to your account.');
  }

  const { tenantId } = auth;
  const eid = employeeId!;

  switch (intent) {
    case 'GET_LEAVE_BALANCE':
      return HRAgentService.getLeaveBalance(eid, tenantId, params.leaveType as string | undefined);
    case 'APPLY_LEAVE':
      // Self-service: any linked employee may apply for themselves
      if (!auth.canWrite && !auth.employeeId) {
        throw new Error('You do not have permission to apply for leave via the agent.');
      }
      return HRAgentService.applyLeave(eid, tenantId, {
        leaveType: String(params.leaveType || 'ANNUAL'),
        startDate: params.startDate ? new Date(String(params.startDate)) : new Date(),
        endDate: params.endDate ? new Date(String(params.endDate)) : new Date(),
        reason: String(params.reason || 'Leave request via HR Agent'),
        halfDay: Boolean(params.halfDay),
      });
    case 'GET_LEAVE_REQUESTS':
      return HRAgentService.getLeaveRequests(eid, tenantId, params);
    case 'GET_ATTENDANCE':
      return HRAgentService.getTodayAttendance(eid, tenantId);
    case 'GET_ATTENDANCE_SUMMARY': {
      const now = new Date();
      return HRAgentService.getAttendanceSummary(
        eid,
        tenantId,
        (params.month as number) || now.getMonth() + 1,
        (params.year as number) || now.getFullYear()
      );
    }
    case 'GET_PAYSLIP': {
      const now = new Date();
      return HRAgentService.getPayslip(
        eid,
        tenantId,
        (params.month as number) || now.getMonth() + 1,
        (params.year as number) || now.getFullYear()
      );
    }
    case 'GET_TAX_DETAILS':
      return HRAgentService.getTaxDetails(eid, tenantId, String(params.financialYear || '2024-25'));
    case 'GET_SALARY_STRUCTURE':
      return HRAgentService.getSalaryStructure(eid, tenantId);
    case 'SEARCH_POLICIES':
      return HRAgentService.searchPolicies(tenantId, String(params.query || ''));
    case 'REQUEST_DOCUMENT': {
      if (!auth.canWrite && !auth.employeeId) {
        throw new Error('You do not have permission to request documents via the agent.');
      }
      const docType = String(params.documentType || 'EMPLOYMENT_LETTER').toUpperCase();
      const allowed = [
        'EMPLOYMENT_LETTER',
        'SALARY_CERTIFICATE',
        'EXPERIENCE_LETTER',
        'PAYSLIP',
        'FORM_16',
      ] as const;
      const resolved = (
        allowed.includes(docType as (typeof allowed)[number]) ? docType : 'EMPLOYMENT_LETTER'
      ) as (typeof allowed)[number];
      return HRAgentService.requestDocument(eid, tenantId, resolved, params);
    }
    default:
      return null;
  }
}

function applyGuardrails(
  confidence: number,
  agentType: 'HR_AGENT'
): { allowed: boolean; message?: string } {
  const guardrails = AgenticAIProductionService.getGuardrailsConfig().find(
    (g) => g.agentType === agentType
  );
  const threshold = guardrails?.hallucination.confidenceThreshold ?? 0.75;
  if (confidence < threshold) {
    return {
      allowed: false,
      message:
        guardrails?.hallucination.uncertaintyResponse ||
        "I'm not confident enough to answer. Please contact HR.",
    };
  }
  return { allowed: true };
}

function groundResponseInLiveData(
  intent: HRAgentAction,
  actionResult: unknown,
  llmMessage: string,
  availablePolicies?: Array<{ title: string; category: string }>
): string {
  const live = formatHRActionResult(intent, actionResult, { availablePolicies });
  if (!LIVE_DATA_INTENTS.includes(intent)) {
    return llmMessage || live;
  }
  // Prefer live DB-backed text so chat always reflects current state
  return live || llmMessage;
}

export async function chatWithHRAgent(
  auth: AgentAuthContext,
  message: string,
  sessionId?: string
): Promise<AgentChatResponse> {
  const session = await getOrCreateSession(auth.tenantId, auth.userId, AGENT_TYPES.HR, sessionId);
  // Fresh retrieval every turn — no stale session-cached leave/attendance data
  let retrieval = await loadHRRetrievalContext(auth.tenantId, auth.employeeId);
  const history = await loadChatHistory(session.id);

  const systemPrompt = buildHRAgentSystemPrompt();
  const userPrompt = `${retrievalToPromptBlock({
    employee: retrieval.employee,
    leaveBalances: retrieval.leaveBalances,
    policies: retrieval.policies,
  })}\n\nUser message: ${message}`;

  let intent: HRAgentAction = 'GENERAL_QUERY';
  let params: Record<string, unknown> = {};
  let responseMessage = '';
  let suggestedActions = HR_SUGGESTED_ACTIONS;
  let confidence = 0.75;
  let provider: AgentChatResponse['provider'] = 'fallback';
  let actionResult: unknown = null;

  const llmResult = await runAgentLlm({ systemPrompt, userPrompt, history });
  if (llmResult) {
    const normalized = normalizeAgentOutput(llmResult.parsed);
    intent = normalized.intent as HRAgentAction;
    params = normalized.params;
    responseMessage = normalized.message;
    suggestedActions = normalized.suggestedActions.length
      ? normalized.suggestedActions
      : HR_SUGGESTED_ACTIONS;
    confidence = normalized.confidence;
    provider = llmResult.provider;
  } else {
    const fallback = parseHRAgentFallbackIntent(message);
    intent = fallback.intent;
    params = fallback.params;
    confidence = fallback.confidence;
    provider = 'fallback';
  }

  const guard = applyGuardrails(confidence, 'HR_AGENT');
  if (!guard.allowed && intent !== 'GENERAL_QUERY') {
    responseMessage = guard.message || responseMessage;
    intent = 'GENERAL_QUERY';
  } else if (intent !== 'GENERAL_QUERY') {
    try {
      actionResult = await executeHRAction(intent, params, auth);

      // After mutations, reload tenant data so the reply and next turn stay current
      if (MUTATING_INTENTS.includes(intent)) {
        retrieval = await loadHRRetrievalContext(auth.tenantId, auth.employeeId);
      }

      responseMessage = groundResponseInLiveData(
        intent,
        actionResult,
        responseMessage,
        retrieval.policies
      );

      // Append refreshed balances after a successful leave application
      if (intent === 'APPLY_LEAVE' && retrieval.leaveBalances?.length) {
        const balLines = retrieval.leaveBalances
          .map((b) => `- ${b.type}${b.code ? ` (${b.code})` : ''}: **${b.balance}** days`)
          .join('\n');
        responseMessage += `\n\n**Current leave balances:**\n${balLines}`;
      }
    } catch (err) {
      responseMessage = err instanceof Error ? err.message : 'Failed to execute action.';
      confidence = 0.5;
    }
  }

  if (!responseMessage) {
    responseMessage = formatHRActionResult('GENERAL_QUERY', null);
  }

  await persistChatTurn(session.id, auth.userId, message, responseMessage, intent, actionResult);

  const citations = retrievalToCitations(retrieval);

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
