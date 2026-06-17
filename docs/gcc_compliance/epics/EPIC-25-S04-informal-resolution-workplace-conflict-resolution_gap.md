# Gap Analysis: EPIC-25-S04 — Informal Resolution & Workplace Conflict Resolution

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3

**Description**
Supports an informal track (mediation, facilitated conversation, manager coaching) for eligible low/medium-risk cases, capturing actions, agreements and outcomes, with the ability to escalate to formal investigation if informal resolution fails or new risk emerges.

**Covers:** 25.10, 25.16
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

- [ ] Given a case is eligible (tier allows), when HR selects informal resolution, then mediation/conflict-resolution steps and outcomes can be logged.
- [ ] Given informal resolution is recorded as agreed, when closed, then complainant acknowledgement is captured and the case is marked resolved-informal.
- [ ] Given informal resolution fails or new risk markers appear, when escalated, then the case converts to formal investigation retaining all prior records.
- [ ] Given a harassment/discrimination/retaliation case, when informal resolution is attempted, then the system blocks it unless senior approval is recorded.
- [ ] Given any informal action, when logged, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `informal_resolution` (method, sessions, agreement, outcome, complainant_ack) entity + escalate-to-formal transition.
- [ ] Backend: eligibility guard tied to risk tier and category.
- [ ] Frontend: informal resolution workspace with session log and outcome capture.
- [ ] Rules/Config: eligibility and senior-approval thresholds per category.
- [ ] Alerts/Workflow: notify parties of agreed outcome; escalation alert on failure.
- [ ] Tests: integration (escalation retains history), unit (eligibility guard).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
