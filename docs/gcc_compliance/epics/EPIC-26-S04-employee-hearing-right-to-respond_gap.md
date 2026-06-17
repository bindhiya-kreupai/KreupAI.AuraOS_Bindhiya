# Gap Analysis: EPIC-26-S04 — Employee Hearing & Right to Respond

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
Implements a mandatory hearing workflow: issue notice with allegations and evidence summary within a minimum notice period, record attendance and the employee's representations (and right to be accompanied where applicable), and capture the hearing outcome that feeds the penalty decision.

**Covers:** 26.10
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a case ready for penalty, when a hearing is required, then a hearing notice with allegations/evidence and a minimum notice period is issued and logged.
- [ ] Given the hearing, when held, then attendance, employee representations and accompaniment are recorded.
- [ ] Given the employee does not attend, when documented, then reasonable-opportunity/rescheduling rules are applied before proceeding.
- [ ] Given a penalty above threshold, when issued without a recorded hearing, then the system blocks it.
- [ ] Given any hearing event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_hearing` (notice, notice_period, attendance, representations, outcome) entity + hearing-gate guard.
- [ ] Backend: notice generation linked to document store.
- [ ] Frontend: hearing scheduling, notice, and minutes capture screens.
- [ ] Rules/Config: per-country minimum notice periods and accompaniment rights.
- [ ] Alerts/Workflow: hearing notice/reminder notifications.
- [ ] Tests: integration (hearing gate + non-attendance handling), unit (notice period).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
