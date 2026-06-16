# Gap Analysis: EPIC-09-S12 — Organization change management (maker-checker)

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Provide an Org Change Request (OCR) workflow covering create/move/merge/split/abolish of units and positions, with impact preview, maker-checker approval, effective-dating and bulk apply, preventing ad-hoc structural drift.

**Covers:** 9.14, 9.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/lib/services/organization/**tests**/department.service.test.ts
- apps/web/src/lib/services/organization/department.service.ts
- apps/web/src/app/(modules)/core-hr/organization-structure/page.tsx
- apps/web/src/app/api/core-hr/organization/route.ts
- apps/web/src/app/dashboard/core-hr/organization-structure/page.tsx
- apps/web/src/lib/services/organization/**tests**/position.service.test.ts
- apps/web/src/lib/services/organization/position.service.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an OCR, when submitted, then the preparer cannot self-approve (maker ≠ checker) and it routes per DoA.
- [ ] Given a proposed change, when previewed, then impacted positions, incumbents, cost centers and reporting lines are listed before approval.
- [ ] Given approval, when applied, then changes take effect on the stated effective date and prior structure is versioned.
- [ ] Given a rejected OCR, when returned, then comments are captured and no structural change occurs.
- [ ] Given any OCR action, when performed, then it is fully audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `org_change_request` schema (`ocr_id`, `change_type`, `payload`, `effective_date`, `status`, `maker_id`, `checker_id`)
- [ ] Backend: impact-analysis + bulk-apply transaction service
- [ ] Frontend: OCR wizard with impact preview and approval timeline
- [ ] Alerts/Workflow: maker-checker routing via DoA + notifications
- [ ] Tests: e2e tests for maker≠checker enforcement and effective-dated apply

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
