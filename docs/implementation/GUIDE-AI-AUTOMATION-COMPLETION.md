# AI & Automation Completion Guide

**Document Version**: 1.0
**Last Updated**: July 12, 2026
**Owner**: Platform Engineering Team
**Status**: Planning Ready
**Estimated Timeline**: 5 phases (sequenced with Analytics & Reporting)
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Analytics & Reporting Completion Guide](./GUIDE-ANALYTICS-REPORTING-COMPLETION.md)
5. [Security & Access Control Completion Guide](./GUIDE-SECURITY-ACCESS-CONTROL-COMPLETION.md)
6. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
7. Source requirements: [docs/marketing/FEATURES-GUIDE.md](../marketing/FEATURES-GUIDE.md), Section 10 "AI & Automation"

## Overview

This guide completes the **AI & Automation** module (`apps/web/src/app/dashboard/ai-automation/`) so that its five sub-domains — Recruitment AI, Predictive Analytics, Process Automation, AI Insights, and AI Coaching — are backed by real inference, real data, and real automation execution instead of mock arrays.

### Current Evidence

Confirmed via `docs/qa-reports/MODULES-SUMMARY-REPORT.md`: AI Automation is **25% complete, Quality Score 4.5/10** — "No AI/ML integration. All features mocked."

Representative mock-backed paths:

- [../../apps/web/src/app/dashboard/ai-automation/data.ts](../../apps/web/src/app/dashboard/ai-automation/data.ts)
- [../../apps/web/src/app/dashboard/ai-automation/services.ts](../../apps/web/src/app/dashboard/ai-automation/services.ts)
- [../../apps/web/src/app/dashboard/ai-automation/hooks/useAIAutomation.ts](../../apps/web/src/app/dashboard/ai-automation/hooks/useAIAutomation.ts)

Representative **real** implementation to use as the reference pattern (do not duplicate — generalize):

- [../../apps/web/src/lib/ai/hr-coaching-ai.ts](../../apps/web/src/lib/ai/hr-coaching-ai.ts) — provider orchestration (Groq → OpenAI → Gemini fallback), structured JSON output contract
- [../../apps/web/src/lib/ai/hr-coaching-retrieval.ts](../../apps/web/src/lib/ai/hr-coaching-retrieval.ts) — policy + workforce RAG grounding
- [../../apps/web/src/lib/ai/hr-coaching-rules.ts](../../apps/web/src/lib/ai/hr-coaching-rules.ts) — jurisdiction-aware system prompt
- [../../apps/web/src/lib/ai/hr-coaching-fallback.ts](../../apps/web/src/lib/ai/hr-coaching-fallback.ts) — deterministic fallback + automation catalog
- [../../apps/web/src/app/api/ai/coaching/route.ts](../../apps/web/src/app/api/ai/coaching/route.ts) — real, tenant-scoped, permission-checked route

Existing Prisma schema already provisioned but largely unused by the current pages (`packages/@aura/database/prisma/schema.prisma`):

- `PredictiveModel` / `Prediction` — for Attrition, Performance Forecasting, Leave Forecasting, Hiring Needs, Org Health, Anomaly Detection
- `AIAgentConversation` / `AIAgentMessage` — for chat-based features (Coaching, candidate Chatbot)

---

## Objective

Replace mock-backed AI Automation logic with real inference (rules-based v1, ML/LLM-backed v2), grounded in tenant data, executed through the same auth/tenant/audit conventions as the rest of the platform, without duplicating the Workflow Engine module's execution responsibilities.

---

## Functional Scope

### Recruitment AI

1. Resume Screening — document intake + structured extraction + scoring
2. Job Matching — candidate-to-requisition similarity scoring
3. Interview Scheduling — automated coordination against calendar/availability data
4. Chatbot — candidate-facing query handling (distinct from the internal HR Coaching Bot)

### Predictive Analytics

1. Attrition Prediction
2. Performance Forecasting
3. Leave Forecasting
4. Hiring Needs forecasting

### Process Automation

1. Workflow Automation (trigger layer only — execution must be delegated to the Workflow Engine module, see Risks)
2. Email Parsing
3. Document Processing
4. Auto Accruals

### AI Insights

1. Sentiment Analysis
2. Anomaly Detection
3. Org Health Score
4. L&D Recommendations

### AI Coaching

1. Coaching Bot (largest completed piece — extend, do not rebuild)
2. Career Guidance
3. Performance Tips
4. Learning Suggestions

---

## Phased Plan

### Phase 1: Shared AI Core (Prerequisite for all sub-domains)

Deliverables:

1. Extract `llm-client.ts` provider-fallback logic (already proven in the coaching bot) into a shared, non-coaching-specific module under `lib/ai/core/`
2. Define the shared 4-layer pattern every feature must follow: `*-rules.ts` (prompt/policy), `*-retrieval.ts` (grounding), `*-ai.ts` (orchestration), `*-fallback.ts` (deterministic non-LLM path)
3. Define one shared structured-output JSON contract convention for all LLM-backed features (extending the pattern in `hr-coaching-fallback.ts`)

### Phase 2: Predictive Analytics

Deliverables:

1. Rules-based inference service reading existing domain data (Attendance, Leave, Performance, Recruitment modules) into `PredictiveModel` feature vectors
2. Wire Attrition Prediction, Leave Forecasting, Performance Forecasting, Hiring Needs, Org Health Score, and Anomaly Detection to write real `Prediction` rows
3. Replace `ai-automation/data.ts` mock arrays for these features with API-backed reads

