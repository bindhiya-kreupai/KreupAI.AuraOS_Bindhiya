# Gap Analysis: EPIC-08-S08 — Data quality management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Run configurable data-quality checks (completeness, format validity, cross-field consistency, duplicate detection, expiry validity, referential integrity to documents/positions). Surface a data-quality scorecard and exception queue with assignment and resolution, and prevent known-bad data from propagating.

**Covers:** 8.11
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useToast.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given the data-quality rule set, when executed, then completeness, format, consistency and duplicate checks run across records.
- [ ] Given a rule violation, when detected, then an exception is created with severity and assigned for resolution.
- [ ] Given a duplicate (e.g. same passport/national ID), when found, then it is flagged and blocked from activation propagation.
- [ ] Given the data-quality scorecard, when viewed, then accuracy/completeness/consistency rates show per entity.
- [ ] Given resolution of an exception, then re-validation runs and the scorecard updates.
- [ ] Given audit, then exceptions and resolutions are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `data_quality_rule` + `data_quality_exception` + scheduled check engine.
- [ ] Backend: duplicate/consistency detectors + scorecard aggregation.
- [ ] Frontend: data-quality scorecard + exception queue.
- [ ] Rules/Config: configurable DQ rules per entity.
- [ ] Tests: detector + scorecard + resolution tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
