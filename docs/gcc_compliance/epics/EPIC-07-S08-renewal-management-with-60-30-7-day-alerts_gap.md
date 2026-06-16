# Gap Analysis: EPIC-07-S08 — Renewal management with 60/30/7-day alerts

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**User story:** PRO / Immigration Officer, **I want** automated renewal management with tiered pre-expiry alerts and workflow, **so that** no work permit, residence visa, Emirates ID, Iqama, CPR or QID lapses.

**Description**
For every dated document (employee and dependent), generate renewal tasks and fire alerts at 60, 30 and 7 days before expiry (configurable), escalating as the deadline nears. A renewal workflow tracks document collection, authority submission, fee, and re-issuance, then supersedes the old document and recomputes status. Overdue renewals raise critical risk flags.

**Covers:** 7.10
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a document with an expiry date, when 60/30/7 days remain, then alerts fire to PRO/HR/employee with escalating severity.
- [ ] Given the 7-day or post-expiry stage, when unresolved, then a critical risk flag is raised on the dashboard and risk matrix.
- [ ] Given a renewal workflow, when completed, then the new document supersedes the old and history is retained with continuity dates.
- [ ] Given country renewal lead-times, when configured, then alert offsets adjust accordingly.
- [ ] Given RBAC, then only PRO/immigration roles can close a renewal task.
- [ ] Given audit, then alert dispatch and renewal steps are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `renewal_task` (document_id, due_date, stage, status) + scheduler computing 60/30/7 alerts.
- [ ] Backend: renewal workflow + supersession service.
- [ ] Frontend: renewal pipeline board + PRO action screen.
- [ ] Rules/Config: per-country/document alert offsets & lead-times.
- [ ] Alerts/Workflow: tiered notifications + escalation + critical-flag emission.
- [ ] Tests: alert-timing, escalation, supersession integration tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
