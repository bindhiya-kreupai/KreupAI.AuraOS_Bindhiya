# Recruitment Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Status**: Planning Complete — Ready for Copilot Handoff
**Workstream**: Recruitment Completion (Weeks 12–13)
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Recruitment Completion Guide](./GUIDE-RECRUITMENT-COMPLETION.md)

---

## Executive Assessment

**Verdict: Second-strongest backend foundation** — comparable to Attendance. The Prisma schema (16 models), API routes (18 files, all real Prisma), and 3 backend AI services (2,909 lines) are production-ready. The gap is concentrated in **2 frontend services** with mock fallback patterns and **several alignment mismatches** between frontend and backend contracts.

### What Exists

| Layer | Count | Status |
|-------|-------|--------|
| Prisma models | 16 | REAL — full relationships, indexes |
| API routes (`/api/v1/recruitment/*`) | 18 files | REAL — all use `prisma.*` with `withEnhancedAuth` |
| Backend AI services | 3 (2,909 LOC) | REAL — interview-scheduler, job-board-integration, recruitment-agent |
| Dashboard service layer | 1 (services.ts) | REAL — APIClient pattern |
| Frontend services (mock-backed) | 2 | MOCK FALLBACK — `recruitmentService.ts`, `jobDistributionService.ts` |
| Dashboard pages | 33 files | UI complete |
| Components | 28+ | UI complete |

### What Needs Work

1. **`recruitmentService.ts`** (1,052 lines) — 7 methods try API then fall back to mock arrays (5 job postings, 16 candidates, mock analytics). Once API alignment is fixed, mocks become dead code.
2. **`jobDistributionService.ts`** (829 lines) — ENTIRELY mock. No real API calls at all. 8 mock job boards, simulated delays.
3. **Endpoint URL mismatches** — frontend calls routes that don't exist at the expected paths.
4. **Stage enum mismatches** — frontend uses lowercase (`applied`, `phone_screen`), backend uses uppercase (`APPLIED`, `PHONE_INTERVIEW`).
5. **Missing tenantId scoping** — candidate and job API routes don't filter by tenant.
6. **Stats route** proxies to analytics-service via ServiceProxy — needs real query implementation.

---

## Scope Confirmation

### In-Scope (Weeks 12–13)

1. Fix endpoint URL alignment between `recruitmentService.ts` and actual API routes
2. Fix stage enum mapping (frontend lowercase ↔ backend uppercase)
3. Add tenantId scoping to all recruitment API routes
4. Eliminate mock fallback data in `recruitmentService.ts`
5. Wire `jobDistributionService.ts` to real API endpoints (or create thin API routes for job board config)
6. Implement real recruitment analytics query (replace ServiceProxy stub in stats route)
7. Verify interview scheduling, feedback, and offer flows end-to-end
8. Verify resume parsing service boundary (stub is acceptable — parser is replaceable)

### Deferred (Not Weeks 12–13)

1. External job board OAuth integration (LinkedIn, Indeed, Bayt, Naukri API keys)
2. AI resume parsing engine (keep behind service boundary)
3. Video interview recording backend
4. Background check provider integration (Checkr, HireRight)
5. Referral reward payment processing
6. DocuSign e-signature production integration
7. AI candidate scoring ML models
8. Career site public deployment

---

## Critical Findings

### Finding 1: Endpoint URL Mismatches

| Frontend Method | Calls | Actual Route | HTTP Method |
|----------------|-------|--------------|-------------|
| `moveCandidateStage()` | `/v1/recruitment/candidates/${id}/move-stage` (POST) | `/v1/recruitment/candidates/[id]/stage` (PUT) | Mismatch |
| `getRecruitmentAnalytics()` | `/v1/recruitment/analytics` | `/v1/recruitment/stats` (GET) | Mismatch |

**Impact**: These mismatches cause the API calls to fail, triggering the mock fallback every time. The fix is straightforward: update the frontend URLs to match the actual backend routes.

### Finding 2: Pipeline Stage Enum Mismatch

**Frontend (`recruitmentService.ts`)**:
```
applied | screening | phone_screen | technical | hr_interview | offer | hired | rejected
```

