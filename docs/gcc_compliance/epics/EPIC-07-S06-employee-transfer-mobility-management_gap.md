# Gap Analysis: EPIC-07-S06 — Employee transfer & mobility management

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** to manage internal and external immigration transfers/mobility with the correct authority process, **so that** sponsorship and permit changes are executed compliantly without illegal working gaps.

**Description**
Handle transfer scenarios: change of sponsor/establishment, inter-entity transfer, MOHRE work-permit transfer, KSA sponsorship transfer/Qiwa, freezone-to-mainland, and cross-emirate moves. Each transfer is a workflow with prerequisite checks (NOC, current-permit cancellation/transfer, no overlap), authority steps and evidence capture.

**Covers:** 7.8
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/dashboard/mobility/immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a transfer request, when initiated, then required prerequisites (e.g. NOC, no concurrent active permit) are checked and enforced.
- [ ] Given a sponsor change, when executed, then the old sponsorship is closed and the new permit linked with continuity of dates recorded.
- [ ] Given country rules, when a transfer type is not permitted (e.g. within ban period), then it is blocked with reason.
- [ ] Given a transfer, then PRO workflow steps and authority evidence are tracked to completion.
- [ ] Given audit, then full transfer history (from/to entity, dates, evidence) is logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_transfer` (employee_id, type, from_entity, to_entity, status, evidence) + workflow.
- [ ] Backend: prerequisite-check + continuity service.
- [ ] Frontend: transfer request + PRO processing screen.
- [ ] Rules/Config: country transfer rules & restrictions.
- [ ] Alerts/Workflow: PRO task routing + completion alerts.
- [ ] Tests: prerequisite, blocking, continuity tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
