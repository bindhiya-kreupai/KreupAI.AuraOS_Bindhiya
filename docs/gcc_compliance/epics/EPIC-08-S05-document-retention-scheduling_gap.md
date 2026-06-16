# Gap Analysis: EPIC-08-S05 — Document retention scheduling

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** retention periods enforced per document type and country, **so that** records are kept for the statutory minimum and not disposed of prematurely (or held beyond limits).

**Description**
Assign retention rules by document category and country (e.g. payroll/wage records and contracts retained for statutory minimums post-separation), compute disposal-eligible dates, support legal/litigation hold that overrides disposal, and queue review/disposal with approval. Integrates with enterprise retention (EPIC-30).

**Covers:** 8.8
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/scheduling/fatigue/[employeeId]/route.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
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

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a document type/country, when retention resolves, then a retention period and earliest-disposal date are set.
- [ ] Given a separated employee, when retention starts, then disposal-eligible dates compute from the separation/event date.
- [ ] Given a litigation/legal hold, when active, then affected documents cannot be disposed regardless of schedule.
- [ ] Given disposal eligibility, when reached, then a review/approval task is queued (no automatic deletion without approval).
- [ ] Given audit, then retention assignment, holds and disposals are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `retention_rule` + `document_retention` (doc_id, retain_until, hold_flag, disposal_status).
- [ ] Backend: retention-calc + hold + disposal-approval service.
- [ ] Frontend: retention/hold management + disposal-review queue.
- [ ] Rules/Config: per-country/type retention periods.
- [ ] Alerts/Workflow: disposal-eligibility review tasks.
- [ ] Tests: retention calc + hold-override + approval tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
