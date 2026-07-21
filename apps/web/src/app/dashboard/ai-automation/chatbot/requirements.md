# Candidate Chatbot — Requirements

**Feature URL**: `/dashboard/ai-automation/chatbot`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (ReactFlow builder UI exists; miswired to HR Coaching Bot; runtime is keyword mock)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give recruiters and HR admins a **visual conversation-flow builder** (ReactFlow) that configures the **candidate-facing recruitment chatbot runtime** — answering job FAQs, guiding applications, and routing to human recruiters — **distinct from** the internal **HR Coaching Bot** (`/dashboard/ai-automation/ai-coaching-bot`), which serves HR professionals with workforce coaching and automation.

---

## 2. Current State (as of this document)

| Area                      | Reality                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI                        | ReactFlow canvas with palette (Trigger, Message, Question, Logic/API), hardcoded demo nodes/edges, Save toolbar                                                            |
| Client wiring             | Page imports `aiCoachingBot` from `ai-automation-client.ts` — **wrong product**; `getSessions()` / `sendMessage(JSON.stringify({ nodes, edges }))` hit coaching/chat paths |
| Runtime API               | `/api/ai/chatbot` — keyword intent mock (`leave`, `salary`, `attendance`); no flow execution, no tenant auth                                                               |
| Admin CRUD (orphan)       | `/api/ai-automation/chatbot` — authenticated `AIAgentConversation` list/create with `agentType: CHATBOT`; not used by builder page                                         |
| Persistence               | Schema ready: `AIAgentConversation` / `AIAgentMessage`; flow graph not stored in a dedicated model — intended in `metadata` JSON on conversation or tenant config          |
| Distinction from coaching | `ai-coaching-bot` uses `/api/ai/coaching`, jurisdiction rules, employee grounding; chatbot must **not** reuse coaching prompts, routes, or client exports                  |
| Auth                      | Target: `ai-automation:read` / `ai-automation:write`; orphan route partially applied; `/api/ai/chatbot` has none                                                           |

---

## 3. Personas & Goals

| Persona              | Goals                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| Recruiter / TA Admin | Design FAQ and application flows per job family; preview candidate experience |
| Hiring Manager       | Enable role-specific bot branches (team intro, interview prep)                |
| Candidate (runtime)  | Get accurate job/company answers, submit intent, escalate to human            |
| System Admin         | Version flows, enable/disable bot per career portal, audit conversations      |
| Compliance / Legal   | Ensure bot disclosures, no fabricated offers, PII minimization                |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                     | Acceptance criteria                                                                                                                                                 |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Product separation**          | Builder and runtime use `chatbot` client + `/api/ai/chatbot/*`; zero dependency on `aiCoachingBot` / `/api/ai/coaching`                                             |
| M2  | **Tenant-scoped flows**         | Each tenant has one or more named flows; only their flows load on save/load                                                                                         |
| M3  | **Persist flow graph**          | Save stores ReactFlow `nodes` + `edges` + node config (labels, intents, actions) in durable storage (`AIAgentConversation.metadata` or tenant `ChatbotFlow` record) |
| M4  | **Flow execution runtime**      | POST `action: chat` traverses saved graph from start node; returns bot message, suggestions, optional navigation actions                                            |
| M5  | **Conversation persistence**    | Runtime turns write `AIAgentConversation` + `AIAgentMessage` rows (`agentType` = `CANDIDATE_CHATBOT` or `CHATBOT`)                                                  |
| M6  | **Permission gates**            | `ai-automation:read` for load/preview/history; `ai-automation:write` for save/publish flow                                                                          |
| M7  | **Bilingual API errors**        | Error payloads include `error` + `errorAr`                                                                                                                          |
| M8  | **No HR employee mock intents** | Runtime must not answer payroll/leave/attendance unless explicitly configured in recruitment flow (remove demo keyword router)                                      |
| M9  | **Human escalation**            | Any flow can reach a `handoff` node that creates recruiter task or marks conversation `ESCALATED` — no autonomous hiring decisions                                  |
| M10 | **Published vs draft**          | Save draft locally; explicit **Publish** activates runtime version; candidates never see draft graphs                                                               |

### 4.2 Essential

| ID  | Requirement                            | Acceptance criteria                                                                                         |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| E1  | **Node types**                         | Support at minimum: `trigger`, `bot_message`, `user_input`, `intent_branch`, `api_action`, `handoff`, `end` |
| E2  | **Drag-and-drop palette**              | Sidebar components add typed nodes to canvas (currently decorative only)                                    |
| E3  | **Flow list / selector**               | Admin picks active flow or creates new; shows last published_at, version                                    |
| E4  | **Preview mode**                       | In-builder chat simulator executes published graph without persisting candidate PII                         |
| E5  | **Career portal embedding**            | Runtime API callable from public career portal with scoped token or anonymous session + rate limit          |
| E6  | **RAG grounding (optional LLM nodes)** | `Logic/API` nodes may call retrieval for job postings, FAQs, policies — tenant-scoped                       |
| E7  | **Session history**                    | Admin views recent candidate conversations filtered by flow, job, status                                    |
| E8  | **Audit**                              | Publish, unpublish, and handoff events emit audit log entries                                               |
| E9  | **Arabic support**                     | Bot messages and suggestions support `locale` param (`en` / `ar`) on runtime                                |

### 4.3 Good-to-Have

