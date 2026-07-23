# Job Boards Integration — Architecture

**Feature URL**: `/dashboard/ai-automation/job-boards`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Job Boards Integration is a **connector/orchestration feature**, not LLM-first. Per the AI Automation guide’s 4-layer pattern, **`job-boards-ai.ts` means orchestration** (validate → select adapters → publish/sync → aggregate results → persist), with optional LLM only for **job description optimization** (good-to-have).

Adapters are **feature-flagged**; a **sandbox adapter** provides deterministic success/failure for demos without external API keys.

Existing **`job-board-integration.service.ts`** is the logical starting point but must move into **`lib/ai/job-boards-*`** and connect to Prisma + auth.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ Recruiter    │ ─────────────► │ AuraOS Web (Next.js)                │
│              │ ◄───────────── │  /dashboard/ai-automation/job-boards│
└──────────────┘     JSON       └──────────────┬──────────────────────┘
                                               │ /api/ai/job-boards/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Job Boards Orchestrator             │
                                │ (adapters + feature flags)          │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ JobPosting,      │    │ External boards │
              │ JobPosting,    │    │ CandidateApp     │    │ LinkedIn, Indeed│
              │ AIRunRecord    │    │ Integration cfg  │    │ Bayt, … (flags) │
              └────────────────┘    └──────────────────┘    └─────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Sandbox adapter │
                                │ (always on)     │
                                └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer          | Location                                                                 | Responsibility                             |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| Presentation   | `.../job-boards/page.tsx`                                                | Stats, tabs, postings list, platform cards |
| Client         | `lib/services/ai-automation-client.ts` → `jobBoards`                     | Typed fetch to `/api/ai/job-boards*`       |
| API            | `app/api/ai/job-boards/**`                                               | Auth, action dispatch                      |
| Legacy service | `lib/services/ai/job-board-integration.service.ts`                       | Adapter logic — refactor into lib/ai       |
| Target AI lib  | `lib/ai/job-boards-*`                                                    | Orchestration + rules (not LLM core)       |
| Feature flags  | `services/featureFlagService.ts`                                         | Per-adapter gates                          |
| Persistence    | `JobPosting.channels` JSON, `AIRunRecord`, integration credentials store | Publish/sync audit                         |
| Shared auth    | `withEnhancedAuth` + `ai-automation:*`                                   | Tenant + RBAC                              |

### Target 4-layer layout

| File                             | Role                                                            |
| -------------------------------- | --------------------------------------------------------------- |
| `lib/ai/job-boards-types.ts`     | Platform enums, posting DTOs, publish/sync results              |
| `lib/ai/job-boards-rules.ts`     | Region→platform recommendations, validation, status transitions |
| `lib/ai/job-boards-retrieval.ts` | Tenant jobs, connection config, historical metrics              |
| `lib/ai/job-boards-ai.ts`        | **Orchestrator**: post/sync/connect flows across adapters       |
| `lib/ai/job-boards-fallback.ts`  | Sandbox adapter + degraded read when all adapters off           |

Note: **`job-boards-ai.ts` is not an LLM module by default** — it coordinates I/O. Optional JD optimization may call `llm-client` from a separate helper.

---

## 4. Publish / sync lifecycle

```text
Client (page)
   │  POST /api/ai/job-boards  { action: post, jobId, boards: ['linkedin','bayt'] }
   ▼
Auth → ai-automation:write, tenantId
   │
   ├─ retrieval: JobPosting, platform configs, feature flags
   ├─ rules: validate job fields, filter boards by region + flags
   ├─ for each board:
   │     ├─ if flag off → skip or sandbox if requested
   │     └─ adapter.publish(job) → PlatformResult
   ├─ update JobPosting.channels JSON with platform statuses
   ├─ persist AIRunRecord (job_board_publish)
   └─ respond: { postingId, results[], totalReach? }

Sync path:
   POST { action: sync, jobId? }
   → adapters.fetchApplications → upsert CandidateApplication
   → AIRunRecord (job_board_sync)
```

---

## 5. Data model

### 5.1 Existing Prisma

**`JobPosting`** (`aura_job_posting`)

- `title`, `department`, `location`, `type`, `status`, `description`
- `views`, `clicks`, `applies`
- `channels`: JSON — target for per-platform `{ platform, status, externalId, url, lastSyncedAt }`

**`CandidateApplication`** / **`Candidate`**

- Inbound sync creates/links applications with `source` = platform id

**`AIRunRecord`**

- `runType`: `job_board_publish` | `job_board_sync`
- `inputContext`: `{ jobId, boards[] }`
- `output`: `{ results: PlatformResult[], newApplications? }`

### 5.2 Platform connection (logical)

```ts
type JobBoardConnection = {
  platform: JobBoardPlatform;
  enabled: boolean;
  sandbox: boolean;
  credentialsRef: string; // vault key — not raw secret in JSON
  lastSyncAt?: string;
  regions: string[];
};
```

Store in tenant integration config table or encrypted JSON blob.

### 5.3 Adapter interface

```ts
interface JobBoardAdapter {
  platform: JobBoardPlatform;
  publish(job: NormalizedJobPosting, ctx: AdapterContext): Promise<PlatformResult>;
  update?(externalId: string, job: NormalizedJobPosting): Promise<PlatformResult>;
  remove?(externalId: string): Promise<PlatformResult>;
  syncApplications?(externalId: string): Promise<InboundApplication[]>;
}
```

**Sandbox adapter**: implements interface with deterministic IDs/URLs, no network.

---

## 6. Feature flags

