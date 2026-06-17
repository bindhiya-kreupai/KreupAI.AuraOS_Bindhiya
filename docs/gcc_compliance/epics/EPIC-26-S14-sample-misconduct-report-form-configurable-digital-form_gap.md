# Gap Analysis: EPIC-26-S14 — Sample Misconduct Report Form (Configurable Digital Form)

> **✅ SHIPPED 2026-06-17** — Theme D closure. Default form template added to `hr-forms-compliance` DEFAULT_TEMPLATES with writeback target. Surfaced via existing forms registry, routing, e-signature, and writeback infrastructure. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**User story:** Line Manager, **I want** a configurable digital misconduct report form, **so that** incidents are reported consistently and initiate a disciplinary case.

**Description**
Provides a configurable misconduct report form (employee, date/time/location, offence category, description, witnesses, evidence attachments, immediate action taken, reporter declaration) that creates a disciplinary case and is exportable as a branded PDF template.

**Covers:** 26.26
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the form builder, when fields are configured, then mandatory/conditional fields are enforced.
- [ ] Given a submission, when validated, then a disciplinary case is created and classified for triage.
- [ ] Given attachments, when added, then they are stored as evidence with metadata.
- [ ] Given export, when requested, then a branded PDF template is produced.
- [ ] Given form changes, when saved, then versioning and audit apply.

## Implementation Tasks From Backlog

- [ ] Backend: form-definition entity + render/validate service linked to case creation.
- [ ] Frontend: form builder + manager-facing form.
- [ ] Rules/Config: per-country/entity field sets.
- [ ] Alerts/Workflow: case-created acknowledgement.
- [ ] Tests: unit (validation), integration (form→case + PDF).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
