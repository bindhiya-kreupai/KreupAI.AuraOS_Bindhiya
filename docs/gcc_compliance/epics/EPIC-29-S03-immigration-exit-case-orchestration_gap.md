# Gap Analysis: EPIC-29-S03 — Immigration Exit Case Orchestration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** an immigration-exit case auto-created on separation that instantiates the correct task set and tracks closure end-to-end, **so that** every leaver's immigration closure is driven, visible and complete.

**Description**
Creates an exit case when a separation is initiated, linking the employee's active visa/work-permit/residence records (from EPIC-07), selecting the scenario/country profile, instantiating the task template (PRO tasks, document needs, authority steps), and tracking overall closure status with a completeness gate. The case is the spine that all other exit stories (grace period, dependents, repatriation, payroll/benefits/SI closure, evidence) attach to.

**Covers:** 29.5 (orchestration aspect)
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation initiated in EPIC-27, when an exit case is created, then the employee's active immigration records are linked and the scenario/country task set instantiated.
- [ ] Given the case, when tasks complete, then overall closure status advances and an immigration-closure completeness score is shown.
- [ ] Given an incomplete case, when separation final clearance is attempted, then the immigration items block clearance until closed or explicitly waived with reason.
- [ ] Given a change in scenario (e.g. normal exit reclassified as absconding), then the task set re-instantiates appropriately.
- [ ] Given any case action, then it is audited; RBAC restricts case management to PRO / HR Admin.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_exit_case` entity (employeeId, scenario, countryProfile, linkedDocs[], status, completenessScore)
- [ ] Backend: consumer on `employee.separationInitiated` instantiating case + tasks
- [ ] Backend: completeness gate feeding EPIC-27 clearance
- [ ] Frontend: exit-case detail with task list and completeness
- [ ] Alerts/Workflow: clearance block until immigration closed/waived
- [ ] Tests: e2e separation→exit-case→task instantiation; reclassification

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
