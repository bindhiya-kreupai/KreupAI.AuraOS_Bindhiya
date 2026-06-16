# Gap Analysis: EPIC-08-S11 — Employee record audit & audit checklist

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5

**Description**
Provide an immutable audit log explorer (who viewed/changed what, when) and a configurable Employee Records Audit Checklist (mandatory documents present, valid/non-expired, access appropriately restricted, retention applied, change-management evidence) that auto-evaluates on a sample and routes failures to corrective action.

**Covers:** 8.14, 8.18
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

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit log, when queried by employee/user/date/action, then matching access and change events return with full context.
- [ ] Given the audit checklist, when run on a sample, then each control is auto-evaluated where data exists and gaps flagged.
- [ ] Given a failed control (e.g. missing mandatory document, retention not applied), then it routes to corrective action/risk register.
- [ ] Given export, then audit results and logs export for review with timestamp.
- [ ] Given RBAC, then auditors have read-only access and their queries are themselves logged.

## Implementation Tasks From Backlog

- [ ] Backend: audit-log query API + `records_audit_check` definitions + evaluation service.
- [ ] Backend: auto-evaluation rules + corrective-action linkage.
- [ ] Frontend: audit-log explorer + checklist runner.
- [ ] Rules/Config: configurable audit controls.
- [ ] Tests: log-query + auto-evaluation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
