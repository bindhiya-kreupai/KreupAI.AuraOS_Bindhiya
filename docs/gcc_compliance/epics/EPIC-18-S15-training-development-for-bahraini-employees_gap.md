# Gap Analysis: EPIC-18-S15 — Training & development for Bahraini employees

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
Captures development plans, training completion and competency progression for counted Bahrainis, linking to onboarding and retention, and producing a training-evidence section for the pack.

**Covers:** 18.17
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/integration/employees/employees.test.ts
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/api/core-hr/employees/[employeeId]/route.ts
- apps/web/src/app/api/core-hr/employees/route.ts
- apps/web/src/app/api/employees/autocomplete/route.ts
- apps/web/src/app/api/employees/search/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a counted Bahraini, when a development plan is created, then training items, target dates and status are tracked.
- [ ] Given completed training, then completion records and certificates are stored as evidence.
- [ ] Given overdue mandatory training, when detected, then a reminder is raised.
- [ ] Given the evidence pack, then a training-and-development summary per Bahraini is included.

## Implementation Tasks From Backlog

- [ ] Backend: reuse `national_development_plan` entity for Bahraini employees.
- [ ] Frontend: development-plan view with completion tracking.
- [ ] Alerts/Workflow: overdue-training reminders.
- [ ] Tests: unit tests for overdue detection.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
