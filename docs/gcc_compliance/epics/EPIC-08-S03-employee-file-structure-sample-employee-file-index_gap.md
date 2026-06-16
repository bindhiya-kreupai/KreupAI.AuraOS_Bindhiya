# Gap Analysis: EPIC-08-S03 — Employee file structure & Sample Employee File Index

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Define the standard file structure (sections such as Personal & Identification, Recruitment & Offer, Contract, Immigration, Payroll & Bank, Benefits & Insurance, Leave & Attendance, Performance, Disciplinary, Training, Separation). Each section holds typed documents with metadata. Provide the Sample Employee File Index (section 8.20) as a configurable, auto-generated index/table of contents with export.

**Covers:** 8.5, 8.20
**Acceptance criteria count:** 6 · **Task count:** 5

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

- [ ] Given an employee, when the file opens, then the configured section structure renders with documents under each section.
- [ ] Given a document upload, when filed, then it is classified into the correct section with metadata (type, country, issue/expiry, sensitivity).
- [ ] Given the file index, when generated, then a structured index/TOC lists sections and contained documents with status.
- [ ] Given a structure-config change, then it applies to new files while existing files migrate/map safely.
- [ ] Given an index export, then a PDF/Excel file index is produced and timestamped.
- [ ] Given any filing action, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `employee_file_section` + `employee_document` (section_id, type, metadata, sensitivity); migration.
- [ ] Backend: classification + index-generation/export service.
- [ ] Frontend: employee file viewer with sectioned tabs + index/export.
- [ ] Rules/Config: configurable file-structure template per entity.
- [ ] Tests: classification + index generation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