| Flag (proposed)      | Controls                                              |
| -------------------- | ----------------------------------------------------- |
| `job_board_sandbox`  | Default on in non-prod; available everywhere for demo |
| `job_board_linkedin` | LinkedIn adapter                                      |
| `job_board_indeed`   | Indeed adapter                                        |
| `job_board_bayt`     | Bayt adapter                                          |
| …                    | One flag per external platform                        |

Orchestrator logic:

```text
if !flagEnabled(platform) && !useSandbox:
  return { platform, success: false, error: 'Platform disabled' }
if sandboxMode || !credentials:
  use SandboxAdapter
else:
  use LiveAdapter
```

---

## 7. API design

### 7.1 GET `/api/ai/job-boards`

```json
{
  "success": true,
  "data": {
    "boards": [
      {
        "platform": "linkedin",
        "name": "LinkedIn",
        "connected": true,
        "sandbox": false,
        "stats": { "activeJobs": 5, "applications": 40, "views": 900 }
      }
    ],
    "summary": {
      "activeJobs": 12,
      "totalApplications": 487,
      "totalViews": 8120,
      "conversionRate": 6.0
    },
    "postings": []
  }
}
```

Split `GET /postings` if payload too large.

### 7.2 POST actions

| `action`     | Behavior                          |
| ------------ | --------------------------------- |
| `post`       | Publish to boards                 |
| `sync`       | Pull applications                 |
| `analyze`    | Platform performance aggregates   |
| `connect`    | Save credentials / OAuth callback |
| `disconnect` | Revoke + mark disconnected        |
| `optimize`   | Optional LLM JD suggestions (G1)  |

### 7.3 DELETE

Remove external posting; update `channels` JSON.

### 7.4 Auth & tenancy

```text
withEnhancedAuth
  → tenantId from session
  → JobPosting queries scoped to tenant
  → credentials never returned to client (only connected: true/false)
```

Add bilingual errors (current route English-only).

---

## 8. UI composition

```text
JobBoardsPage
├── Header (Post New Job, Settings)
├── KPI cards ← summary from API
├── Tabs
│   ├── Postings (filtered list, platform badges)
│   ├── Platforms (connect cards ← boards[])
│   └── Analytics (charts ← analyze endpoint)
└── Modals: PostJob, ConnectPlatform
```

Remove production dependency on inline constants at lines 82–250 of `page.tsx`.

---

## 9. Security & compliance controls

| Control          | Implementation                            |
| ---------------- | ----------------------------------------- |
| RBAC             | `ai-automation:read` / `:write`           |
| Secrets          | Server-only; encrypted at rest            |
| Tenant isolation | Jobs + credentials per tenant             |
| Sandbox          | Clearly labeled in UI when sandbox active |
| Audit            | Connect/publish/sync/delete               |
| PII              | Govern synced candidate data              |

---

## 10. Performance strategy

1. **Publish**: Parallel adapter calls with concurrency cap (e.g. 3).
2. **Sync**: Async job for large boards; poll `runs/[runId]`.
3. **Read**: Aggregate stats from DB + last sync snapshot; cache summary 60s Redis optional.

---

## 11. Failure modes

| Failure               | Behavior                                                |
| --------------------- | ------------------------------------------------------- |
| Adapter timeout       | Platform result `failed` with error; others may succeed |
| Invalid credentials   | Connect fails bilingual; platform marked disconnected   |
| Job validation fail   | 400 before any adapter call                             |
| All adapters disabled | Sandbox offer or explicit error                         |
| Sync partial          | Return `{ synced, errors[] }`                           |

---

## 12. Migration / convergence plan

| Step | Work                                                      |
| ---- | --------------------------------------------------------- |
| 1    | Add `lib/ai/job-boards-*` types + sandbox adapter         |
| 2    | Harden `/api/ai/job-boards` with auth + bilingual errors  |
| 3    | Wire GET to `JobPosting` + connection config              |
| 4    | Implement post/sync orchestration + `AIRunRecord`         |
| 5    | Add feature flags per platform                            |
| 6    | Replace page mocks with API-only data                     |
| 7    | Refactor `job-board-integration.service.ts` into adapters |
| 8    | Optional: LLM JD optimize behind separate action          |

---

## 13. Testing strategy

| Layer            | Cases                                                           |
| ---------------- | --------------------------------------------------------------- |
| Unit             | Region recommendations, flag gating, sandbox deterministic URLs |
| Integration      | Publish partial success, channels JSON update, tenant isolation |
| Adapter contract | Mock HTTP for one live adapter                                  |
| UI               | No mock stats when API 503; connect flow                        |

---

## 14. Key files (today)

| Path                                               | Role                           |
| -------------------------------------------------- | ------------------------------ |
| `.../job-boards/page.tsx`                          | UI + inline mocks              |
| `lib/services/ai-automation-client.ts`             | `jobBoards` client             |
| `app/api/ai/job-boards/route.ts`                   | Fake random URLs               |
| `lib/services/ai/job-board-integration.service.ts` | In-memory integration (orphan) |
| `services/featureFlagService.ts`                   | Flag patterns to extend        |
| `packages/@aura/database/prisma/schema.prisma`     | `JobPosting`                   |

---

## 15. Decision log

| Decision           | Choice                              | Rationale                                |
| ------------------ | ----------------------------------- | ---------------------------------------- |
| Primary pattern    | Adapter orchestration               | User requirement; not LLM-first          |
| Sandbox adapter    | Always available                    | Demo + dev without credentials           |
| Real adapters      | Feature-flagged                     | Controlled rollout                       |
| `job-boards-ai.ts` | Orchestrator naming                 | Aligns with 4-layer folder; LLM optional |
| Persistence        | `JobPosting.channels` + AIRunRecord | Avoid new table v1                       |
| API base           | `/api/ai/job-boards`                | Recruitment AI route family              |
