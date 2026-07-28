# Agentic AI Dashboard — Requirements

**Feature URL**: `/dashboard/agents`  
**Module**: AI & Automation → Agentic AI  
**Document version**: 1.0  
**Last updated**: 2026-07-20  
**Status**: Spec for completion (UI exists; services mock; no LLM orchestration)  
**Related**: [GUIDE-AGENTIC-AI-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AGENTIC-AI-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Provide **autonomous conversational AI agents** for three HR domains:

1. **HR Agent** — employee self-service (leave, attendance, payroll, policies, documents)
2. **Recruitment Agent** — recruiter assistant (screening, pipeline, interviews, comms)
3. **Analytics Agent** — workforce analytics (insights, trends, anomalies, reports)

**Distinct from** the internal **HR Coaching Bot** (`/dashboard/ai-automation/ai-coaching-bot`), which serves HR professionals with workforce coaching — not employee self-service.

---

## 2. Current State (as of this document)

| Area        | Reality                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Dashboard   | Hardcoded KPIs (36,500+ tasks, 96.8% success) — not API-backed                                        |
| Agent pages | Client-side keyword intent parsing; `employeeId: 'current-user'`, `tenantId: 'tenant-1'` hardcoded    |
| API routes  | Only `GET /api/agents` uses `createProtectedRoute`; HR/Recruitment/Analytics POST routes have no auth |
| Services    | `lib/services/agentic-ai/*` — in-memory sessions/tasks, mock data, `@ts-nocheck`                      |
| Persistence | `AIAgentConversation` / `AIAgentMessage` schema ready; agents don't use them                          |
| LLM         | No orchestration; unlike `lib/ai/hr-coaching-ai.ts` and other ai-automation features                  |
| Metrics     | `/dashboard/agents/metrics` shows hardcoded request counts                                            |

---

## 3. Personas & Goals

| Persona              | Goals                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| Employee             | Check leave balance, apply leave, view payslip, search policies via natural language |
| Recruiter / TA Admin | Screen candidates, view pipeline, schedule interviews, draft communications          |
| HR Manager           | Query workforce metrics, trends, anomalies, generate reports                         |
| System Admin         | Monitor agent performance, configure guardrails, audit agent actions                 |
| Compliance / Legal   | Ensure no fabricated data, supervised write actions, audit trail                     |

---

## 4. Functional Requirements

### 4.1 Mandatory — Shared

| ID  | Requirement                | Acceptance criteria                                                                                                             |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| M0  | **Product separation**     | Agents use `/api/agents/*` and `lib/ai/*-agent-*`; zero dependency on HR Coaching Bot routes/prompts                            |
| M0a | **Tenant-scoped sessions** | All sessions/messages stored in `AIAgentConversation` with `agentType` = `HR_AGENT` \| `RECRUITMENT_AGENT` \| `ANALYTICS_AGENT` |
| M0b | **Auth on all routes**     | `agents:read` for chat/query; `agents:write` for write actions; session-resolved tenant — never trust client `tenantId`         |
| M0c | **Bilingual API errors**   | Error payloads include `error` + `errorAr`                                                                                      |
| M0d | **Unified chat API**       | `POST /api/agents/{hr\|recruitment\|analytics}` with `action: 'chat'` returns LLM-orchestrated response                         |
| M0e | **Multi-turn context**     | Chat loads prior messages from DB session for LLM history                                                                       |

### 4.2 Mandatory — HR Agent (M1–M10)

| ID  | Requirement               | Acceptance criteria                                                                             |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| M1  | **Natural-language chat** | Employee asks in plain language; agent responds with grounded data                              |
| M2  | **Leave balance**         | `GET_LEAVE_BALANCE` reads `prisma.leaveBalance` via leave service                               |
| M3  | **Leave apply**           | `APPLY_LEAVE` delegates to `LeaveService.createRequest`; status = PENDING — never auto-approves |
| M4  | **Leave requests**        | `GET_LEAVE_REQUESTS` returns tenant-scoped employee requests                                    |
| M5  | **Attendance**            | `GET_ATTENDANCE` / `GET_ATTENDANCE_SUMMARY` read real attendance data                           |
| M6  | **Payroll queries**       | `GET_PAYSLIP`, `GET_TAX_DETAILS`, `GET_SALARY_STRUCTURE` read payroll module                    |
| M7  | **Policy search**         | `SEARCH_POLICIES` returns tenant-scoped policy results                                          |
| M8  | **Document request**      | `REQUEST_DOCUMENT` creates tracked request — no auto-generation of legal docs                   |
| M9  | **LLM + fallback**        | Groq → OpenAI → Gemini → deterministic keyword fallback                                         |
| M10 | **Self-service only**     | Employee sees only their own data unless manager scope verified                                 |

### 4.3 Mandatory — Recruitment Agent (M11–M18)

| ID  | Requirement               | Acceptance criteria                                                             |
| --- | ------------------------- | ------------------------------------------------------------------------------- |
| M11 | **Natural-language chat** | Recruiter asks in plain language; agent responds with pipeline data             |
| M12 | **Candidate screening**   | `SCREEN_CANDIDATES` uses `resume-screening-ai` + `job-matching-ai` — ranks only |
| M13 | **Upcoming interviews**   | `GET_UPCOMING_INTERVIEWS` reads `Interview` table                               |
| M14 | **Pipeline stats**        | `GET_PIPELINE_STATS` aggregates candidate stages                                |
| M15 | **Open positions**        | `GET_OPEN_POSITIONS` reads `JobPosting` / requisitions                          |
| M16 | **Communications**        | `SEND_COMMUNICATION` draft-only unless `agents:write` + explicit confirm        |
| M17 | **No autonomous hiring**  | Agent never offers, rejects, or hires without human approval                    |
| M18 | **LLM + fallback**        | Same provider chain as HR agent                                                 |

### 4.4 Mandatory — Analytics Agent (M19–M26)

| ID  | Requirement               | Acceptance criteria                                         |
| --- | ------------------------- | ----------------------------------------------------------- |
| M19 | **Natural-language chat** | Manager asks analytics questions in plain language          |
| M20 | **Insight generation**    | `GENERATE_INSIGHT` uses predictive-analytics + nlp-insights |
| M21 | **Trend analysis**        | `ANALYZE_TREND` uses domain time-series / `AnalyticsCache`  |
| M22 | **Anomaly detection**     | `DETECT_ANOMALIES` uses existing anomaly paths              |
| M23 | **Report generation**     | `GENERATE_REPORT` read-only; no data mutation               |
| M24 | **Citations required**    | All numeric claims include source citations in response     |
| M25 | **No fabricated stats**   | LLM blocked from inventing numbers not in retrieval context |
| M26 | **LLM + fallback**        | Same provider chain; fallback uses keyword metric routing   |

### 4.5 Essential

| ID  | Requirement                | Acceptance criteria                                                        |
| --- | -------------------------- | -------------------------------------------------------------------------- |
| E1  | **Session bootstrap**      | Agent pages call `POST /api/agents/sessions` on load                       |
| E2  | **Real dashboard metrics** | Dashboard KPIs from `GET /api/agents/metrics/summary`                      |
| E3  | **Production guardrails**  | Confidence threshold, action limits from `production-hardening.service.ts` |
| E4  | **Audit on writes**        | Leave apply, comms send, report trigger emit audit events                  |
| E5  | **Arabic support**         | `locale` param (`en` / `ar`) on chat responses                             |
| E6  | **Suggested follow-ups**   | Chat response includes 2–4 suggested next questions                        |
| E7  | **Metrics page**           | Top actions from `actionTaken` field on messages                           |
| E8  | **Typed client**           | `agents-client.ts` for all agent API calls                                 |

### 4.6 Good-to-Have

| ID  | Requirement             | Acceptance criteria                                    |
| --- | ----------------------- | ------------------------------------------------------ |
| G1  | **Streaming responses** | SSE or chunked response for long analytics reports     |
| G2  | **Voice input**         | Browser speech-to-text on agent pages                  |
| G3  | **Mobile widget**       | Floating agent chat on ESS mobile                      |
| G4  | **Agent task queue UI** | Visual task progress for multi-step autonomous runs    |
| G5  | **Cross-agent handoff** | HR question routed to analytics agent when appropriate |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                     |
| --- | ------------- | ------------------------------------------------------------------------------- |
| N1  | Performance   | Chat turn &lt; 3s p95 (fallback); &lt; 8s with LLM                              |
| N2  | Security      | LLM and retrieval server-side only; tenant isolation on all queries             |
| N3  | Privacy       | Minimize PII in prompts; employee data scoped to authenticated user             |
| N4  | Reliability   | Graceful degradation when LLM unavailable — deterministic fallback always works |
| N5  | Observability | Log sessionId, tenantId, agentType, actionTaken; no raw message in info logs    |
| N6  | Compliance    | Disclose AI assistant; supervised autonomy for write actions                    |
| N7  | Availability  | Per EX-08 SLA tiers in `production-hardening.service.ts`                        |

---

## 6. Data Inputs

| Agent       | Sources                                                                                 |
| ----------- | --------------------------------------------------------------------------------------- |
| HR          | `leaveBalance`, `leaveRequest`, attendance records, payslip, policies, employee profile |
| Recruitment | `JobPosting`, `Candidate`, `CandidateApplication`, `Interview`                          |
| Analytics   | `Prediction`, `AnalyticsCache`, workforce metrics, performance data                     |
| All         | `AIAgentConversation`, `AIAgentMessage` for session history                             |

---

## 7. API Surface (target)

| Method | Path                                        | Purpose                                      |
| ------ | ------------------------------------------- | -------------------------------------------- |
| GET    | `/api/agents`                               | List registered agents (auth: `agents:read`) |
| GET    | `/api/agents/hr`                            | HR agent definition                          |
| POST   | `/api/agents/hr`                            | `action: chat` or structured actions         |
| GET    | `/api/agents/recruitment`                   | Recruitment agent definition                 |
| POST   | `/api/agents/recruitment`                   | `action: chat` or structured actions         |
| GET    | `/api/agents/analytics`                     | Analytics agent definition                   |
| POST   | `/api/agents/analytics`                     | `action: chat` or structured actions         |
| GET    | `/api/agents/metrics`                       | Per-agent metrics                            |
| GET    | `/api/agents/metrics/summary`               | Dashboard aggregate KPIs                     |
| POST   | `/api/agents/sessions`                      | Start session                                |
| GET    | `/api/agents/sessions`                      | List user sessions                           |
| GET    | `/api/agents/sessions/[sessionId]`          | Session detail                               |
| POST   | `/api/agents/sessions/[sessionId]/messages` | Append message (internal)                    |
| GET    | `/api/agents/tasks`                         | Task queue                                   |
| POST   | `/api/agents/tasks`                         | Create task                                  |

---

## 8. UI Requirements

1. **Dashboard** (`/dashboard/agents`) — agent cards with real stats from API
2. **HR Agent** (`/hr-agent`) — chat UI, capability examples, session-backed messages
3. **Recruitment Agent** (`/recruitment-agent`) — same chat pattern
4. **Analytics Agent** (`/analytics-agent`) — same chat pattern
5. **Metrics** (`/metrics`) — per-agent performance from API

UX constraints:

- Loading state while bootstrapping session
- Error banner on chat failure with bilingual message
- No hardcoded `tenant-1` / `current-user`
- Clear product labels — not "Coaching Bot"

---

## 9. Out of Scope

- Onboarding/compliance/payroll-anomaly autonomous agents (future §7.2.2 GAP doc)
- LangChain / Python ai-service migration
- Replacing HR Coaching Bot
- Autonomous offer generation or termination without human approval
- Building a general-purpose agent framework beyond the 3 defined agents

---

## 10. Success Metrics

| Metric                               | Target                                       |
| ------------------------------------ | -------------------------------------------- |
| Hardcoded tenant/user in agent pages | 0 references                                 |
| Unauthenticated agent API routes     | 0                                            |
| Chat sessions persisted              | 100% create `AIAgentConversation`            |
| LLM provider fallback verified       | Groq → OpenAI → fallback chain works         |
| Dashboard mock KPIs                  | Replaced with API data or honest empty state |
| HR Coaching Bot regression           | Unaffected                                   |

---

## 11. Traceability

| Product statement                     | Requirement IDs      |
| ------------------------------------- | -------------------- |
| EX-08 Agentic AI production hardening | E3, N7               |
| GAP §7.2 Agentic AI                   | M1–M26, E1–E8        |
| AI-ML Strategy Phase 4                | M0–M0e, architecture |
| Distinct from HR Coaching Bot         | M0, §9               |

---

## 12. Open Decisions

1. `employeeId` resolution: always from `Employee.userId` link vs optional override for HR admins acting on behalf.
2. Whether analytics agent exposes individual employee PII to managers or aggregated-only v1.
3. Task queue persistence: extend `AIAgentConversation.metadata` vs dedicated table.
