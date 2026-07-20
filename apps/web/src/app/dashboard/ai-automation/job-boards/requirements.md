# Job Boards Integration — Requirements

**Feature URL**: `/dashboard/ai-automation/job-boards`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (rich UI with inline mocks; API faked; integration service orphan)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give recruiters a **single pane** to connect external job boards, publish tenant jobs to selected platforms, sync inbound applications, and view cross-board analytics — implemented as a **connector/integration feature** (adapter orchestration), **not LLM-first**, with **feature-flagged adapters** and a **sandbox adapter** acceptable for v1 demos.

---

## 2. Current State (as of this document)

| Area          | Reality                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI            | Full dashboard: stats, postings/platforms/analytics tabs; inline `JOB_BOARDS`, `JOB_POSTINGS`, `ANALYTICS` constants                                  |
| Client        | `jobBoards.getJobBoards()` → `/api/ai/job-boards`; may merge API result but **defaults to mocks**                                                     |
| Mock API      | `/api/ai/job-boards` — random URLs, fake sync counts; no auth, no tenant                                                                              |
| Service       | `job-board-integration.service.ts` — adapter-shaped API (`configurePlatform`, `publishToPlatform`, `syncApplications`); in-memory maps; **not wired** |
| Domain data   | Prisma `JobPosting` exists (title, department, channels JSON) but page does not read it                                                               |
| Feature flags | No job-board-specific flags yet; pattern exists in `featureFlagService.ts`                                                                            |
| Auth          | Target: `ai-automation:read` / `ai-automation:write`; mock route has none                                                                             |

---

## 3. Personas & Goals

| Persona       | Goals                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Recruiter     | Post once, publish to LinkedIn/Indeed/Bayt/etc.; track per-platform status |
| TA Lead       | See applications/views/conversion by board; optimize spend                 |
| System Admin  | Connect/disconnect boards, store credentials securely, enable sandbox      |
| Finance / Ops | Cost per application by platform (when cost data available)                |
| Compliance    | Control which regions/boards are allowed per tenant                        |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                    | Acceptance criteria                                                                                                   |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped postings**     | List/create/update jobs from tenant `JobPosting` (or `JobRequisition`) — not `JOB_POSTINGS` mock array                |
| M2  | **Platform registry**          | Supported platforms: linkedin, indeed, glassdoor, naukri, bayt, gulftalent, monster, ziprecruiter (+ internal portal) |
| M3  | **Connection status**          | Each platform shows connected/disconnected from tenant integration config — not hardcoded `connected: true`           |
| M4  | **Publish orchestration**      | POST publishes job to selected boards via adapter layer; returns per-platform `published` / `pending` / `failed`      |
| M5  | **Feature-flagged adapters**   | Each real adapter gated by flag (e.g. `job_board_linkedin`); **sandbox adapter always available** for dev/demo        |
| M6  | **Permission gates**           | `ai-automation:read` for list/analytics; `ai-automation:write` for post/sync/connect                                  |
| M7  | **Persist publish runs**       | `AIRunRecord` (`runType: job_board_publish` / `job_board_sync`) with platform results                                 |
| M8  | **Bilingual API errors**       | Error payloads include `error` + `errorAr`                                                                            |
| M9  | **No fake live stats in prod** | When API fails, show error — do not silently show mock LinkedIn view counts                                           |
| M10 | **Secrets server-side**        | API keys/tokens never sent to browser; stored encrypted in tenant integration config                                  |

### 4.2 Essential

| ID  | Requirement                      | Acceptance criteria                                                                                       |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| E1  | **Post New Job flow**            | Wire header button → select job + boards → publish                                                        |
| E2  | **Sync applications**            | `syncCandidates` pulls new applications into `CandidateApplication` (or staging table)                    |
| E3  | **Per-posting platform badges**  | Status per board on each row matches last publish/sync                                                    |
| E4  | **Pause / close posting**        | Propagate status to adapters where supported                                                              |
| E5  | **Analytics tab**                | Applications-by-day and platform performance from persisted metrics, not `ANALYTICS` constant             |
| E6  | **Region-aware recommendations** | Suggest boards by job country (GCC → bayt, gulftalent) — rules not LLM                                    |
| E7  | **Connect / disconnect UI**      | OAuth or API-key setup per platform (sandbox skips real OAuth)                                            |
| E8  | **Audit**                        | Connect, publish, sync, delete emit audit events                                                          |
| E9  | **Orchestration layer**          | Implement via `lib/ai/job-boards-ai.ts` as **workflow orchestration** (sequential adapter calls), not LLM |

### 4.3 Good-to-Have

