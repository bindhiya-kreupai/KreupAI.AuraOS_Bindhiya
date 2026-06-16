# Gap Analysis: EPIC-09-S09 — Reporting hierarchy management

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Maintain primary and dotted-line reporting relationships at position level, derive the live org chart, detect cycles, and expose the hierarchy as the routing source for workflows across modules.

**Covers:** 9.11
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/positions/hierarchy/route.ts
- apps/web/src/app/dashboard/org-design/position-hierarchy/page.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a position, when a reports-to relationship is set, then circular reporting is detected and rejected.
- [ ] Given an incumbent change, when a new employee fills a manager position, then all reports automatically resolve to the new manager.
- [ ] Given a request for the org chart, when rendered, then both solid and dotted-line relationships are shown as of any date.
- [ ] Given a vacant manager position, when reports exist, then they escalate to the next valid level for approvals.

## Implementation Tasks From Backlog

- [ ] Backend: `reporting_relationship` schema (position-to-position, type solid/dotted)
- [ ] Backend: cycle-detection + next-valid-manager resolution service
- [ ] Frontend: interactive org chart with reporting lines
- [ ] Alerts/Workflow: expose hierarchy as approval-routing provider
- [ ] Tests: unit tests for cycle detection and vacant-manager escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