### Phase 3: Recruitment AI

Deliverables:

1. Confirm whether Recruitment module already has resume/candidate-score schema before adding new tables (coordinate with Recruitment Completion workstream — do not duplicate)
2. Resume Screening: document intake → OCR/parse → structured extraction (LLM JSON output) → candidate score
3. Job Matching: similarity scoring between parsed resume and job requirements
4. Interview Scheduling: automation against calendar availability
5. Candidate-facing Chatbot: reuse Phase 1 shared AI core, not the internal HR Coaching Bot prompt/rules

### Phase 4: Process Automation

Deliverables:

1. Confirm execution ownership boundary with the Workflow Engine module (45% complete, visual builder only, no execution engine per QA report) before building a second automation runtime
2. Email Parsing and Document Processing: structured extraction pipeline (reuse Phase 1 shared core)
3. Auto Accruals: rules-based, tied to existing Leave accrual logic — not a new LLM feature

### Phase 5: AI Coaching Completion

Deliverables:

1. Extend `hr-coaching-fallback.ts`'s automation catalog with Career Guidance, Performance Tips, and Learning Suggestions actions
2. Reconcile the two coexisting coaching data models — the original employee-centric `CoachingSession` type in `ai-automation/types.ts` (career/performance/wellbeing sessions) versus the current HR-professional-facing `HRCoachingBot` — decide and document which is authoritative before extending further
3. Ground Career Guidance / Learning Suggestions responses in real employee/skills data via the existing retrieval pattern

---

## Required Architecture

### AI Feature Request Lifecycle (chat-based features)

1. Authenticate + check `ai-automation:read`/`ai-automation:write` permission
2. Resolve tenant jurisdiction/context
3. Retrieve grounding data (policies, employee/workforce records) — tenant-scoped
4. Build system prompt from rules layer
5. Call shared LLM client with provider fallback chain
6. Parse structured JSON response; validate against contract
7. Persist conversation turn to `AIAgentConversation`/`AIAgentMessage`
8. Emit audit event for any automation action triggered
9. Return response with citations/actions/decisions

### Predictive Feature Lifecycle (non-chat features)

1. Authenticate + check permission, resolve tenant
2. Collect feature inputs from source-of-truth domain tables (not mock data)
3. Run inference against the tenant's active `PredictiveModel` (rules-based initially; pluggable for a future ML service)
4. Persist result to `Prediction` with confidence and input snapshot
5. Return prediction; downstream consumers (dashboards, alerts) read from `Prediction`, never recompute ad hoc

---

## Security Rules

1. All AI feature routes must use `withEnhancedAuth`/`authenticateWithPermissions` with `ai-automation:read`/`ai-automation:write`, matching `apps/web/src/app/api/ai/coaching/route.ts`.
2. All grounding/retrieval queries must be tenant-scoped; never let an LLM prompt include cross-tenant data.
3. Never invent or fabricate employee names/data in LLM output — enforce via system prompt (already done in `hr-coaching-rules.ts`) and validate structured output before returning to the client.
4. Any automation action that changes state (draft documents, schedule events, trigger workflows) must emit an audit event before/after execution.
5. LLM provider API keys must never be exposed to the client; all calls proxy through the server route.

---

## Testing Strategy

### Unit Tests

1. Provider fallback chain (primary down → secondary → deterministic fallback)
2. Structured JSON output parsing and validation
3. Feature-vector collection for predictive models

### Integration Tests

1. End-to-end chat turn: request → retrieval → LLM/fallback → persisted `AIAgentConversation`
2. End-to-end prediction: input collection → inference → persisted `Prediction`
3. Tenant isolation on all AI routes
4. Permission enforcement (`ai-automation:read` vs `:write`)

### Regression Tests

1. Existing HR Coaching Bot behavior unaffected by Phase 1 extraction into shared core

---

## Success Criteria

1. No AI Automation page reads from `data.ts`/`services.ts` mock arrays for the features in scope.
2. Every predictive feature writes and reads real `Prediction` rows.
3. Every chat-based feature persists real `AIAgentConversation`/`AIAgentMessage` rows.
4. Provider fallback and deterministic fallback both verified working.
5. No duplicate automation execution runtime introduced alongside the Workflow Engine module.

---

## Exit Gate

This guide is complete when:

1. All five AI & Automation sub-domains read/write real data through tenant-scoped, permission-checked routes.
2. The shared AI core is used by at least the Coaching, Predictive Analytics, and one Recruitment AI feature (proving reusability).
3. The Career/HR coaching data-model split is resolved and documented.

---

## Risks

| ID  | Risk                                                                                                                 | Impact | Mitigation                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| A1  | Workflow Automation here duplicates the separate Workflow Engine module's execution responsibility                   | High   | Resolve ownership boundary in Phase 4 before building any execution logic                         |
| A2  | Two incompatible coaching data models (employee-centric vs HR-professional-facing) diverge further if not reconciled | Medium | Explicit reconciliation task in Phase 5                                                           |
| A3  | Recruitment AI schema may duplicate tables already owned by the Recruitment Completion workstream                    | Medium | Coordinate before adding schema in Phase 3                                                        |
| A4  | LLM provider cost/latency at scale for high-volume predictive features                                               | Medium | Predictive features use rules-based inference by default; LLM reserved for chat/document features |

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Analytics & Reporting Completion Guide](./GUIDE-ANALYTICS-REPORTING-COMPLETION.md)
4. [Recruitment Completion Guide](./GUIDE-RECRUITMENT-COMPLETION.md)
5. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
