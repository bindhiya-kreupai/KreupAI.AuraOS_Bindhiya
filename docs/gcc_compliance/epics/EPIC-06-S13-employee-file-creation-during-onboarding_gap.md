# Gap Analysis: EPIC-06-S13 — Employee file creation during onboarding

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
As onboarding documents are collected, auto-classify and file them into the standard employee file structure (personal, identification, contractual, immigration, payroll, benefits, policy). Compute an onboarding-time completeness indicator and hand the file to the records module (EPIC-08) on completion.

**Covers:** 6.15
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

- [ ] Given an uploaded onboarding document, when filed, then it is classified into the correct file section with metadata (type, expiry, country).
- [ ] Given the mandatory-document set for the country/type, when computed, then missing items are listed and a completeness % shown.
- [ ] Given onboarding completion, then the file is marked active and ownership passes to the records module.
- [ ] Given RBAC, then file access follows record-access rules.
- [ ] Given any filing/reclassification, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: link onboarding documents to `employee_file_section`; completeness calc service.
- [ ] Backend: file-handover event to EPIC-08.
- [ ] Frontend: employee file view within onboarding case.
- [ ] Rules/Config: country/type mandatory-document set.
- [ ] Tests: classification + completeness tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
