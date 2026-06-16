# Gap Analysis: EPIC-08-S04 — Mandatory document matrix & country-specific considerations

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a country/nationality/employment-type-driven mandatory-document matrix, **so that** every employee file holds exactly the documents their jurisdiction requires.

**Description**
Configure the mandatory-document matrix: which documents are required by country, nationality (national vs expat), employment type and entity (e.g. UAE: passport, Emirates ID, residence visa, labour card, signed MOHRE contract; KSA: Iqama, Qiwa contract, GOSI; Bahrain: CPR, LMRA permit). Country-specific considerations (attestation, Arabic contract, authority-registered contract) drive required/conditional items and validity rules.

**Covers:** 8.6, 8.7
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an employee's country/nationality/type, when the matrix resolves, then required and conditional documents are determined.
- [ ] Given a UAE expat, then passport, residence visa, Emirates ID, labour card and signed authority contract are required.
- [ ] Given a KSA national, then Iqama is not required but national ID and GOSI registration are, per matrix.
- [ ] Given country considerations (e.g. attestation/Arabic contract), then those validity rules are enforced on the relevant documents.
- [ ] Given a missing/expired mandatory document, then it is flagged and feeds the completeness score.
- [ ] Given audit, then the matrix version applied per employee is traceable.

## Implementation Tasks From Backlog

- [ ] Backend: `mandatory_document_matrix` (country, nationality, emp_type, doc_type, required, conditions) + resolver.
- [ ] Backend: requirement-evaluation service feeding completeness/flags.
- [ ] Frontend: matrix configuration UI + per-employee requirement view.
- [ ] Rules/Config: seed GCC matrices + country considerations (attestation, Arabic/authority contract).
- [ ] Tests: matrix resolution per country/nationality/type tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
