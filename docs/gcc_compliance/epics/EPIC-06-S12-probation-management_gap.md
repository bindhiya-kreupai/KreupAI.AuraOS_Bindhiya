# Gap Analysis: EPIC-06-S12 — Probation management

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Set probation length per country/contract (within legal caps, e.g. UAE max 6 months), schedule review milestones, and run a confirmation/extension/probation-termination workflow with manager assessment. Alerts fire ahead of probation end so decisions occur before the deadline; defaults to confirmation where configured.

**Covers:** 6.14
**Acceptance criteria count:** 6 · **Task count:** 6

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

- [ ] Given a contract, when probation is set, then the period is validated against the country's legal maximum.
- [ ] Given an approaching probation end, when 30/14/7 days remain, then the line manager and HR are alerted to act.
- [ ] Given a confirmation decision, when approved, then the employee status updates to confirmed and the effective date is recorded.
- [ ] Given a probation extension, when within legal limits, then the new end date and justification are stored and re-alerted.
- [ ] Given probation termination, when initiated, then country notice rules are applied and the case routes to separation.
- [ ] Given any probation action, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `probation` (employee_id, start, end, status, decision, decided_by) + review milestones.
- [ ] Backend: probation rule validation + decision workflow service.
- [ ] Frontend: probation tracker + manager assessment form.
- [ ] Rules/Config: per-country probation caps & notice rules.
- [ ] Alerts/Workflow: 30/14/7-day probation alerts + confirmation workflow.
- [ ] Tests: cap validation, alert scheduling, decision-flow tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
