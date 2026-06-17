# Gap Analysis: EPIC-32-S03 — Employee Handbook & Code of Conduct

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5

**Description**
Ships the Employee Handbook as a "compilation" policy that assembles referenced policies into a single published document, plus the Code of Conduct with ethics, conflict-of-interest, gifts, and anti-bribery clauses. Both feed onboarding acknowledgement.

**Covers:** 32.6, 32.7
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/contract/consumer/employee-api.consumer.test.ts
- apps/web/src/**tests**/contract/provider/employee-api.provider.test.ts
- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/factories/employee.factory.ts
- apps/web/src/**tests**/integration/employees/employees.test.ts
- apps/web/src/**tests**/performance/tests/employee-load.test.js

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add/wire UI workflow.

## Acceptance Criteria To Verify

- [ ] Given the Handbook, when included policies are republished, then the Handbook flags as "out of sync" and can be recompiled to a new version.
- [ ] Given onboarding (EPIC-06 link), when a new joiner is hired, then Handbook + Code of Conduct acknowledgement tasks are auto-created.
- [ ] Given the Code of Conduct, then conflict-of-interest and gifts/anti-bribery clauses are configurable per entity.
- [ ] Given an employee, then the published Handbook is viewable in self-service in their language where a translation version exists.

## Implementation Tasks From Backlog

- [ ] Backend: compilation policy type assembling child policy versions.
- [ ] Backend: out-of-sync detection service.
- [ ] Frontend: Handbook viewer in employee self-service + Code of Conduct template.
- [ ] Rules/Config: per-entity Code of Conduct clause toggles.
- [ ] Tests: unit (compile/sync), e2e (onboarding ack task creation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
