# Gap Analysis: EPIC-06-S17 — Sample Employee Joining Form (configurable digital form)

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5

**Description**
Build a configurable Employee Joining Form (personal, contact, emergency contact, identification, dependents, bank/IBAN, declarations and signature) rendered as a digital ESS form with country-specific fields. Submission pre-populates master-data drafting, and a PDF export is stored in the employee file.

**Covers:** 6.22
**Acceptance criteria count:** 5 · **Task count:** 5

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

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a country/entity, when the joining form renders, then country-specific fields and validations apply (e.g. Emirates ID/Iqama/CPR, IBAN format).
- [ ] Given the new hire submits, then validated data maps into the master-data draft.
- [ ] Given submission, then a PDF/export of the form is generated and filed with timestamp and signature.
- [ ] Given a form-definition change, then versioning preserves prior submissions' layout.
- [ ] Given audit, then the submitted form and its version are retrievable.

## Implementation Tasks From Backlog

- [ ] Backend: `joining_form_def` + `joining_form_submission` with versioning.
- [ ] Backend: form-to-master-data mapping + PDF export service.
- [ ] Frontend: configurable form builder + ESS form renderer.
- [ ] Rules/Config: country field sets & validations (ID formats, IBAN).
- [ ] Tests: validation, mapping and export tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
