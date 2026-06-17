# Gap Analysis: EPIC-18-S04 — Bahrainization ratio calculation against workforce denominator

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the Bahraini-employee ratio computed against the correct workforce denominator with the gap to target, **so that** I always know our exact position.

**Description**
The core engine: builds the denominator (total counted employees per Bahrainization counting rules, applying excluded categories), the numerator (eligible counted Bahrainis), computes the ratio, compares to the target, and shows the headcount gap to reach/hold the target. Denominator rules and targets are configurable per country in the rule engine.

**Covers:** 18.6
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

- [ ] Given an in-scope entity, when calculated, then denominator = counted employees per configured rules (excluded categories removed) and is drillable to employee level.
- [ ] Given numerator and denominator, when computed, then the Bahrainization ratio, target comparison and headcount gap are produced.
- [ ] Given a fractional requirement, when rounded, then the configured rounding rule is applied and shown.
- [ ] Given a recalculation, then numerator/denominator membership lists are persisted for drill-down.
- [ ] Given country config, then denominator definition and target are read from the rule engine, not hard-coded.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_calculation` entity (`entityId`, `period`, `denominator`, `numerator`, `ratio`, `target`, `gap`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with counted-category logic.
- [ ] Backend: ratio + gap calculation service with configurable rounding.
- [ ] Frontend: ratio + target card with drill-down to counted-employee lists.
- [ ] Rules/Config: per-country denominator definition, target and rounding.
- [ ] Tests: golden-file tests for denominator membership and gap edge cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
