# Gap Analysis: EPIC-08-S10 — Record change management (maker-checker) & records workflow

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8

**Description**
Provide a configurable records workflow engine where material changes (master-data edits, sensitive ESS updates, document removals) are proposed by a maker and approved by a checker (preparer ≠ approver), with effective-dating, reason capture and full before/after history. Supports bulk changes with batch approval and rollback.

**Covers:** 8.13, 8.17
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a material change, when proposed, then it enters a pending state requiring a different approver (preparer ≠ approver).
- [ ] Given approval, when granted, then the change applies with effective date and is recorded with before/after values.
- [ ] Given rejection, then the change is discarded with reason and the record unchanged.
- [ ] Given a bulk change, when submitted, then it routes for batch approval and applies atomically.
- [ ] Given a configurable workflow, then routing varies by change type/entity.
- [ ] Given audit, then full change history (maker, checker, reason, values) is retained and exportable.

## Implementation Tasks From Backlog

- [ ] Backend: `record_change_request` (entity, field, old, new, maker, checker, effective_date, status) + workflow engine.
- [ ] Backend: maker-checker enforcement + bulk/rollback service.
- [ ] Frontend: change-request submission + approver console.
- [ ] Rules/Config: configurable change-type routing per entity.
- [ ] Alerts/Workflow: approval notifications + escalation.
- [ ] Tests: maker-checker, effective-dating, bulk/rollback tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
