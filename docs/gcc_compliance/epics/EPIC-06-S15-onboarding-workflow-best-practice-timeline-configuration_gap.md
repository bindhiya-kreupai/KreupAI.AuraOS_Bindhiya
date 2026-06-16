# Gap Analysis: EPIC-06-S15 — Onboarding workflow & best-practice timeline configuration

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 8
**User story:** System Administrator, **I want** to configure the onboarding workflow and a best-practice timeline template, **so that** approvals, hand-offs and recommended day-offsets are standardised and adaptable per country/entity.

**Description**
Provide a no-code workflow designer for onboarding (stages, tasks, owners, approvals, parallel tracks for PRO/Payroll/IT) and a best-practice timeline template expressing recommended offsets (e.g. T-7 pre-joining complete, T-0 joining day, T+1 master activation, T+3 enrolment). The timeline drives default due dates and the dashboard's on-track view.

**Covers:** 6.18, 6.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the workflow designer, when an admin configures stages/tasks/approvals, then new cases follow the configured flow.
- [ ] Given a best-practice timeline, when applied, then task due dates default to the configured day-offsets relative to join date.
- [ ] Given parallel tracks, when active, then PRO/Payroll/IT tasks run concurrently without blocking unrelated stages.
- [ ] Given a config change, then in-flight cases keep their bound workflow version while new cases use the latest.
- [ ] Given audit, then workflow/timeline versions are recorded.

## Implementation Tasks From Backlog

- [ ] Backend: `onboarding_workflow_def` + `onboarding_timeline_template` (offsets) with versioning.
- [ ] Backend: workflow execution + due-date derivation service.
- [ ] Frontend: workflow designer + timeline template editor.
- [ ] Rules/Config: default GCC timeline templates.
- [ ] Tests: workflow execution + offset-derivation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
