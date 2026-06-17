# Gap Analysis: EPIC-28-S06 — Resignation vs Termination Impact Engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the EOSB result adjusted automatically for separation type and reason (resignation, termination, mutual, redundancy, abandonment, retirement, death), **so that** statutory reductions and forfeitures are applied correctly and defensibly.

**Description**
Adds the separation-impact layer over the formula engine: per country and separation type, configurable rules determine whether the full entitlement applies, a reduced fraction applies (e.g. KSA resignation bands, Kuwait fractional bands), or entitlement is forfeited (e.g. dismissal for gross misconduct under defined articles). Pulls the separation type/reason from EPIC-27 and applies the right multiplier/treatment, with the reasoning shown in the breakdown so it can be justified in a dispute.

**Covers:** 28.13
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

- [ ] Given a separation type and reason from EPIC-27, when EOSB runs, then the configured per-country treatment (full / reduced fraction / forfeit) is applied.
- [ ] Given a Saudi resignation, when service falls in a band, then the corresponding fraction is applied; given Kuwait resignation, then the Kuwait fractional band is applied.
- [ ] Given a dismissal for a forfeiting reason (configurable), when computed, then entitlement is reduced/forfeited per the configured article and clearly flagged.
- [ ] Given a redundancy/termination-by-employer, when computed, then no resignation reduction applies.
- [ ] Given the adjustment, then the reason, rule reference and multiplier are shown in the breakdown and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_separation_treatment` config (countryCode, separationType, reasonCode, treatment, fraction, ruleRef, effectiveFrom)
- [ ] Backend: separation-impact resolver layered over the formula engine
- [ ] Backend: consumer of EPIC-27 separation type/reason
- [ ] Frontend: treatment-matrix config + breakdown display of applied treatment
- [ ] Rules/Config: seed per-country resignation/termination/forfeit treatments
- [ ] Tests: unit tests across separation types/reasons per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
