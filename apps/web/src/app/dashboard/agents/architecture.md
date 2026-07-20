# Agentic AI Dashboard — Architecture

**Feature URL**: `/dashboard/agents`  
**Module**: AI & Automation → Agentic AI  
**Document version**: 1.0  
**Last updated**: 2026-07-20  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AGENTIC-AI-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AGENTIC-AI-COMPLETION.md)

---

## 1. Context

The Agentic AI module provides **three conversational autonomous agents** (HR, Recruitment, Analytics) with full LLM orchestration. Each agent follows the shared **4-layer pattern** under `lib/ai/*-agent-*`. LLM usage is primary with deterministic fallback.

**Distinct from** the HR Coaching Bot (`hr-coaching-*`, `/api/ai/coaching`), which targets HR professionals.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ Employee /   │ ─────────────► │ AuraOS Web (Next.js)                │
│ Recruiter /  │ ◄───────────── │  /dashboard/agents/*                │
│ HR Manager   │     JSON       └──────────────┬──────────────────────┘
└──────────────┘                               │ /api/agents/*
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Domain Services  │    │ LLM Providers   │
              │ AIAgentConv,   │    │ leave, attendance│    │ Groq/OpenAI/    │
              │ AIAgentMessage │    │ recruitment,     │    │ Gemini          │
              └────────────────┘    │ predictive       │    └─────────────────┘
                                    └──────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                    | Responsibility                          |
| ------------- | ----------------------------------------------------------- | --------------------------------------- |
| Presentation  | `dashboard/agents/**/*.tsx`                                 | Dashboard, chat UIs, metrics            |
| Client        | `lib/services/agents-client.ts`                             | Typed fetch to `/api/agents/*`          |
| API           | `app/api/agents/**`                                         | Auth, chat dispatch, structured actions |
| Orchestration | `lib/ai/*-agent-ai.ts`                                      | LLM orchestration per agent             |
| Domain        | `lib/services/agentic-ai/*`                                 | Action execution, domain delegation     |
| Shared AI     | `lib/ai/agent-auth.ts`, `agent-session.ts`, `llm-client.ts` | Auth, persistence, LLM                  |
| Guardrails    | `production-hardening.service.ts`                           | SLA, confidence, action limits          |

### 4-layer layout per agent

| Agent       | types                        | rules                        | retrieval                        | ai                        | fallback                        |
| ----------- | ---------------------------- | ---------------------------- | -------------------------------- | ------------------------- | ------------------------------- |
| HR          | `hr-agent-types.ts`          | `hr-agent-rules.ts`          | `hr-agent-retrieval.ts`          | `hr-agent-ai.ts`          | `hr-agent-fallback.ts`          |
| Recruitment | `recruitment-agent-types.ts` | `recruitment-agent-rules.ts` | `recruitment-agent-retrieval.ts` | `recruitment-agent-ai.ts` | `recruitment-agent-fallback.ts` |
| Analytics   | `analytics-agent-types.ts`   | `analytics-agent-rules.ts`   | `analytics-agent-retrieval.ts`   | `analytics-agent-ai.ts`   | `analytics-agent-fallback.ts`   |

---

## 4. Chat request lifecycle

```text
Agent Page
   │  POST /api/agents/hr  { action: 'chat', message, sessionId? }
   ▼
resolveAgentAuth → agents:read
   │
   ▼
getOrCreateSession(tenantId, userId, HR_AGENT, sessionId)
   │
   ▼
loadRetrievalContext(tenantId, employeeId)  — balances, policies, etc.
   │
   ▼
loadChatHistory(conversationId) → LLM history
   │
   ▼
chatCompletion (Groq → OpenAI) OR parseFallbackIntent(message)
   │
   ▼
executeAction(intent, params) → HRAgentService / domain services
   │
   ▼
applyGuardrails(confidence, actionType)
   │
   ▼
persistMessages(user + assistant, actionTaken, actionResult)
   │
   ▼
Return { sessionId, message, suggestedActions, confidence, provider }
```

---

## 5. Data model

### Prisma (existing)

```prisma
model AIAgentConversation {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String
  agentType String   // HR_AGENT | RECRUITMENT_AGENT | ANALYTICS_AGENT
  sessionId String
  metadata  Json?
  status    String   @default("ACTIVE")
  messages  AIAgentMessage[]
}

model AIAgentMessage {
  id             String @id @default(uuid())
  conversationId String
  role           String // user | assistant | system
  content        String
  actionTaken    String?
  actionResult   Json?
}
```

### Agent type constants

```typescript
export const AGENT_TYPES = {
  HR: 'HR_AGENT',
  RECRUITMENT: 'RECRUITMENT_AGENT',
  ANALYTICS: 'ANALYTICS_AGENT',
} as const;
```

---

## 6. API contracts

### Chat request

```json
POST /api/agents/hr
{
  "action": "chat",
  "message": "Check my leave balance",
  "sessionId": "optional-uuid",
  "locale": "en"
}
```

### Chat response

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "message": "You have 10 days of annual leave remaining...",
    "suggestedActions": ["Apply for leave", "View leave requests"],
    "actionExecuted": { "type": "GET_LEAVE_BALANCE", "result": [] },
    "confidence": 0.92,
    "provider": "groq"
  }
}
```

### Error response

```json
{
  "success": false,
  "error": "Unauthorized",
  "errorAr": "غير مصرح"
}
```

### Metrics summary

```json
GET /api/agents/metrics/summary
{
  "success": true,
  "data": {
    "totalTasks": 142,
    "avgResponseTimeMs": 1850,
    "successRate": 0.96,
    "activeAgents": 3,
    "byAgent": { "HR_AGENT": { "total": 80, "success": 78 } }
  }
}
```

---

## 7. Security & compliance

| Control           | Implementation                                                       |
| ----------------- | -------------------------------------------------------------------- |
| Tenant isolation  | `tenantId` from auth context only                                    |
| Permission gates  | `agents:read`, `agents:write` + role fallback                        |
| Employee scope    | HR agent: own data only; resolve `employeeId` from `Employee.userId` |
| Write supervision | Leave apply → PENDING; comms → draft unless confirmed                |
| LLM grounding     | Retrieval block in prompt; no fabricated numbers                     |
| Audit             | Write actions log to audit trail                                     |
| Bilingual errors  | All API errors include `errorAr`                                     |

---

## 8. Failure modes

| Failure                | Behavior                                            |
| ---------------------- | --------------------------------------------------- |
| LLM unavailable        | Deterministic keyword fallback                      |
| Low confidence         | Uncertainty template + human escalation suggestion  |
| Missing employee link  | Error: "Employee profile not found"                 |
| DB session failure     | Return error; do not fall back to in-memory         |
| Action guardrail block | Explain why action was blocked; suggest manual path |

---

## 9. Testing strategy

| Layer       | Focus                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Unit        | Fallback intent parsing, JSON output validation, guardrail thresholds |
| Integration | Chat turn → persist → reload history; tenant isolation                |
| UI          | Session bootstrap, send/receive, error states                         |
| Regression  | HR Coaching Bot unaffected                                            |

---

## 10. Key files

| Purpose    | Path                                         |
| ---------- | -------------------------------------------- |
| Dashboard  | `apps/web/src/app/dashboard/agents/page.tsx` |
| API routes | `apps/web/src/app/api/agents/`               |
| Framework  | `apps/web/src/lib/services/agentic-ai/`      |
| LLM layers | `apps/web/src/lib/ai/hr-agent-*.ts`, etc.    |
| Client     | `apps/web/src/lib/services/agents-client.ts` |
| Auth       | `apps/web/src/lib/ai/agent-auth.ts`          |
| Sessions   | `apps/web/src/lib/ai/agent-session.ts`       |

---

## 11. Decision log

| Decision            | Choice                     | Rationale                                       |
| ------------------- | -------------------------- | ----------------------------------------------- |
| Session storage     | `AIAgentConversation`      | Schema already exists; used by coaching/chatbot |
| LLM pattern         | Reuse `llm-client.ts`      | Proven in coaching bot                          |
| Domain delegation   | Keep `*AgentService`       | Action catalog already defined                  |
| Coaching separation | Separate routes/prompts    | Different persona and permissions               |
| Metrics source      | Aggregate `AIAgentMessage` | Honest counts vs hardcoded KPIs                 |
