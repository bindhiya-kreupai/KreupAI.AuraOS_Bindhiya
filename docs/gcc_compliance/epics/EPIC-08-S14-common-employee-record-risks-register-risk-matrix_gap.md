# Gap Analysis: EPIC-08-S14 — Common employee record risks register & risk matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a records risk register with red-flag detection and a risk matrix, **so that** common record risks are scored, tracked and remediated.

**Description**
Seed a risk register with common record risks (missing/expired mandatory documents, inaccurate master data, unauthorised access, premature disposal/retention breach, unconsented sensitive processing, duplicate employees, stale ESS data). Auto-create entries from detectors, score likelihood × impact into a heat-map, and track corrective actions to closure.

**Covers:** 8.19
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a detected red flag (e.g. expired mandatory document, restricted-field access by unauthorised user), then a risk entry is created with severity.
- [ ] Given a risk entry, when scored, then likelihood × impact yields a rating and heat-map position.
- [ ] Given a corrective action, when assigned, then owner, due date and status are tracked to closure.
- [ ] Given the matrix, when filtered by entity/country, then ratings update.
- [ ] Given export, then the risk register exports for review.

## Implementation Tasks From Backlog

- [ ] Backend: `records_risk_register` (risk, likelihood, impact, rating, action, status) + red-flag detectors.
- [ ] Backend: scoring + heat-map computation.
- [ ] Frontend: risk matrix/heat-map + register view.
- [ ] Rules/Config: configurable scoring + seeded risks.
- [ ] Tests: detector + scoring tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
