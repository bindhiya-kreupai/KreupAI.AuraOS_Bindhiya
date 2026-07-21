# Agentic AI Completion Guide

**Document Version**: 1.0  
**Last Updated**: July 20, 2026  
**Owner**: Platform Engineering Team  
**Status**: Active Execution Guide  
**Priority**: High

---

## Quick Navigation

1. [requirements.md](../../apps/web/src/app/dashboard/agents/requirements.md)
2. [architecture.md](../../apps/web/src/app/dashboard/agents/architecture.md)
3. [GUIDE-AI-AUTOMATION-COMPLETION.md](./GUIDE-AI-AUTOMATION-COMPLETION.md)
4. [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md)

---

## Overview

Complete the **Agentic AI Dashboard** (`/dashboard/agents`) so HR, Recruitment, and Analytics agents are backed by real inference, real tenant data, persisted sessions, and production guardrails — replacing mock arrays and in-memory state.

### Current Evidence

- QA: Agents module mock/non-functional (`docs/qa-reports/QA_ASSESSMENT.md`)
- Services: `lib/services/agentic-ai/*` with `@ts-nocheck` and hardcoded mock data
- Only `GET /api/agents` is authenticated

### Reference Pattern

Use the HR Coaching Bot and ai-automation 4-layer pattern:

- `lib/ai/hr-coaching-ai.ts` — LLM orchestration
- `lib/ai/hr-coaching-retrieval.ts` — tenant-scoped grounding
- `lib/ai/hr-coaching-rules.ts` — system prompts
- `lib/ai/hr-coaching-fallback.ts` — deterministic fallback
- `lib/ai/llm-client.ts` — provider chain

---

## Objective

Replace mock-backed agent logic with full LLM orchestration (Groq → OpenAI → Gemini → fallback), grounded in tenant data, executed through auth/tenant/audit conventions, without duplicating HR Coaching Bot or Workflow Engine responsibilities.

---

## Phased Plan

### Phase 1: Shared Foundation

**Deliverables:**

- [ ] `lib/ai/agent-types.ts` — shared types, agent type constants
- [ ] `lib/ai/agent-auth.ts` — `resolveAgentAuth`, `canReadAgents`, `canWriteAgents`
- [ ] `lib/ai/agent-session.ts` — DB-backed session/message CRUD
- [ ] Auth on all `/api/agents/*` routes
- [ ] Bilingual error responses
- [ ] Unified `action: 'chat'` on HR/Recruitment/Analytics POST routes

**Acceptance:**

- No route accepts client-supplied `tenantId`
- Sessions persist to `AIAgentConversation`

### Phase 2: HR Agent — Full LLM

**Deliverables:**

- [ ] `lib/ai/hr-agent-types.ts`
- [ ] `lib/ai/hr-agent-rules.ts`
- [ ] `lib/ai/hr-agent-retrieval.ts`
- [ ] `lib/ai/hr-agent-fallback.ts`
- [ ] `lib/ai/hr-agent-ai.ts`
- [ ] Wire `HRAgentService` to leave/attendance/payroll services
- [ ] Update `hr-agent/page.tsx` to use `agents-client.ts`

**Acceptance:**

- "Check my leave balance" returns real `leaveBalance` data or empty state
- Leave apply creates PENDING request via `LeaveService.createRequest`

### Phase 3: Recruitment Agent — Full LLM

**Deliverables:**

- [ ] `lib/ai/recruitment-agent-*.ts` (5 files)
- [ ] Wire `RecruitmentAgentService` to Prisma recruitment models
- [ ] Update `recruitment-agent/page.tsx`

**Acceptance:**

- Pipeline stats from real `Candidate` / `JobPosting` data
- Screening delegates to ai-automation libs when available

### Phase 4: Analytics Agent — Full LLM

**Deliverables:**

- [ ] `lib/ai/analytics-agent-*.ts` (5 files)
- [ ] Wire `AnalyticsAgentService` to predictive analytics
- [ ] Update `analytics-agent/page.tsx`

**Acceptance:**

- Insights include citations from retrieval context
- No fabricated statistics in fallback path

### Phase 5: Dashboard, Metrics, Hardening

**Deliverables:**

- [ ] `lib/services/agents-client.ts`
- [ ] `GET /api/agents/metrics/summary`
- [ ] Dashboard + metrics pages use real API data
- [ ] Integrate `production-hardening.service.ts` guardrails
- [ ] Remove `@ts-nocheck` where feasible

**Acceptance:**

- Zero hardcoded KPI numbers on dashboard
- Guardrails block low-confidence write actions

---

## Required Architecture

