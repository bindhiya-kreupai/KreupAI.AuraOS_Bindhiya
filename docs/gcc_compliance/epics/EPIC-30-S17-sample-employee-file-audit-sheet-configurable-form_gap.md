# Gap Analysis: EPIC-30-S17 — Sample Employee File Audit Sheet (Configurable Form)

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3

**Description**
Provides a digital, template-driven Employee File Audit Sheet for a given employee: lists each required document (per the mandatory document matrix / record categories), its presence/absence, document date, retain-until date, sensitivity, expiry status and any gaps, with an auditor scoring and notes column. Configurable per entity/country, exports to PDF and attaches to the audit run and monthly pack.

**Covers:** 30.35
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/(modules)/employee-profile/page.tsx
- apps/web/src/components/directory/EmployeeProfileCard.tsx
- apps/web/src/components/profile/EmployeeProfileEditor.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/contract/consumer/employee-api.consumer.test.ts
- apps/web/src/**tests**/contract/provider/employee-api.provider.test.ts
- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an employee, when generated, then the sheet auto-lists required documents with present/absent status, date, retain-until, sensitivity and gaps.
- [ ] Given each line, when audited, then the auditor records Pass/Fail/NA, notes and evidence link, contributing to the file-completeness score.
- [ ] Given the template, when configured, then required-document set, header/footer and EN/AR layout are editable per entity/country without code.
- [ ] Given the sheet, then it exports to PDF and attaches to the audit run and monthly pack.
- [ ] Given any audit-sheet action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: file-audit-sheet template engine bound to mandatory-doc matrix + record store
- [ ] Backend: completeness scoring + PDF export + attachment links
- [ ] Frontend: audit-sheet runner + template editor (EN/AR)
- [ ] Rules/Config: per-entity/country required-document set
- [ ] Tests: unit test for auto-population and completeness scoring

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
