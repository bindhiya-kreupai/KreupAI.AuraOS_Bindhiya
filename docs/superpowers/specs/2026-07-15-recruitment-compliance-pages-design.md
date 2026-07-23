# Design: Recruitment-Compliance CRUD Pages

**Date:** 2026-07-15
**Author:** Claude (brainstorming session with boscosabujohn)
**Status:** Approved — pending implementation plan

## Problem

Five recruitment-compliance dashboard routes 404 because they have no `page.tsx`:

- `/dashboard/recruitment-compliance/cases`
- `/dashboard/recruitment-compliance/bgv`
- `/dashboard/recruitment-compliance/immigration-eligibility`
- `/dashboard/recruitment-compliance/risks`
- `/dashboard/recruitment-compliance/screening`

The **backend already exists in full** for all five — services under
`apps/web/src/lib/services/recruitment-compliance/`, API routes under
`apps/web/src/app/api/v1/recruitment-compliance/<name>/route.ts`, with Zod
validation, FSM logic, tenant scoping, and permission gating. Only the
dashboard frontends are missing. The two existing sibling pages
(`hiring-checks`, `stage-gate`) prove the pattern.

## Goal

Build 5 `'use client'` dashboard pages wired to the existing endpoints, with
full CRUD fidelity where the backend supports it, register them in the sidebar
menu, and keep the backend untouched.

## Non-Goals

- **No backend changes.** Services, API routes, Zod schemas, FSM transitions,
  and permissions are all in place and must not be modified.
- **No new automated tests** for this iteration (explicit user decision). The
  API routes retain their own existing coverage.
- No new Prisma models or migrations.
- No employee-list dropdown wiring (owner/employee inputs stay free-text)
  unless added later.

## Architecture

Each page lives at
`apps/web/src/app/dashboard/recruitment-compliance/<name>/page.tsx` and follows
the existing sibling conventions:

- `'use client'` component.
- Bilingual copy: `title`/`titleAr`, `description`/`descriptionAr`, and
  bilingual field labels.
- Calls the existing `/api/v1/recruitment-compliance/<name>` endpoint(s) via
  `fetch`, consuming the standard `{ success, data }` response envelope (and
  `{ success:false, error, details }` on validation failure).
- Standard loading / empty / error states, mirroring the table pages under
  `dashboard/accommodation-compliance/*` and `dashboard/gpssa-compliance/*`.

### Shared layout skeleton (full-CRUD pages)

1. **List section** — table hydrated from `GET`, with loading spinner, empty
   state, and error state.
2. **Create form** — inline form calling `POST`, resets + refreshes list on
   success.
3. **Row actions** — buttons calling `PATCH` where the endpoint supports state
   transitions.
4. **Reference dropdowns** — candidate and requisition pickers hydrated from
   `GET /api/v1/recruitment/candidates` and `GET /api/v1/recruitment/requisitions`.
   Fields with no list endpoint (owner/employee, free IDs) stay free-text.

## Per-Page Specification

### 1. cases — full table + create + stage transition

- **GET** `?status=&currentStage=&page=&pageSize=` → list cases. Render table.
- **POST** `{ vacancyId, candidateId, ownerId, slaDays? }` → open case.
  - `vacancyId` ← requisition dropdown; `candidateId` ← candidate dropdown;
    `ownerId` free-text; `slaDays` numeric optional.
- **PATCH** `{ caseId, nextStage }` → transition. Stages:
  `APPLIED, SCREENED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN`.
  FSM validation is server-side; surface the returned error message on 400.

### 2. risks — risk register table + raise + mitigate

- **GET** → list risk register entries. Render table (code, description,
  likelihood, impact, derived band, status).
- **POST** `{ code, description, likelihood(1-5), impact(1-5), mitigationPlan?, ownerId? }`
  → raise. Band derived server-side from L × I.
- **PATCH** `?id=` → mark mitigated (row action).

### 3. screening — bias-flagged list + record