### Agent Chat Lifecycle

1. Authenticate + check `agents:read` / `agents:write`
2. Resolve tenant/user/employeeId from session
3. Load/create DB session
4. Retrieve grounding data (tenant-scoped)
5. Build system prompt from rules layer
6. Call LLM with history + structured JSON contract
7. Parse intent; execute domain action via `*AgentService`
8. Apply production guardrails
9. Persist conversation turn
10. Return response with suggestions

---

## Security Rules

1. All agent routes use `createProtectedRoute` or `resolveAgentAuth`
2. Never trust client `tenantId` or `employeeId` for cross-tenant access
3. HR agent: employee sees own data only
4. Write actions require `agents:write` and pass guardrails
5. LLM keys server-side only
6. Distinct from HR Coaching Bot — no shared prompts or routes

---

## File Checklist

### New files

```
apps/web/src/lib/ai/agent-types.ts
apps/web/src/lib/ai/agent-auth.ts
apps/web/src/lib/ai/agent-session.ts
apps/web/src/lib/ai/hr-agent-types.ts
apps/web/src/lib/ai/hr-agent-rules.ts
apps/web/src/lib/ai/hr-agent-retrieval.ts
apps/web/src/lib/ai/hr-agent-fallback.ts
apps/web/src/lib/ai/hr-agent-ai.ts
apps/web/src/lib/ai/recruitment-agent-types.ts
apps/web/src/lib/ai/recruitment-agent-rules.ts
apps/web/src/lib/ai/recruitment-agent-retrieval.ts
apps/web/src/lib/ai/recruitment-agent-fallback.ts
apps/web/src/lib/ai/recruitment-agent-ai.ts
apps/web/src/lib/ai/analytics-agent-types.ts
apps/web/src/lib/ai/analytics-agent-rules.ts
apps/web/src/lib/ai/analytics-agent-retrieval.ts
apps/web/src/lib/ai/analytics-agent-fallback.ts
apps/web/src/lib/ai/analytics-agent-ai.ts
apps/web/src/lib/services/agents-client.ts
apps/web/src/app/api/agents/metrics/summary/route.ts
```

### Modified files

```
apps/web/src/app/api/agents/hr/route.ts
apps/web/src/app/api/agents/recruitment/route.ts
apps/web/src/app/api/agents/analytics/route.ts
apps/web/src/app/api/agents/sessions/route.ts
apps/web/src/app/api/agents/sessions/[sessionId]/route.ts
apps/web/src/app/api/agents/sessions/[sessionId]/messages/route.ts
apps/web/src/app/api/agents/metrics/route.ts
apps/web/src/app/api/agents/tasks/route.ts
apps/web/src/app/api/agents/tasks/[taskId]/route.ts
apps/web/src/lib/services/agentic-ai/hr-agent.service.ts
apps/web/src/lib/services/agentic-ai/recruitment-agent.service.ts
apps/web/src/lib/services/agentic-ai/analytics-agent.service.ts
apps/web/src/app/dashboard/agents/page.tsx
apps/web/src/app/dashboard/agents/hr-agent/page.tsx
apps/web/src/app/dashboard/agents/recruitment-agent/page.tsx
apps/web/src/app/dashboard/agents/analytics-agent/page.tsx
apps/web/src/app/dashboard/agents/metrics/page.tsx
```

---

## Testing Strategy

### Unit Tests

- Fallback intent parsing per agent
- Structured JSON output validation
- Guardrail confidence thresholds

### Integration Tests

- Chat turn → retrieval → LLM/fallback → persisted messages
- Tenant isolation on all agent routes
- Permission enforcement

### Regression

- HR Coaching Bot behavior unaffected
- ai-automation features unaffected

---

## Success Criteria

1. All 3 agent pages perform multi-turn LLM chat backed by real tenant data
2. Zero hardcoded `tenant-1` / `current-user` in agent pages
3. All `/api/agents/*` routes authenticated and tenant-scoped
4. Sessions persisted in `AIAgentConversation` / `AIAgentMessage`
5. Dashboard and metrics show real aggregated stats
6. Bilingual API errors on all failure paths
7. HR Coaching Bot remains independent

---

## Exit Gate

Complete when all Phase 1–5 acceptance criteria pass and tracker updated.

---

## Related Guides

1. [AI Automation Completion](./GUIDE-AI-AUTOMATION-COMPLETION.md)
2. [Recruitment Completion](./GUIDE-RECRUITMENT-COMPLETION.md)
3. [Analytics & Reporting Completion](./GUIDE-ANALYTICS-REPORTING-COMPLETION.md)
