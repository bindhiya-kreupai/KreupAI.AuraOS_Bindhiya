# Gap Analysis: EPIC-08-S12 — Employee file completeness score

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5

**Description**
Compute a completeness score per employee (and aggregate per entity/department) from the mandatory-document matrix, document validity (non-expired), master-data completeness and required acknowledgements. Weighted, configurable scoring with a status band (e.g. Complete/At-Risk/Incomplete), gap list and remediation tasks.

**Covers:** 8.15
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an employee, when the score computes, then it reflects mandatory-document presence, validity, master-data completeness and acknowledgements.
- [ ] Given a missing/expired item, when scoring, then the item appears on the gap list and lowers the score.
- [ ] Given configurable weights/bands, when applied, then the status band (Complete/At-Risk/Incomplete) is derived.
- [ ] Given aggregation, when viewed by entity/department, then average and distribution of scores show.
- [ ] Given a remediation action, then it is generated for each gap and tracked.
- [ ] Given recompute triggers (upload, expiry, change), then the score updates.

## Implementation Tasks From Backlog

- [ ] Backend: completeness-scoring service consuming matrix + validity + master-data; `file_completeness_score` store.
- [ ] Backend: gap-list + remediation-task generator + recompute triggers.
- [ ] Frontend: per-employee score + gap list; aggregate view.
- [ ] Rules/Config: configurable weights & bands.
- [ ] Tests: scoring + recompute + gap-generation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