| ID  | Requirement              | Acceptance criteria                                                                        |
| --- | ------------------------ | ------------------------------------------------------------------------------------------ |
| G1  | **JD optimization**      | Optional LLM job description polish (reuse shared llm-client) — separate from publish path |
| G2  | **Auto-repost / expiry** | Renew expired external posts                                                               |
| G3  | **Budget caps**          | Per-platform spend limits                                                                  |
| G4  | **Webhook ingress**      | Boards push applications in real time                                                      |
| G5  | **Arabic job fields**    | `titleAr`, `descriptionAr` on publish payload                                              |
| G6  | **Duplicate detection**  | Same job already live on board → warn                                                      |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                     |
| --- | ------------- | ------------------------------------------------------------------------------- |
| N1  | Performance   | List view &lt; 3s; publish returns within 30s sync or async job id              |
| N2  | Scalability   | Bulk sync via background job + poll                                             |
| N3  | Security      | Encrypted credentials; adapter calls from server only                           |
| N4  | Privacy       | Candidate PII from boards handled per data governance policy                    |
| N5  | Reliability   | Partial publish success returns `results[]` per platform; UI shows mixed states |
| N6  | Observability | Log tenantId, jobId, platform, adapter, duration — no secrets                   |
| N7  | Compliance    | Regional data residency respected per adapter config                            |

---

## 6. Data Inputs (feature sources)

| Input           | Sources                                                  |
| --------------- | -------------------------------------------------------- |
| Jobs            | `JobPosting`, `JobRequisition`, recruitment module       |
| Platform config | Tenant integration settings (credentials, enabled flags) |
| Applications    | Adapter sync → `Candidate`, `CandidateApplication`       |
| Metrics         | Adapter-reported views/applications + internal applies   |
| Feature flags   | `featureFlagService` per adapter                         |

Initial **v1**: sandbox adapter + one real adapter behind flag; stats from `JobPosting` + `AIRunRecord`.

---

## 7. API Surface (target)

| Method | Path                              | Purpose                                                    |
| ------ | --------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/ai/job-boards`              | Boards connection status + summary stats                   |
| GET    | `/api/ai/job-boards/postings`     | Tenant job postings with platform statuses                 |
| POST   | `/api/ai/job-boards`              | `action: post \| sync \| analyze \| connect \| disconnect` |
| POST   | `/api/ai/job-boards/post`         | Publish job to boards (or fold into main POST)             |
| DELETE | `/api/ai/job-boards`              | Remove posting from boards (`postingId`)                   |
| GET    | `/api/ai/job-boards/runs/[runId]` | Async publish/sync status                                  |

**Deprecation note**: Replace random URL generation in current route. Client paths `/job-boards/post` and `/job-boards/sync` should match implemented routes.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. KPI strip: active jobs, applications, views, conversion
2. Tabs: Postings (filter/search), Platforms (connect cards), Analytics (charts)
3. Post New Job + Settings actions
4. Per-job platform badges with published/pending/failed icons

UX constraints:

- Remove or gate inline `JOB_BOARDS` / `JOB_POSTINGS` / `ANALYTICS` mocks behind `NODE_ENV === 'development'` only
- Loading skeletons; empty state when no jobs
- Failed platform shows error tooltip from adapter result

---

## 9. Out of Scope

- Building proprietary job board marketplaces
- LLM as primary publish path (orchestration is adapter-driven)
- Full replacement of Recruitment module requisition approval workflow
- Paid media campaign management outside job posting APIs

---

## 10. Success Metrics

| Metric                       | Target                                             |
| ---------------------------- | -------------------------------------------------- |
| Mock arrays on critical path | 0 in production                                    |
| Publish success traceability | 100% publishes create `AIRunRecord`                |
| Sandbox adapter              | Works without external credentials                 |
| Application sync             | Inbound apps create/update recruitment records     |
| Platform connection          | Connect flow stores config without client exposure |

---

## 11. Traceability

| Product statement                       | Requirement IDs |
| --------------------------------------- | --------------- |
| GUIDE Phase 3: External Recruitment     | M1–M5, E1–E2    |
| FEATURES-GUIDE: Multi job board posting | M2, M4, E3      |
| Integration service patterns            | M10, E7         |

---

## 12. Open Decisions

1. Credential storage: existing tenant `Integration` model vs new `JobBoardConnection` table.
2. Authoritative job entity: `JobPosting` vs `JobRequisition` for publish payload.
3. Sync target: create `Candidate` only vs full `CandidateApplication` pipeline.
4. Flag naming convention: `job_board_{platform}` vs grouped `job_boards_enabled`.