| ID  | Requirement                           | Acceptance criteria                                                             |
| --- | ------------------------------------- | ------------------------------------------------------------------------------- |
| G1  | **LLM fallback for free-text**        | Unmatched user text uses shared `llm-client` with recruitment-only system rules |
| G2  | **Analytics**                         | Funnel: started → completed application → handoff rate per flow                 |
| G3  | **A/B flow versions**                 | Traffic split between two published variants                                    |
| G4  | **Import/export**                     | JSON export of flow for staging → prod                                          |
| G5  | **Integration with resume screening** | Flow node triggers “upload resume” → links to screening pipeline                |
| G6  | **Voice / WhatsApp channel**          | Same graph executor, different transport adapter                                |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                                  |
| --- | ------------- | -------------------------------------------------------------------------------------------- |
| N1  | Performance   | Runtime chat turn &lt; 2s p95 (rules path); &lt; 5s with LLM node                            |
| N2  | Scalability   | Flow executor stateless; graph loaded from cache/DB per tenant                               |
| N3  | Security      | LLM and retrieval server-side only; career portal uses scoped auth                           |
| N4  | Privacy       | Minimize candidate PII in prompts/logs; retention policy on `AIAgentMessage`                 |
| N5  | Reliability   | If flow missing/unpublished, return explicit “bot unavailable” — no silent HR demo responses |
| N6  | Observability | Log sessionId, tenantId, flowVersion, nodeId; no raw message content in info logs            |
| N7  | Compliance    | Disclose AI assistant; human review for offer/salary questions                               |

---

## 6. Data Inputs (feature sources)

| Input                | Sources                                                |
| -------------------- | ------------------------------------------------------ |
| Flow definition      | Admin-built graph (nodes/edges/config)                 |
| Job context          | `JobPosting`, `JobRequisition`, career portal config   |
| FAQ / policy         | Recruitment KB, tenant career site content (retrieval) |
| Candidate session    | Anonymous or authenticated applicant id                |
| Conversation history | `AIAgentMessage` for current `sessionId`               |

Initial **v1** may execute deterministic graph traversal with template messages; LLM nodes are **optional** (Phase 3 guide).

---

## 7. API Surface (target)

| Method | Path                                   | Purpose                                                        |
| ------ | -------------------------------------- | -------------------------------------------------------------- |
| GET    | `/api/ai/chatbot/flows`                | List tenant flows (draft + published meta)                     |
| GET    | `/api/ai/chatbot/flows/[id]`           | Load flow graph for builder                                    |
| PUT    | `/api/ai/chatbot/flows/[id]`           | Save draft graph                                               |
| POST   | `/api/ai/chatbot/flows/[id]`           | `action: publish \| unpublish \| duplicate`                    |
| POST   | `/api/ai/chatbot`                      | Runtime: `action: chat \| start \| handoff \| feedback`        |
| GET    | `/api/ai/chatbot`                      | `type=config` — bot name, capabilities, active flow version    |
| GET    | `/api/ai/chatbot/sessions`             | Admin: paginated `AIAgentConversation` for chatbot agent types |
| GET    | `/api/ai/chatbot/sessions/[sessionId]` | Conversation + messages                                        |

**Deprecation note**: Converge `/api/ai-automation/chatbot` into `/api/ai/chatbot/sessions` or proxy. Remove coaching client methods from chatbot page.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. ReactFlow canvas with minimap, controls, connect-on-drag
2. Component palette (Trigger, Message, Question, Logic/API)
3. Toolbar: Settings, **Save Flow**, **Publish** (new)
4. Flow selector + version badge (new)
5. Preview drawer simulating candidate chat (new)

UX constraints:

- Loading state while fetching tenant flow
- Error banner on save/publish failure
- Clear label: “Candidate Chatbot Builder” — not “Coaching”
- Never persist demo payroll/leave nodes as production default

---

## 9. Out of Scope

- Replacing **HR Coaching Bot** (`ai-coaching-bot`) — separate product, separate rules
- General employee HR helpdesk (payroll, leave) unless recruitment admin explicitly adds nodes
- Autonomous offer generation or background checks without human approval
- Building a full Dialogflow/Botpress clone — v1 is Aura-native graph + optional LLM nodes

---

## 10. Success Metrics

| Metric                                           | Target                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Client miswire (`aiCoachingBot` on chatbot page) | 0 references after completion                                       |
| Flow persist round-trip                          | Save → reload → identical node count/edge count                     |
| Runtime mock keyword router                      | Removed from production path                                        |
| Conversations persisted                          | 100% of runtime sessions create `AIAgentConversation`               |
| Handoff SLA                                      | Median time from handoff node to recruiter acknowledgment trackable |

---

## 11. Traceability

| Product statement                       | Requirement IDs |
| --------------------------------------- | --------------- |
| GUIDE Phase 3: Candidate-facing Chatbot | M1–M5, E5–E6    |
| FEATURES-GUIDE: Recruitment AI chatbot  | M4, M9, E1      |
| GUIDE: distinct from HR Coaching Bot    | M1, M8, §9      |

---

## 12. Open Decisions

1. Flow storage: dedicated `ChatbotFlow` table vs `AIAgentConversation.metadata` + `agentType=FLOW_DEFINITION`.
2. `agentType` enum values: `CHATBOT` vs `CANDIDATE_CHATBOT` vs split `FLOW_TEMPLATE` / `RUNTIME_SESSION`.
3. Public career portal auth: anonymous session cookie vs JWT from portal SSO.
4. Whether LLM nodes share `llm-client` recruitment prompt pack or rules-only v1.
