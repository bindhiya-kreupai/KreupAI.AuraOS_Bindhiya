# Gap Analysis: EPIC-03-S12 — Workforce planning HR audit checklist & red-flag register

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Internal Auditor, **I want** a configurable workforce-planning audit checklist with red-flag detection, **so that** I can verify positions, budgets, requisitions and localization controls and log findings.

**Description**
Implements the chapter's HR audit checklist as a digital, configurable checklist with pass/fail/N-A, evidence attachment and auto-run red-flag rules (e.g., filled > budgeted, requisition approved by preparer, position with no budget, non-national hire in a gap entity without justification). Findings flow into a finding/corrective-action register.

**Covers:** 3.14
**Acceptance criteria count:** 5 · **Task count:** 6

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

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an audit checklist, when configured, then items are grouped by control area with response types and evidence slots.
- [ ] Given red-flag rules, when executed, then exceptions (e.g., headcount > budget, SoD breach, unfunded position) are listed with drill-down.
- [ ] Given a checklist item, when marked fail, then a finding with severity, owner and due date is created.
- [ ] Given a finding, when overdue, then an alert is raised and it appears on the dashboard.
- [ ] Given audit execution, when completed, then a signed audit pack/export is produced and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `audit_checklist`, `audit_item`, `audit_finding` entities + migration.
- [ ] Backend: red-flag rule engine over planning/budget/requisition data.
- [ ] Frontend: checklist runner + findings/corrective-action register.
- [ ] Rules/Config: configurable checklist templates and red-flag rules per entity.
- [ ] Alerts/Workflow: overdue-finding alerts; sign-off workflow.
- [ ] Tests: unit (red-flag rules) + e2e (run checklist→finding→export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
