# Gap Analysis: EPIC-08-S07 — Access control (RBAC/ABAC) for records

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** granular role- and attribute-based access control over records, **so that** users see and edit only the records and fields appropriate to their role, entity and need-to-know.

**Description**
Implement RBAC/ABAC scoping records by role (HR Admin, Payroll, PRO, Line Manager, Employee, Auditor), organisational scope (entity/department/country) and field sensitivity. Line Managers see only their team; Auditors get read-only with full logging; employees see only their own record. Includes field-level edit permissions and segregation of duties.

**Covers:** 8.10
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/documents/access-control/page.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/performance/tests/employee-load.test.js
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a user's role and org scope, when they access records, then only in-scope employees/fields are visible.
- [ ] Given a Line Manager, when browsing, then only direct/indirect reports are accessible.
- [ ] Given an Auditor, then access is read-only and every view is logged.
- [ ] Given field-level permissions, when a user lacks edit rights, then the field is read-only/masked.
- [ ] Given segregation of duties, then conflicting permissions (e.g. edit + approve own change) are prevented.
- [ ] Given any access decision, then it is enforced server-side and logged.

## Implementation Tasks From Backlog

- [ ] Backend: RBAC/ABAC policy model (role, scope, field-sensitivity) + enforcement middleware.
- [ ] Backend: SoD rule checks + access-decision logging.
- [ ] Frontend: scope-aware record lists + permission-aware field rendering.
- [ ] Rules/Config: role-permission matrix per entity/country.
- [ ] Tests: scope, field-permission, SoD enforcement tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
