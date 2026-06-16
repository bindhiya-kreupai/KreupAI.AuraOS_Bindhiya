# Gap Analysis: EPIC-04-S12 — Compensation benchmarking

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 5
**User story:** HR Manager, **I want** compensation benchmarked against market and internal bands, **so that** proposed pay is competitive, equitable and within budget before an offer is initiated.

**Description**
Provides benchmarking against market survey data and internal grade/salary bands (EPIC-09), with internal-equity comparison (similar roles), budget-line check (EPIC-03) and approval flags when a proposal sits outside band. Outputs a recommended range that seeds offer salary-structure design in EPIC-05.

**Covers:** 4.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a role and grade, when benchmarked, then market range and internal band min/mid/max are shown.
- [ ] Given a proposed salary, when outside band, then an exception/approval flag is raised.
- [ ] Given comparable internal incumbents, when compared, then internal-equity position is displayed.
- [ ] Given a proposal, when checked, then it validates against the EPIC-03 budget line.
- [ ] Given any benchmarking output, when finalised, then it is recorded and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `comp_benchmark` entity (roleId, gradeId, marketRange, internalBand, proposed, equityIndex) + migration.
- [ ] Backend: benchmarking + internal-equity service.
- [ ] Frontend: benchmarking view with range, equity and budget check.
- [ ] Rules/Config: market data sources and band config per entity.
- [ ] Alerts/Workflow: out-of-band approval flag.
- [ ] Tests: unit (equity/range calc) + integration (budget validation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
