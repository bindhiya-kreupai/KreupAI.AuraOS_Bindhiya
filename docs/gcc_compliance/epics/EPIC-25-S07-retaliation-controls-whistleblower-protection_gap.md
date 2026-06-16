# Gap Analysis: EPIC-25-S07 — Retaliation Controls & Whistleblower Protection

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** retaliation-monitoring controls on complainants and witnesses, **so that** people who raise or support grievances are protected from adverse action.

**Description**
Flags complainants/witnesses for a configurable protection window and monitors for adverse HR events (disciplinary, negative review, transfer, termination, pay cut) against them during that window, requiring justification/second-line approval before such actions proceed and enabling a retaliation sub-complaint.

**Covers:** 25.15
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

- [ ] Given a person becomes a complainant/witness, when flagged, then a protection window (configurable, e.g. 6/12 months) is set.
- [ ] Given an adverse HR action is initiated against a protected person during the window, when triggered, then the action is held for ER/Compliance review and justification.
- [ ] Given a retaliation sub-complaint is raised, when created, then it is linked to the originating case and triaged High.
- [ ] Given protection-window expiry, when reached, then the flag is lifted and audited.
- [ ] Given any protected-person event, when processed, then it is recorded in the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `retaliation_protection` (subject_id, source_case, window_start/end) + adverse-action interceptor consuming HR events.
- [ ] Backend: linkage of retaliation sub-complaints to source case.
- [ ] Frontend: protected-persons view + adverse-action review queue.
- [ ] Rules/Config: protection-window length and adverse-action types per country.
- [ ] Alerts/Workflow: hold-and-review approval for flagged actions; expiry notification.
- [ ] Tests: integration (interceptor holds action), unit (window lifecycle).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
