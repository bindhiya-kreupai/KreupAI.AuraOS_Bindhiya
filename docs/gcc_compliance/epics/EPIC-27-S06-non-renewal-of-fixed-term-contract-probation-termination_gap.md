# Gap Analysis: EPIC-27-S06 — Non-Renewal of Fixed-Term Contract & Probation Termination

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
Handles fixed-term non-renewal (expiry tracking, non-renewal notice within statutory window, EOSB treatment for completed term) and probation termination (within probation window, reduced/specified notice, country probation rules), each driving clearance and settlement.

**Covers:** 27.10, 27.11
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

- [ ] Given a fixed-term contract nearing expiry, when within the notice window, then non-renewal notice is prompted and tracked (e.g. alerts at 60/30 days before expiry).
- [ ] Given non-renewal, when finalised, then EOSB/end-of-term treatment is applied per country.
- [ ] Given a probation termination, when initiated, then it is validated to be within the probation period and the correct notice rule applies.
- [ ] Given probation rules per country, when applied, then notice/eligibility differences are enforced.
- [ ] Given any non-renewal/probation event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `contract_non_renewal`, `probation_termination` entities + expiry/probation-window validators.
- [ ] Backend: EOSB-treatment flagging for each path.
- [ ] Frontend: non-renewal and probation-termination screens.
- [ ] Rules/Config: per-country probation periods, notice windows and EOSB treatment.
- [ ] Alerts/Workflow: contract-expiry alerts (60/30 days) + notice prompts.
- [ ] Tests: integration (window validation), unit (notice rules).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
