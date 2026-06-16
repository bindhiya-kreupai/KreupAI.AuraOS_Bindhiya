# Gap Analysis: EPIC-27-S04 — Mutual Separation & Settlement Agreement

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 3

**Description**
Supports mutually agreed separation: capture negotiated terms (effective date, ex-gratia/settlement amount, waiver/release clauses), route for approval, generate a settlement agreement for e-signature, and feed agreed amounts into final settlement.

**Covers:** 27.8
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

- [ ] Given a mutual separation, when created, then negotiated terms and effective date are captured.
- [ ] Given terms, when approved, then a settlement agreement is generated for e-signature by both parties.
- [ ] Given e-signature completion, when recorded, then agreed amounts flow into final settlement.
- [ ] Given a release/waiver clause, when included, then it is stored and surfaced in the case file.
- [ ] Given any mutual-separation event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `mutual_separation` (terms, settlement_amount, waiver) entity + agreement generator.
- [ ] Backend: e-signature integration + settlement feed.
- [ ] Frontend: mutual-separation terms + agreement screens.
- [ ] Rules/Config: approval thresholds for settlement amounts per country/entity.
- [ ] Alerts/Workflow: approval + signature reminders.
- [ ] Tests: integration (agreement→settlement), unit (waiver capture).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