**Backend (`candidates/[id]/stage/route.ts`)**:
```
APPLIED | SCREENING | PHONE_INTERVIEW | TECHNICAL_INTERVIEW | HIRING_MANAGER_INTERVIEW | FINAL_INTERVIEW | OFFER | OFFER_ACCEPTED | HIRED | REJECTED | WITHDRAWN
```

**Issues**:
- Case mismatch (lowercase vs UPPERCASE)
- Name mismatch (`phone_screen` vs `PHONE_INTERVIEW`, `hr_interview` vs `HIRING_MANAGER_INTERVIEW`)
- Backend has additional stages (`FINAL_INTERVIEW`, `OFFER_ACCEPTED`, `WITHDRAWN`) not in frontend
- Frontend has `technical` which maps to `TECHNICAL_INTERVIEW` in backend

**Resolution**: Create a stage mapping utility that converts between frontend display names and backend enum values.

### Finding 3: Missing tenantId Scoping

Files affected:
- `apps/web/src/app/api/v1/recruitment/jobs/route.ts` — no `tenantId` in `where` clause
- `apps/web/src/app/api/v1/recruitment/candidates/route.ts` — no `tenantId` in `where` clause
- `apps/web/src/app/api/v1/recruitment/candidates/[id]/stage/route.ts` — no tenant check on application

All routes have access to `user.tenantId` from `withEnhancedAuth` but don't use it. This is a **multi-tenant isolation violation**.

### Finding 4: Stats Route Architecture

`/api/v1/recruitment/stats` proxies to analytics-service via `ServiceProxy.get('analytics', '/api/v1/recruitment/stats')`. If the analytics-service doesn't have this endpoint implemented, the stats call fails silently. The dashboard service (`RecruitmentAnalyticsService.getStats()`) will get empty data.

**Resolution**: Either implement the stats aggregation in the analytics-service OR move it to a direct Prisma query in the stats route (simpler, recommended for Weeks 12–13).

---

## File/Module Impact Map

### Must-Change Files

| File | Change | LOC Est. |
|------|--------|----------|
| `apps/web/src/services/recruitmentService.ts` | Fix API URLs, add stage mapping, remove mock arrays | ~200 lines changed |
| `apps/web/src/services/jobDistributionService.ts` | Wire to real API or create thin routes | ~150 lines changed |
| `apps/web/src/app/api/v1/recruitment/jobs/route.ts` | Add tenantId to where clauses | ~10 lines |
| `apps/web/src/app/api/v1/recruitment/candidates/route.ts` | Add tenantId to where clauses | ~10 lines |
| `apps/web/src/app/api/v1/recruitment/candidates/[id]/stage/route.ts` | Add tenant check | ~5 lines |
| `apps/web/src/app/api/v1/recruitment/stats/route.ts` | Replace ServiceProxy with direct Prisma aggregation | ~60 lines |

### Verify-Only Files (Should Work Once URLs Are Fixed)

| File | Verify |
|------|--------|
| `apps/web/src/app/api/v1/recruitment/interviews/route.ts` | Interview creation works E2E |
| `apps/web/src/app/api/v1/recruitment/interviews/[id]/feedback/route.ts` | Feedback submission works |
| `apps/web/src/app/api/v1/recruitment/offers/e-sign/route.ts` | Offer lifecycle works |
| `apps/web/src/app/api/v1/recruitment/referrals/route.ts` | Referral tracking works |
| `apps/web/src/app/api/v1/recruitment/resume/parse/route.ts` | Service boundary is clean |
| `apps/web/src/app/dashboard/recruitment/services.ts` | Dashboard service uses correct endpoints |

### No-Change Files

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | Zero schema changes needed |
| `apps/web/src/lib/services/ai/interview-scheduler.service.ts` | Already production-ready |
| `apps/web/src/lib/services/ai/job-board-integration.service.ts` | Already production-ready |
| `apps/web/src/lib/services/agentic-ai/recruitment-agent.service.ts` | Already production-ready |

---

## Acceptance Criteria

