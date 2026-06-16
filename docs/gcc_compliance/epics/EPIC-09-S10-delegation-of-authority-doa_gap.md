# Gap Analysis: EPIC-09-S10 — Delegation of authority (DoA)

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable delegation-of-authority matrix, **so that** approvals (requisitions, org changes, salary actions) route to the authorized role within defined limits.

**Description**
Define DoA rules by transaction type, monetary/headcount threshold, org level and country, with temporary delegation (acting/out-of-office) and expiry, consumed by the workflow engine for all approvals.

**Covers:** 9.12
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a transaction with a value, when submitted, then it routes to the approver whose DoA limit covers that value at that org level.
- [ ] Given an approver on leave, when a temporary delegation is active, then approvals route to the delegate only within the delegation's validity window and limits.
- [ ] Given a transaction exceeding all configured limits, when submitted, then it escalates to the top authority and is flagged.
- [ ] Given any delegation create/change, when saved, then it is audit-logged with effective and expiry dates.

## Implementation Tasks From Backlog

- [ ] Backend: `doa_rule` schema (`transaction_type`, `threshold`, `org_level`, `approver_role`, `country_code`) + `delegation` (acting) table
- [ ] Backend: DoA resolution service integrated with workflow engine
- [ ] Frontend: DoA matrix configuration + delegation setup screen
- [ ] Rules/Config: per-country and per-transaction threshold tables
- [ ] Alerts/Workflow: route approvals via DoA + delegation expiry alerts
- [ ] Tests: integration tests for threshold routing and temporary delegation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
