# Gap Analysis: EPIC-25-S10 — Grievance Timelines, SLA Engine & Appeals

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
Provides an SLA engine for acknowledgement, investigation and resolution stages with per-country/per-tier targets, breach alerts at 75%/100% of SLA, and an appeals workflow allowing complainants/respondents to appeal an outcome to an independent reviewer within a defined window.

**Covers:** 25.20, 25.21
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

- [ ] Given a case stage, when SLA is configured, then due dates per country/tier are tracked and breaches flagged at thresholds.
- [ ] Given an outcome is communicated, when the appeal window opens, then eligible parties can lodge an appeal with grounds before it closes.
- [ ] Given an appeal is lodged, when assigned, then it routes to a reviewer independent of the original decision-maker.
- [ ] Given an appeal decision, when recorded, then it upholds/varies/overturns the outcome with reasons and is final per policy.
- [ ] Given any SLA breach or appeal event, when it occurs, then it is alerted and audited.

## Implementation Tasks From Backlog

- [ ] Backend: SLA engine (`case_sla` with stage targets) + `grievance_appeal` (grounds, reviewer, decision) entities.
- [ ] Backend: independent-reviewer routing guard.
- [ ] Frontend: SLA timeline view + appeal submission/review screens.
- [ ] Rules/Config: per-country timelines and appeal-window durations.
- [ ] Alerts/Workflow: 75%/100% breach alerts; appeal lodged/decided notifications.
- [ ] Tests: unit (SLA computation), integration (appeal independence + finality).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
