# Gap Analysis: EPIC-25-S16 — Sample Grievance Register, Investigation Report & Corrective Action Register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers three configurable digital artefacts: a grievance register (all cases with status, tier, SLA, outcome), a structured investigation report template (background, scope, allegations, methodology, evidence, findings, recommendations), and a corrective-action register tracking actions, owners, due dates and closure—each filterable and exportable.

**Covers:** 25.31, 25.32, 25.33
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
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

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the grievance register, when opened, then all cases are listed with filters (country, type, tier, status, SLA) and export.
- [ ] Given an investigation, when the report is generated, then it follows the structured template and pulls linked interviews/evidence/findings.
- [ ] Given a finding/recommendation, when actioned, then a corrective-action register entry tracks owner, due date and status to closure.
- [ ] Given an overdue corrective action, when detected, then it is flagged/escalated.
- [ ] Given any register/report change, when saved, then it is audited and exportable (PDF/Excel).

## Implementation Tasks From Backlog

- [ ] Backend: register query services + investigation-report generator + `corrective_action` entity/migration.
- [ ] Backend: overdue-action detector.
- [ ] Frontend: grievance register grid, report builder/preview, corrective-action board.
- [ ] Rules/Config: configurable register columns and report sections.
- [ ] Alerts/Workflow: overdue corrective-action escalation.
- [ ] Tests: integration (report assembly + register export), unit (overdue detection).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