- **GET** `?page=&pageSize=` → list bias-flagged screenings. Render table.
- **POST** `{ caseId, candidateId, score, outcome, rejectionReason?, knockoutReason?, protectedFactors?[], detail? }`
  → record. `outcome` ∈ `PASS | FAIL | KNOCKOUT`; `candidateId` ← candidate
  dropdown; `protectedFactors` multi-value input.

### 4. bgv — action form (no GET endpoint)

Three-way action switch driving `POST` with a discriminated `action`:

- `open` — `{ action:'open', caseId, candidateId, vendorName? }` → creates BGV case.
- `consent` — `{ action:'consent', bgvCaseId, consentRef }`.
- `check` — `{ action:'check', bgvCaseId, checkType, result?, discrepancyAction?, vendorRef?, evidenceUrl?, notes? }`.
  - `result` ∈ `PENDING | PASS | FAIL | DISCREPANCY | WAIVED`;
    `discrepancyAction` ∈ `ESCALATE | ACCEPT | REJECT`.
- No list view (no GET). Render the returned case/check record inline
  ("show last result"). `candidateId` ← candidate dropdown.

### 5. immigration-eligibility — evaluator form (no GET endpoint)

- **POST** `{ caseId, candidateId, countryCode, nationality, profession?, banStatus?, nocRequired?, nocReceived? }`
  → returns verdict `PENDING | ELIGIBLE | CONDITIONAL | INELIGIBLE`.
  - `banStatus` ∈ `CLEAR | BANNED | UNKNOWN`; country/nationality are 2–3 char
    ISO codes; `candidateId` ← candidate dropdown.
- No list view (no GET). Render verdict inline via a verdict panel.

### Fidelity note

`cases`, `risks`, `screening` get full table + create + actions.
`bgv` and `immigration-eligibility` have **no GET endpoint**, so they are
action/evaluator forms that display the returned record/verdict inline; a true
list view there would require a new backend endpoint (out of scope).

## Menu Registration

Add 5 entries to `packages/@aura/config/src/super-admin-menu.ts` in the
recruitment-compliance group, matching the existing `EVAL_STAGE_GATE` entry
format: `{ code, label, icon: 'recruitment', path, features: [] }`.

| code                           | label                     | path                                                        |
| ------------------------------ | ------------------------- | ----------------------------------------------------------- |
| `EVAL_RECRUITMENT_CASES`       | Recruitment Cases         | `/dashboard/recruitment-compliance/cases`                   |
| `EVAL_BGV`                     | Background Verification   | `/dashboard/recruitment-compliance/bgv`                     |
| `EVAL_IMMIGRATION_ELIGIBILITY` | Immigration Eligibility   | `/dashboard/recruitment-compliance/immigration-eligibility` |
| `EVAL_RECRUITMENT_RISKS`       | Recruitment Risk Register | `/dashboard/recruitment-compliance/risks`                   |
| `EVAL_CANDIDATE_SCREENING`     | Candidate Screening       | `/dashboard/recruitment-compliance/screening`               |

(Exact codes/labels/Arabic labels to be finalized against the group's existing
conventions during implementation.)

## Conventions & Constraints

- Multi-tenant: `tenantId` is enforced server-side from the session — the UI
  never sends it.
- Bilingual: every user-facing label carries an Arabic counterpart.
- Permissions: routes already gate on `recruitment:read` / `recruitment:write`;
  no client-side permission logic required beyond graceful 403 handling.
- Response envelope: `{ success: true, data }` on success;
  `{ success: false, error, details? }` on failure.

## Acceptance Criteria

1. All 5 routes render (no 404) and are reachable from the sidebar menu.
2. `cases`, `risks`, `screening` display their GET list and can create via POST;
   `cases` can transition stage, `risks` can mark mitigated.
3. `bgv` supports all 3 actions and shows the returned record.
4. `immigration-eligibility` shows the verdict for a submitted check.
5. Candidate and requisition pickers populate from the real endpoints.
6. All pages have loading/empty/error states and bilingual labels.
7. `next build` and type-check pass; no backend files changed.

## Open Items (deferred)

- Employee/owner dropdown wiring (currently free-text).
- List/history views for `bgv` and `immigration-eligibility` (would need new
  GET endpoints).
- Automated UI tests (deferred by decision).
