# Gap Analysis: EPIC-08-S02 — Employee master data model & maintenance

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 13

**Description**
Define the canonical master-data domains (personal, contact, identification, nationality/visa status, job/position/grade, contract, compensation reference, bank/IBAN, dependents reference, social-insurance reference, emergency contact). Maintenance is field-validated, country-aware and emits change events so downstream modules stay in sync.

**Covers:** 8.4
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useToast.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a master-data edit, when saved, then field-level validations (formats, ranges, country-mandatory fields) are enforced.
- [ ] Given a change to a propagated field (e.g. IBAN, job title), then a `employee.master.updated` event is published for subscribers.
- [ ] Given country context, then country-specific fields (Emirates ID/Iqama/CPR/QID, nationality, sponsor) are required/validated.
- [ ] Given a field with downstream impact, then dependent records (payroll, immigration) are flagged for review.
- [ ] Given RBAC, then field visibility/edit rights follow role and sensitivity class.
- [ ] Given any change, then before/after values, actor and timestamp are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: master-data schema/domains + validation service; migration.
- [ ] Backend: change-event publisher + downstream-impact flagging.
- [ ] Frontend: master-data view/edit with sensitivity-aware fields.
- [ ] Rules/Config: country mandatory-field + validation rules.
- [ ] Tests: validation + event-publish + audit tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
