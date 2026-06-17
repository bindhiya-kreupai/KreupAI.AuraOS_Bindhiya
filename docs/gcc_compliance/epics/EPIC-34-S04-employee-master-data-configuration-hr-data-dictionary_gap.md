# Gap Analysis: EPIC-34-S04 — Employee master data configuration & HR data dictionary

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8

**Description**
Configure the employee master-data model — field catalogue, data types, mandatory/optional by country and employee category, validation rules (Emirates ID, Iqama, CPR, QID, IBAN, passport), and the governing **HR Data Dictionary/glossary** that defines every field, code list and term as the single configuration reference for the platform. The dictionary is the canonical source for field meaning, allowed values and country applicability.

**Covers:** 34.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
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

- add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given the master-data catalogue, when configured, then each field has a data-dictionary definition (name, meaning, type, allowed values, country applicability, sensitivity).
- [ ] Given a country/employee category, when selected, then mandatory fields (e.g., Emirates ID for UAE, Iqama for KSA, CPR for Bahrain, QID for Qatar) are enforced.
- [ ] Given an ID field, when entered, then format/checksum validation per country is applied.
- [ ] Given the data dictionary, when browsed, then any field/code list/term resolves to its definition and is exportable as a reference.
- [ ] Given a dictionary or field change, when published, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `master_data_field`, `code_list`, `data_dictionary_term` schemas with country applicability and sensitivity tags
- [ ] Backend: country ID-format validators (Emirates ID, Iqama, CPR, QID, IBAN, passport)
- [ ] Frontend: master-data configuration screen + searchable HR data dictionary/glossary
- [ ] Rules/Config: mandatory-field-by-country/category matrix
- [ ] Tests: unit tests for ID validation and mandatory-field enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
