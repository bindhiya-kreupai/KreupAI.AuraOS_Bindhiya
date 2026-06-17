# Gap Analysis: EPIC-27-S09 — Exit Clearance Orchestration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 8

**Description**
Orchestrates a multi-department clearance checklist (IT, Finance, Admin/Assets, Line Manager, HR, Accommodation, Library/other) with per-item status, blocking dependencies, escalation for pending items, and a gate that prevents final-settlement release until clearance is complete or exceptions are approved.

**Covers:** 27.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/components/hr/ExitClearanceTracker.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation case, when clearance starts, then department checklist items are auto-generated and routed to owners.
- [ ] Given clearance items, when owners respond, then statuses (cleared/pending/recovery-required) are tracked with attachments.
- [ ] Given any item requiring recovery (asset/dues), when flagged, then the amount feeds deductions/recoveries.
- [ ] Given incomplete clearance, when final settlement is attempted, then release is blocked unless an exception is approved.
- [ ] Given any clearance action, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `exit_clearance`, `clearance_item` (department, status, recovery_amount) entities + auto-generation service.
- [ ] Backend: settlement-release gate + recovery feed.
- [ ] Frontend: clearance dashboard per case + department response screens.
- [ ] Rules/Config: configurable department checklist per country/entity.
- [ ] Alerts/Workflow: routing + pending-item escalation.
- [ ] Tests: integration (gate enforcement), unit (recovery feed).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