### AC-1: No Mock Fallback in Production Paths
`recruitmentService.ts` must not return mock arrays in any production code path. The `catch` blocks returning `MOCK_JOB_POSTINGS`, `MOCK_CANDIDATES`, and `MOCK_ANALYTICS` must be removed or replaced with proper error propagation.

### AC-2: Endpoint URLs Match Backend Routes
All API calls from frontend services must target routes that actually exist. Specifically:
- `moveCandidateStage()` → PUT `/v1/recruitment/candidates/${id}/stage`
- `getRecruitmentAnalytics()` → GET `/v1/recruitment/stats`

### AC-3: Stage Enum Consistency
A mapping utility converts between frontend display stages and backend `PIPELINE_STAGES` enum. Stage transitions produce valid backend values.

### AC-4: Multi-Tenant Isolation
Every recruitment API route's `where` clause includes `tenantId` from the authenticated user context. No cross-tenant data leakage is possible.

### AC-5: Recruitment Analytics Query-Backed
Stats endpoint returns data derived from Prisma queries (count of open positions, applications by source, time-to-hire averages, stage conversion rates), not mock objects.

### AC-6: Job Distribution Service Functional
`jobDistributionService.ts` either calls real API endpoints or is refactored to use the dashboard service pattern with APIClient. Simulated delays are removed.

### AC-7: End-to-End Pipeline Flow
A candidate can be created, moved through stages, have interviews scheduled and feedback submitted, receive an offer, and appear in analytics — all from persistent data.

---

## Test Strategy

### Unit Tests (8 tests)

| # | Test | Target |
|---|------|--------|
| U1 | Stage mapping converts all frontend stages to valid backend stages | Stage mapping utility |
| U2 | Stage mapping rejects invalid stage names | Stage mapping utility |
| U3 | Candidate filter building includes tenantId | Candidate route |
| U4 | Job filter building includes tenantId | Jobs route |
| U5 | Terminal stage rejection (HIRED, REJECTED, WITHDRAWN) | Stage move route |
| U6 | Analytics aggregation query returns correct shape | Stats route |
| U7 | Job posting validation (title, department, type required) | Jobs POST route |
| U8 | Offer status transitions are valid | Offer lifecycle |

### Integration Tests (7 tests)

| # | Test | Target |
|---|------|--------|
| I1 | Create job posting → appears in GET list | Jobs API |
| I2 | Create candidate → create application → move through stages | Pipeline API |
| I3 | Schedule interview → submit feedback → verify stored | Interview API |
| I4 | Create offer → send → accept → verify lifecycle | Offer API |
| I5 | Stats endpoint returns aggregated data matching actual DB records | Stats API |
| I6 | Tenant A cannot see Tenant B's candidates | Multi-tenant isolation |
| I7 | Resume parse endpoint accepts file and returns structured boundary output | Resume API |

### End-to-End Tests (2 tests)

| # | Test | Target |
|---|------|--------|
| E1 | Full journey: requisition → posting → application → interview → offer → hired | Complete pipeline |
| E2 | Analytics dashboard shows real-time data matching DB state after pipeline operations | Analytics accuracy |

---

## Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| RR-1 | Stage enum mismatch causes silent failures | Candidate stage moves fail, mock fallback masks the issue | Create explicit mapping utility; add validation logging |
| RR-2 | Missing tenantId scoping allows cross-tenant data access | Data isolation violation — compliance/security issue | Add tenantId to ALL where clauses in recruitment routes |
| RR-3 | analytics-service may not exist or may not have recruitment endpoints | Stats route returns empty/error | Implement direct Prisma aggregation in stats route (don't depend on external service for Weeks 12–13) |
| RR-4 | `jobDistributionService.ts` has no backend routes to wire to | Service remains mock | Create minimal CRUD routes for job board config or defer entire distribution feature |
| RR-5 | `recruitmentService.ts` mock removal breaks UI components that depend on mock data shape | UI components crash | Verify API response shape matches mock interface contracts before removing mocks |
| RR-6 | Prisma `error` variable referenced but prefixed with `_` in catch blocks | TypeScript compilation warnings | Fix `_error` → `error` in catch blocks or remove reference |

---

## Copilot Handoff — Weeks 12–13

### Task 1: Fix Endpoint URL Alignment in recruitmentService.ts
**File**: `apps/web/src/services/recruitmentService.ts`
**Action**: Update API URLs to match actual backend routes:
- `moveCandidateStage()`: Change from POST `/v1/recruitment/candidates/${id}/move-stage` to PUT `/v1/recruitment/candidates/${id}/stage` with body `{ stage: mappedStage }`
- `getRecruitmentAnalytics()`: Change from GET `/v1/recruitment/analytics` to GET `/v1/recruitment/stats`
**Verify**: API calls succeed without falling back to mock data

### Task 2: Create Pipeline Stage Mapping Utility
**File**: New utility in `apps/web/src/services/recruitmentService.ts` (or separate util)
**Action**: Create bidirectional mapping between frontend stage names (`applied`, `phone_screen`, `technical`, `hr_interview`) and backend enum values (`APPLIED`, `PHONE_INTERVIEW`, `TECHNICAL_INTERVIEW`, `HIRING_MANAGER_INTERVIEW`). Use this mapping in `moveCandidateStage()` and when parsing API responses.
**Contract**:
```typescript
const STAGE_MAP: Record<PipelineStage, string> = {
  applied: 'APPLIED',
  screening: 'SCREENING',
  phone_screen: 'PHONE_INTERVIEW',
  technical: 'TECHNICAL_INTERVIEW',
  hr_interview: 'HIRING_MANAGER_INTERVIEW',
  offer: 'OFFER',
  hired: 'HIRED',
  rejected: 'REJECTED',
};
```

### Task 3: Add tenantId Scoping to Recruitment API Routes
**Files**:
- `apps/web/src/app/api/v1/recruitment/jobs/route.ts`
- `apps/web/src/app/api/v1/recruitment/candidates/route.ts`
- `apps/web/src/app/api/v1/recruitment/candidates/[id]/stage/route.ts`
- All other recruitment route files
**Action**: Extract `tenantId` from `user.tenantId` (available via `withEnhancedAuth`). Add `tenantId` to every `where` clause in `prisma.jobPosting.*`, `prisma.candidate.*`, `prisma.candidateApplication.*` queries.
**Pattern**: Follow existing attendance routes for reference.

### Task 4: Remove Mock Arrays from recruitmentService.ts
**File**: `apps/web/src/services/recruitmentService.ts`
**Action**: Delete `MOCK_JOB_POSTINGS`, `MOCK_CANDIDATES`, `MOCK_ANALYTICS` arrays and `AVATAR_COLORS`. Replace `catch` blocks with proper error propagation (`throw` or return empty arrays with console.error). Ensure API response shapes are mapped to match the existing TypeScript interfaces.
**Depends on**: Tasks 1 and 2 must be complete first

### Task 5: Implement Real Recruitment Stats Endpoint
**File**: `apps/web/src/app/api/v1/recruitment/stats/route.ts`
**Action**: Replace `ServiceProxy.get('analytics', ...)` with direct Prisma aggregation queries:
```
- prisma.jobPosting.count({ where: { tenantId, status: 'Active' } })
- prisma.candidateApplication.groupBy({ by: ['currentStage'], _count: true })
- prisma.candidateApplication.groupBy({ by: ['source'], _count: true })
- prisma.jobOffer.count/groupBy for acceptance rates
- Time-to-hire: avg of (hiredDate - appliedAt) for hired candidates
```
**Contract**: Return `{ success: true, data: RecruitmentStats }` matching the shape expected by `RecruitmentAnalyticsService.getStats()`.

### Task 6: Wire jobDistributionService.ts to Real Data
**File**: `apps/web/src/services/jobDistributionService.ts`
**Action**: Either:
- (A) Create thin API routes for job board config CRUD and wire the service to them, OR
- (B) Refactor to use the dashboard service pattern (APIClient) for board listings and distribution status
Remove simulated delay functions. Remove all mock arrays.
**Note**: External board API integration (LinkedIn OAuth, etc.) is deferred. This task only wires internal data.

### Task 7: Fix TypeScript Catch Block Variables
**Files**: All recruitment route files with `_error` pattern
**Action**: Fix catch blocks that reference `error` but declare `_error`:
- `jobs/route.ts` lines 63, 118: `_error` declared but `error` referenced in console.error
- `candidates/route.ts` line 97: same pattern
- `candidates/[id]/stage/route.ts` line 109: same pattern
**Impact**: Prevents runtime reference errors in error handling paths

### Task 8: Verify Interview Scheduling End-to-End
**Files**: `apps/web/src/app/api/v1/recruitment/interviews/route.ts`, `interviews/schedule/route.ts`
**Action**: Manually test or write integration test for: schedule interview → verify it persists in DB → submit feedback → verify feedback stored. Confirm the frontend `scheduleInterview()` and `submitFeedback()` methods work without fallback.

### Task 9: Verify Offer Lifecycle End-to-End
**Files**: `apps/web/src/app/api/v1/recruitment/offers/*`
**Action**: Verify offer creation → approval → sending → acceptance flow. Confirm `JobOfferService` from dashboard services works end-to-end.

### Task 10: Verify Resume Ingestion Service Boundary
**File**: `apps/web/src/app/api/v1/recruitment/resume/parse/route.ts`
**Action**: Confirm the route accepts a file upload, stores the original file reference, and returns a parsed output stub. The parser implementation is deferred, but the boundary (input/output contract) must be clean and documented.

### Task 11: Write Unit and Integration Tests
**Files**: New test files in `tests/` or co-located
**Action**: Implement the 8 unit tests and 7 integration tests from the Test Strategy section above. Priority order: I6 (tenant isolation), I2 (pipeline flow), I5 (stats accuracy), U1-U2 (stage mapping).

### Task 12: Verify Dashboard Service Alignment
**File**: `apps/web/src/app/dashboard/recruitment/services.ts`
**Action**: Confirm all dashboard service endpoints match actual API routes. Specifically verify:
- `JobRequisitionService.endpoint` = `/recruitment/requisitions` — does this route exist?
- All other service endpoints resolve to working APIs
**Note**: The dashboard service imports types from `./types` — verify type file exists and matches Prisma model shapes.

---

## Architecture Notes

### Mock Fallback Pattern (recruitmentService.ts)

The current pattern is:
```typescript
static async getJobPostings(filters?) {
  try {
    return await APIClient.get('/v1/recruitment/jobs', filters);
  } catch {
    return [...MOCK_JOB_POSTINGS]; // fallback
  }
}
```

This is actually well-designed for development — it transparently degrades. The problem is that **URL mismatches make the API calls always fail**, so mock data is always returned. Fixing the URLs (Tasks 1-2) should make most methods work immediately. Then mock removal (Task 4) is safe cleanup.

### Two Service Layers

The recruitment module has two separate frontend service layers:
1. `apps/web/src/services/recruitmentService.ts` — used by `(modules)/recruitment/` pages
2. `apps/web/src/app/dashboard/recruitment/services.ts` — used by `dashboard/recruitment/` pages

Both target the same API routes but with different patterns. The dashboard layer is cleaner (pure APIClient). Long-term, these should converge, but for Weeks 12–13, fixing both independently is acceptable.

### Resume Parsing Architecture

Per the guide: "Keep parser integration behind a service boundary. Store original file reference and parsed output separately. Make parser provider replaceable. Treat parser errors as recoverable."

The current stub at `resume/parse/route.ts` (49 lines) is acceptable as a boundary. The actual parsing engine (NLP/ML) is a deferred Phase 3 capability.

---

## Related Documents

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Recruitment Completion Guide](./GUIDE-RECRUITMENT-COMPLETION.md)
4. [Payroll Engine Planning](./PAYROLL-ENGINE-PLANNING.md)
5. [Attendance Completion Planning](./ATTENDANCE-COMPLETION-PLANNING.md)
6. [Leave Engine Planning](./LEAVE-ENGINE-PLANNING.md)
