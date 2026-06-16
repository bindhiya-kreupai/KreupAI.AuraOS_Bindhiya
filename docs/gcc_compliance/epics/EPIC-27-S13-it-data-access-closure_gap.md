# Gap Analysis: EPIC-27-S13 — IT & Data Access Closure

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** automated IT and data-access revocation at separation, **so that** the leaver loses access on time and corporate data is protected.

**Description**
Coordinates IT/data-access closure: account disablement and access-revocation scheduling aligned to last working day/garden leave, asset/device return tracking, data-handover, and mailbox/forwarding handling, with confirmation feeding clearance and audit.

**Covers:** 27.23
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation with a last working day, when reached (or garden leave starts), then access-revocation tasks are scheduled and tracked to confirmation.
- [ ] Given immediate-risk dismissals, when flagged, then access can be revoked immediately ahead of formalities.
- [ ] Given assets/devices, when due for return, then return status feeds exit clearance and recoveries.
- [ ] Given mailbox/data handover, when configured, then forwarding/archival actions are recorded.
- [ ] Given any IT-closure event, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `it_access_closure`, `asset_return` entities + scheduled revocation triggers (event bus to IT/IdP).
- [ ] Backend: immediate-revocation path + clearance/recovery feed.
- [ ] Frontend: IT-closure checklist within case.
- [ ] Rules/Config: revocation timing rules (last day vs garden leave vs immediate).
- [ ] Alerts/Workflow: revocation task routing + overdue alerts.
- [ ] Tests: integration (scheduled revocation), unit (immediate path).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
