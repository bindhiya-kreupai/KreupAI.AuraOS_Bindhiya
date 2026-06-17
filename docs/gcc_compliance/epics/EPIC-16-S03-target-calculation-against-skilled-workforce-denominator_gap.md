# Gap Analysis: EPIC-16-S03 — Target calculation against skilled-workforce denominator

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the system to compute the required number of UAE nationals against the skilled-workforce denominator, **so that** I always know the exact target and current gap.

**Description**
The core target engine. It builds the denominator (skilled-category employees per MOHRE skill-level rules), the numerator (eligible counted UAE nationals), and computes required count, current count, achievement % and headcount gap. Targets/rates are configurable per country and per period in the rule engine (e.g., +2% skilled-national growth per year, fractional rounding rules).

**Covers:** 16.5
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

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an in-scope entity, when target runs, then denominator = skilled employees per configured skill-level classification, excluding non-counting categories.
- [ ] Given the configured growth rate and rounding rule, when computed, then required UAE-national count and the gap (required − current) are produced.
- [ ] Given a fractional requirement, when rounded, then the configured rounding rule (e.g., round up at 0.5) is applied and shown.
- [ ] Given a recalculation, then numerator/denominator membership lists are persisted so any number can be drilled to employee level.
- [ ] Given country config, then target rate and denominator definition are read from the rule engine, not hard-coded.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_target` entity (`entityId`, `period`, `denominator`, `requiredCount`, `currentCount`, `gap`, `achievementPct`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with skilled-category classification logic.
- [ ] Backend: target calculation service with configurable rate + rounding.
- [ ] Frontend: target summary card with drill-down to counted-employee lists.
- [ ] Rules/Config: per-country growth rate, denominator definition, rounding rule.
- [ ] Tests: unit tests for rounding/edge cases; golden-file test of denominator membership.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
