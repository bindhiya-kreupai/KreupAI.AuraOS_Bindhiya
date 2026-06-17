# Gap Analysis: EPIC-09-S11 — Vacancy management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 3

**Description**
Surface vacant positions (newly created, vacated, or seats below filled count) with vacancy reason, aging and recruitment status, and expose them to the requisition process.

**Covers:** 9.13
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/core-hr/position-management/VacancyOrchestration.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a position with unfilled approved seats, when evaluated, then it appears in the vacancy register with vacancy-since date and aging.
- [ ] Given an incumbent departure, when finalized, then the position auto-flags vacant with reason "vacated".
- [ ] Given a frozen/abolished position, when checked, then it is excluded from the active vacancy list.
- [ ] Given a vacancy, when a requisition is raised, then its recruitment status syncs back to the vacancy register.

## Implementation Tasks From Backlog

- [ ] Backend: vacancy derivation service (seats vs filled) + `vacancy` view with aging
- [ ] Backend: integration hook to requisition status (EPIC-04)
- [ ] Frontend: vacancy register with aging and reason filters
- [ ] Alerts/Workflow: aging-vacancy alert at configurable thresholds
- [ ] Tests: unit tests for vacancy derivation and exclusion of frozen positions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
