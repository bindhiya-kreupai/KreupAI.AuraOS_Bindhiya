# Gap Analysis: EPIC-09-S07 — Grades and salary bands

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Configure grade structures and salary bands (min/mid/max, currency) per grade and legal entity/country, with compa-ratio support, so positions inherit grade-driven pay ranges used by recruitment and payroll as a control.

**Covers:** 9.10
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a grade, when a salary band is defined, then min ≤ mid ≤ max and a currency are required.
- [ ] Given a position with a grade, when a salary outside the band is proposed downstream, then the system flags an out-of-band exception.
- [ ] Given multiple currencies, when bands are defined per legal entity, then each band stores its base currency for the entity's country.
- [ ] Given band changes, when saved, then effective-dating, versioning and audit apply.

## Implementation Tasks From Backlog

- [ ] Backend: `grade` and `salary_band` schemas (`min`, `mid`, `max`, `currency`, `effective_from`)
- [ ] Backend: out-of-band detection service + compa-ratio calculation
- [ ] Frontend: grade & band configuration screen
- [ ] Rules/Config: per-entity currency and band rules
- [ ] Tests: validation tests for min/mid/max ordering and out-of-band flagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
