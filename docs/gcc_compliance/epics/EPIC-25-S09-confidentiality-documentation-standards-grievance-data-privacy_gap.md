# Gap Analysis: EPIC-25-S09 — Confidentiality, Documentation Standards & Grievance Data Privacy

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** enforced confidentiality, documentation standards and data-privacy controls on grievance records, **so that** sensitive ER data is protected and case files are complete and defensible.

**Description**
Implements need-to-know access tiers, document-standard validation (mandatory fields, naming, completeness checks before closure), and data-privacy controls (retention, minimisation, redaction, subject-access handling, lawful-basis tagging) for grievance records across GCC jurisdictions.

**Covers:** 25.18, 25.19, 25.23
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a grievance record, when accessed, then only need-to-know roles see it and every view/download is logged.
- [ ] Given a case is being closed, when validation runs, then mandatory documentation (intake, risk assessment, investigation/finding, outcome) must be present or closure is blocked.
- [ ] Given data-privacy config, when a record reaches retention end, then disposal/anonymisation is scheduled and audited.
- [ ] Given a subject-access or correction request, when received, then a controlled export/redaction workflow handles it.
- [ ] Given any access or privacy action, when performed, then it is captured in the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: confidentiality-tier middleware + `document_standard_check` validation service; retention/disposal scheduler.
- [ ] Backend: subject-access export with redaction.
- [ ] Frontend: access banner, completeness checklist on closure, privacy-request handler.
- [ ] Rules/Config: per-country retention periods and lawful-basis tags.
- [ ] Alerts/Workflow: closure-blocked notification; retention-due alerts.
- [ ] Tests: integration (closure block + access logging), unit (retention scheduler).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
