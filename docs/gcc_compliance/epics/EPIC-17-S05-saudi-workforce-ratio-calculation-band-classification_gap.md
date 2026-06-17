# Gap Analysis: EPIC-17-S05 — Saudi workforce ratio calculation & band classification

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the Saudi workforce ratio computed against the correct denominator and mapped to a Nitaqat band, **so that** I always know our exact band and the distance to the next one.

**Description**
The core engine: builds the denominator (total counted employees per Nitaqat counting rules, applying part-time weighting and counted/non-counted categories), the numerator (eligible counted Saudis with weighting where applicable), computes the Saudization ratio, classifies the band, and shows headcount needed to reach/hold the next band. Denominator rules, weightings and bands are configurable per country in the rule engine.

**Covers:** 17.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an in-scope entity, when calculated, then the denominator applies Nitaqat counting rules (e.g., part-time weighting, excluded categories) and is drillable to employee level.
- [ ] Given the numerator and denominator, when computed, then the Saudization ratio and resulting band (Platinum/Green tier/Yellow/Red) are produced.
- [ ] Given the current band, when classified, then the additional/at-risk Saudi headcount to move up or avoid dropping a band is shown.
- [ ] Given weighting rules (e.g., special counting for certain Saudi categories), then they apply per config.
- [ ] Given country config, then denominator definition, weightings and bands are read from the rule engine, not hard-coded.

## Implementation Tasks From Backlog

- [ ] Backend: `saudization_calculation` entity (`entityId`, `period`, `denominator`, `numerator`, `ratio`, `band`, `nextBandGap`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with weighting and counted-category logic.
- [ ] Backend: band classification service against `nitaqat_band_config`.
- [ ] Frontend: ratio + band card with drill-down and next-band distance.
- [ ] Rules/Config: per-country denominator/weighting/band rules.
- [ ] Tests: golden-file tests for denominator membership and band boundaries.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
