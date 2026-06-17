# Gap Analysis: EPIC-27-S02 — Resignation Compliance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5

**Description**
Implements employee-initiated resignation: submission with intended last day, manager/HR acceptance, notice-period validation per country/contract, options for notice buyout/waiver, withdrawal-before-acceptance handling, and creation of a separation case feeding clearance and final settlement.

**Covers:** 27.6
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

- [ ] Given a resignation, when submitted, then the required notice period is validated against country/contract and the last working day is computed.
- [ ] Given a shortfall in notice, when present, then notice buyout/recovery or mutual waiver is captured per policy.
- [ ] Given manager/HR acceptance, when recorded, then the resignation is locked and downstream workflow starts.
- [ ] Given withdrawal before acceptance, when requested, then it is allowed and audited.
- [ ] Given any resignation event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `resignation` (intended_last_day, notice_required, notice_served, buyout) entity + notice-validation service.
- [ ] Backend: acceptance/withdrawal state machine.
- [ ] Frontend: resignation submission + manager acceptance screens.
- [ ] Rules/Config: per-country/contract notice periods and buyout rules.
- [ ] Alerts/Workflow: acceptance routing + downstream trigger.
- [ ] Tests: integration (notice validation + acceptance), unit (withdrawal).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
