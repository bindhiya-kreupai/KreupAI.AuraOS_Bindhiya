# Candidate Chatbot — Architecture

**Feature URL**: `/dashboard/ai-automation/chatbot`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

The Candidate Chatbot feature has **two surfaces**:

1. **Admin builder** (this dashboard page) — ReactFlow graph editor for recruitment conversation design.
2. **Runtime executor** — serves candidates on the career portal via `/api/ai/chatbot`.

Per the AI Automation guide, this is **distinct from the HR Coaching Bot** (`hr-coaching-*`, `/api/ai/coaching`), which targets HR professionals with workforce policy grounding and automation catalog actions.

The chatbot follows the shared **4-layer pattern** under `lib/ai/chatbot-*`. LLM usage is **optional** (free-text fallback or dedicated nodes); core traversal is **deterministic graph execution**.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ TA Admin     │ ─────────────► │ AuraOS Web (Next.js)                │
│ (builder)    │ ◄───────────── │  /dashboard/ai-automation/chatbot   │
└──────────────┘     JSON       └──────────────┬──────────────────────┘
                                               │ /api/ai/chatbot/*
┌──────────────┐     HTTPS                      │
│ Candidate    │ ─────────────────────────────►│
│ (career site)│ ◄─────────────────────────────│ Chatbot Flow Engine
└──────────────┘     JSON                       └──────────────┬──────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ JobPosting /     │    │ Optional LLM    │
              │ AIAgentConv,   │    │ Career portal    │    │ (recruitment    │
              │ AIAgentMessage │    │ content (RAG)    │    │ rules only)     │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer            | Location                                                               | Responsibility                                                      |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Presentation     | `.../chatbot/page.tsx`                                                 | ReactFlow builder, palette, save/publish                            |
| Client           | `lib/services/ai-automation-client.ts` → **`chatbot`** (new export)    | Typed fetch to `/api/ai/chatbot*` — **not** `aiCoachingBot`         |
| API              | `app/api/ai/chatbot/**`                                                | Auth, flow CRUD, runtime execution                                  |
| Legacy admin API | `app/api/ai-automation/chatbot/route.ts`                               | Conversation list/create — converge into `/api/ai/chatbot/sessions` |
| Domain AI        | `lib/ai/chatbot-*` (to introduce)                                      | Graph validation, execution, optional LLM                           |
| Persistence      | `AIAgentConversation`, `AIAgentMessage`                                | Flow metadata + runtime turns                                       |
| Shared auth      | `authenticateWithPermissions` / `withEnhancedAuth` + `ai-automation:*` | Tenant + RBAC                                                       |

### Target 4-layer layout

| File                          | Role                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `lib/ai/chatbot-types.ts`     | Flow graph DTOs, node configs, runtime request/response                      |
| `lib/ai/chatbot-rules.ts`     | Recruitment-only prompts, allowed actions, disclosure text, locale templates |
| `lib/ai/chatbot-retrieval.ts` | Job postings, FAQs, career content — tenant-scoped                           |
| `lib/ai/chatbot-ai.ts`        | Orchestration: load graph → traverse → optional LLM → persist message        |
| `lib/ai/chatbot-fallback.ts`  | Deterministic keyword/intent matching when LLM off or graph gap              |

---

## 4. Builder + runtime lifecycle

### 4.1 Admin save/publish

```text
Builder (page)
   │  PUT /api/ai/chatbot/flows/[id]  { nodes, edges, nodeData }
   ▼
Auth → ai-automation:write
   │
   ├─ validate graph (single start, no orphan nodes, allowed node types)
   ├─ store draft in flow record (metadata JSON)
   │
   └─ POST action: publish
         ├─ bump version, set publishedAt
         └─ invalidate tenant flow cache
```

### 4.2 Candidate chat turn

```text
Career portal / preview
   │  POST /api/ai/chatbot  { action: chat, sessionId, message, locale }
   ▼
Auth (portal token or anonymous rate-limited)
   │
   ├─ load published graph for tenant (+ optional jobId context)
   ├─ resolve current node from session state (stored in conversation metadata)
   ├─ chatbot-rules + retrieval enrich bot_message / api_action nodes
   ├─ optional LLM for free-text (recruitment rules only)
   ├─ persist AIAgentMessage (user + assistant)
   └─ return { response, suggestions, actions, currentNodeId }
```

**Handoff path**: `handoff` node sets conversation `status=ESCALATED`, creates recruiter notification (future workflow hook), returns human contact message.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`AIAgentConversation`** (`aura_ai_agent_conversation`)

- `tenantId`, `userId` (admin or candidate proxy)
- `agentType`: `CHATBOT` | `CANDIDATE_CHATBOT` | `CHATBOT_FLOW` (pick one set)
- `sessionId`: runtime session key
- `metadata`: JSON — `{ flowId, flowVersion, currentNodeId, graph?, published? }`
- `status`: `ACTIVE` | `ESCALATED` | `CLOSED`

**`AIAgentMessage`**

- `conversationId`, `role` (`user` | `assistant` | `system`)
- `content`, optional `actionTaken` / `actionResult` for API nodes

### 5.2 Logical flow payload (metadata / API)

```ts
type ChatbotFlowGraph = {
  id: string;
  name: string;
  version: number;
  status: 'draft' | 'published';
  nodes: ReactFlowNode<ChatbotNodeData>[];
  edges: ReactFlowEdge[];
  publishedAt?: string;
};

type ChatbotNodeData = {
  type:
    | 'trigger'
    | 'bot_message'
    | 'user_input'
    | 'intent_branch'
    | 'api_action'
    | 'handoff'
    | 'end';
  label: string;
  message?: { en: string; ar?: string };
  intents?: { key: string; edgeId: string }[];
  apiAction?: 'fetch_job' | 'create_application' | 'schedule_callback';
};
```

### 5.3 Runtime response

```ts
type ChatbotChatResponse = {
  messageId: string;
  response: string;
  suggestions: string[];
  actions: { type: 'navigate' | 'upload' | 'handoff'; label: string; path?: string }[];
  sessionId: string;
  flowVersion: number;
};
```

---

## 6. Execution architecture (v1)

### 6.1 Graph traversal

1. Start at single `trigger` / `input` node.
2. On `bot_message`: emit text → follow default edge.
3. On `user_input` / `intent_branch`: match user text to intent keys (rules) or LLM classification → follow labeled edge.
4. On `api_action`: call internal retrieval/handler → store result in session context → continue.
5. On `handoff` / `end`: terminal states.

### 6.2 Current miswire (to remove)

| Today                                                                | Target                                       |
| -------------------------------------------------------------------- | -------------------------------------------- |
| `page.tsx` → `aiCoachingBot.getSessions()`                           | `chatbot.getFlow()`                          |
| `sendMessage(JSON.stringify({ nodes, edges }))` → `/api/ai/coaching` | `chatbot.saveFlow({ nodes, edges })`         |
| `/api/ai/chatbot` keyword HR demo                                    | Flow executor or explicit 503 if unpublished |

---

## 7. API design

### 7.1 Flow CRUD

**GET `/api/ai/chatbot/flows`**

```json
{
  "success": true,
  "data": {
    "flows": [
      {
        "id": "flow-1",
        "name": "Default Career Bot",
        "version": 3,
        "status": "published",
        "updatedAt": "..."
      }
    ]
  }
}
```

**POST `/api/ai/chatbot`** (runtime)

| `action`   | Behavior                                      |
| ---------- | --------------------------------------------- |
| `start`    | Create session + first bot message from graph |
| `chat`     | Advance graph with user message               |
| `handoff`  | Escalate to human                             |
| `feedback` | Thumbs on message id                          |

### 7.2 Auth & tenancy

```text
Builder routes:
  authenticateWithPermissions → ai-automation:read | :write
  tenantId from session only

Runtime routes:
  portal scoped token OR anonymous + rate limit
  tenantId from token / career portal config — never from unchecked body
```

---

## 8. UI composition

```text
ChatbotBuilderPage
├── Toolbar (Save, Publish, Settings, flow selector)
├── Palette (node types — wire drag-drop)
├── ReactFlow canvas (nodes/edges state)
└── Preview drawer (runtime simulator)
```

Styling: existing Aura dashboard tokens; ReactFlow styles already imported.

---

## 9. Security & compliance controls

| Control           | Implementation                                  |
| ----------------- | ----------------------------------------------- |
| RBAC              | `ai-automation:read` / `:write` on builder      |
| Product isolation | No import of `hr-coaching-*` in chatbot package |
| Tenant isolation  | Flows and conversations scoped by `tenantId`    |
| Candidate PII     | Retention limits; redact in logs                |
| AI disclosure     | First `bot_message` includes assistant identity |
| Audit             | Publish + handoff → audit log                   |

---

## 10. Performance strategy

1. **Published graph cache**: Redis key `chatbot:flow:{tenantId}:published` with TTL.
2. **Runtime**: In-memory graph index per request; no full LLM on every node.
3. **Preview**: Same executor, `persist: false` flag.

---

## 11. Failure modes

| Failure                         | Behavior                                               |
| ------------------------------- | ------------------------------------------------------ |
| Unauthenticated (builder)       | 401 bilingual                                          |
| No published flow               | 503 + “Chatbot not configured”                         |
| Invalid graph on publish        | 400 with validation errors                             |
| LLM unavailable                 | `chatbot-fallback` intent match; never HR payroll demo |
| Missing job context on API node | Skip with user-visible “information unavailable”       |

---

## 12. Migration / convergence plan

| Step | Work                                                                   |
| ---- | ---------------------------------------------------------------------- |
| 1    | Add `lib/ai/chatbot-*` types + graph validator                         |
| 2    | Create `chatbot` client export; remove `aiCoachingBot` from `page.tsx` |
| 3    | Implement `/api/ai/chatbot/flows/*` persist + publish                  |
| 4    | Replace keyword mock in `/api/ai/chatbot` with graph executor          |
| 5    | Wire runtime persistence to `AIAgentConversation` / `AIAgentMessage`   |
| 6    | Proxy `/api/ai-automation/chatbot` → sessions API or deprecate         |
| 7    | Add preview panel + career portal embed contract                       |

---

## 13. Testing strategy

| Layer       | Cases                                                            |
| ----------- | ---------------------------------------------------------------- |
| Unit        | Graph validation, intent routing, publish version bump           |
| Integration | Save/load round-trip, tenant isolation, message persist          |
| UI          | Save → reload canvas; miswire regression (no coaching API calls) |
| Runtime     | Full path trigger → application handoff                          |

---

## 14. Key files (today)

| Path                                           | Role                                                 |
| ---------------------------------------------- | ---------------------------------------------------- |
| `.../chatbot/page.tsx`                         | ReactFlow builder (miswired to coaching client)      |
| `lib/services/ai-automation-client.ts`         | `aiCoachingBot` wrongly used; needs `chatbot` export |
| `app/api/ai/chatbot/route.ts`                  | Keyword HR mock runtime                              |
| `app/api/ai-automation/chatbot/route.ts`       | Auth conversation CRUD (orphan)                      |
| `app/dashboard/ai-automation/ai-coaching-bot/` | **Separate product** — do not merge                  |
| `packages/@aura/database/prisma/schema.prisma` | `AIAgentConversation`, `AIAgentMessage`              |

---

## 15. Decision log

| Decision          | Choice                           | Rationale                                  |
| ----------------- | -------------------------------- | ------------------------------------------ |
| Primary execution | Deterministic graph first        | Predictable candidate UX; GUIDE Phase 3    |
| LLM               | Optional per-node / fallback     | Cost control; coaching rules must not leak |
| Persistence       | `AIAgentConversation` + messages | Schema already provisioned                 |
| API base          | `/api/ai/chatbot`                | Aligns with recruitment AI routes          |
| Builder tech      | Keep ReactFlow                   | UI already invested                        |
