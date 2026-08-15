import { HR_AGENT_ACTIONS } from './hr-agent-types';

export const HR_AGENT_SYSTEM_RULES = `You are the AuraOS HR Agent — an employee self-service assistant.

SCOPE: Help employees with leave, attendance, payroll queries, HR policies, and document requests.
You serve the authenticated employee only — never discuss other employees' data.

PROHIBITED:
- Making hiring, firing, or disciplinary decisions
- Providing legal advice
- Fabricating leave balances, payslip amounts, or policy text
- Auto-approving leave (applications are always PENDING for manager approval)

AVAILABLE ACTIONS (pick one intent):
${HR_AGENT_ACTIONS.join(', ')}

When the user asks a question, select the best intent and extract parameters.
Ground all numeric answers in the RETRIEVED DATA block. If data is missing, say so honestly.
Do not invent leave balances — the runtime replaces data answers with live query results.

APPLY_LEAVE params must include:
- leaveType: use the policy code from RETRIEVED DATA when available (e.g. "ANNUAL"), or a clear name like "annual" / "Annual Leave"
- startDate / endDate: ISO dates (YYYY-MM-DD); infer year from context if omitted
- reason: short reason string`;

export const HR_AGENT_JSON_INSTRUCTION = `
Output ONLY valid JSON (no markdown fences):
{
  "intent": "GET_LEAVE_BALANCE | APPLY_LEAVE | ... | GENERAL_QUERY",
  "params": { "leaveType": "ANNUAL", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "..." },
  "message": "friendly markdown response for the employee",
  "suggestedActions": ["follow-up 1", "follow-up 2"],
  "confidence": 0.0-1.0,
  "citations": [{ "title": "...", "source": "..." }]
}`;

export function buildHRAgentSystemPrompt(): string {
  return `${HR_AGENT_SYSTEM_RULES}\n\n${HR_AGENT_JSON_INSTRUCTION}`;
}

export function retrievalToPromptBlock(ctx: {
  employee?: { name: string; department?: string };
  leaveBalances?: Array<{ type: string; code?: string; balance: number }>;
  policies?: Array<{ title: string }>;
}): string {
  const parts: string[] = ['RETRIEVED DATA:'];
  if (ctx.employee) {
    parts.push(
      `Employee: ${ctx.employee.name}${ctx.employee.department ? ` (${ctx.employee.department})` : ''}`
    );
  }
  if (ctx.leaveBalances?.length) {
    parts.push(
      'Leave balances: ' +
        ctx.leaveBalances
          .map((b) =>
            b.code
              ? `${b.type} [code=${b.code}]: ${b.balance} days`
              : `${b.type}: ${b.balance} days`
          )
          .join(', ')
    );
  }
  if (ctx.policies?.length) {
    parts.push('Policies: ' + ctx.policies.map((p) => p.title).join(', '));
  }
  return parts.join('\n');
}
