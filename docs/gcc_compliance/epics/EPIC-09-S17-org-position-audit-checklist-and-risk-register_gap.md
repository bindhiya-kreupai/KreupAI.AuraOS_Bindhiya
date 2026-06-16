# Gap Analysis: EPIC-09-S17 — Org & position audit checklist and risk register

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3

**Description**
Provide a configurable audit checklist (e.g., positions without cost centers, off-band salaries, orphan reporting lines, over-establishment) and a risk register capturing common org/position risks with likelihood/impact, owner and remediation status, plus the key-takeaways reference.

**Covers:** 9.18, 9.19, 9.22
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given the audit checklist, when run, then it flags red-flag conditions (orphan positions, missing cost center, over-establishment, off-band pay, circular reporting).
- [ ] Given a finding, when raised, then it is logged in the risk register with severity, owner and due date.
- [ ] Given a risk register, when reviewed, then likelihood × impact scoring and status are tracked to closure.
- [ ] Given checklist items, when configured, then they are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: audit-rule engine over org/position data + `org_risk_register` schema
- [ ] Frontend: audit checklist runner + risk register board
- [ ] Rules/Config: configurable red-flag rules and risk scoring matrix
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection and register lifecycle

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
