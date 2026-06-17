# Gap Analysis: EPIC-18-S09 — Bahraini employee onboarding controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
An onboarding checklist overlay for Bahrainis enforcing mandatory steps — CPR capture, SIO registration trigger, compliant bank/wage setup, contract on MOL terms — and blocking "counted" status until controls pass.

**Covers:** 18.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/contract/consumer/employee-api.consumer.test.ts
- apps/web/src/**tests**/contract/provider/employee-api.provider.test.ts
- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/factories/employee.factory.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Bahraini new hire, when onboarding starts, then the Bahrainization checklist (CPR, SIO, wage/bank, contract) is enforced.
- [ ] Given any mandatory control incomplete, when the Bahraini would be counted, then counting is blocked and the reason is shown.
- [ ] Given SIO registration initiated, then the linkage is recorded for reconciliation (S10).
- [ ] Given completion, then a "genuine onboarding" evidence record is created and added to the evidence pack.
- [ ] Given audit, then each control's completion is timestamped and attributed.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_onboarding_control` entity (`employeeId`, `controlType`, `status`, `evidenceRef`, `completedAt`).
- [ ] Backend: counting-gate service blocking numerator inclusion until controls pass.
- [ ] Frontend: Bahraini onboarding checklist with blocking states.
- [ ] Rules/Config: configurable mandatory control set per country.
- [ ] Alerts/Workflow: incomplete-control reminders to HR Admin.
- [ ] Tests: e2e test that incomplete controls block counting.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
