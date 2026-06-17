# Gap Analysis: EPIC-25-S15 — Sample Grievance Intake Form (Configurable Digital Form)

> **✅ SHIPPED 2026-06-17** — Theme D closure. Default form template added to `hr-forms-compliance` DEFAULT_TEMPLATES with writeback target. Surfaced via existing forms registry, routing, e-signature, and writeback infrastructure. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3

**Description**
Provides a configurable grievance intake form (complainant details/anonymity, category, respondents, description, dates, witnesses, desired outcome, attachments, declaration) that drives case creation and is exportable as a branded PDF template for offline use.

**Covers:** 25.30
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

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given the form builder, when fields are configured, then mandatory/optional and conditional fields are enforced at intake.
- [ ] Given a submission, when validated, then it creates a grievance case via the intake service.
- [ ] Given an anonymous option, when selected, then identity fields are suppressed.
- [ ] Given export, when requested, then a branded PDF template is produced.
- [ ] Given form changes, when saved, then versioning and audit are applied.

## Implementation Tasks From Backlog

- [ ] Backend: form-definition entity + render/validate service linked to intake.
- [ ] Frontend: form builder + employee-facing form renderer.
- [ ] Rules/Config: configurable field sets per country/entity.
- [ ] Alerts/Workflow: submission acknowledgement.
- [ ] Tests: unit (validation), integration (form→case + PDF export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
