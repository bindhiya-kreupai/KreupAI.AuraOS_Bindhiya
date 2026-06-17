# Gap Analysis: EPIC-17-S16 — Nitaqat KPIs

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
Computes Saudization ratio, current band, distance to next band, Saudi headcount, Saudi attrition, profession-localization compliance %, % counted Saudis with full evidence and artificial-Saudization flag count, per entity and consolidated, period-comparable.

**Covers:** 17.18
**Acceptance criteria count:** 4 · **Task count:** 4

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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a period, when KPIs compute, then ratio, band, next-band distance, Saudi headcount/attrition and evidence-completeness % are produced.
- [ ] Given multiple entities, then KPIs roll up and drill back to entity.
- [ ] Given period-over-period, then trend deltas are shown.
- [ ] Given each KPI, then its definition and source are documented in-product.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service with period snapshots.
- [ ] Backend: `nitaqat_kpi_snapshot` entity.
- [ ] Frontend: KPI tiles with band and trend indicators.
- [ ] Tests: unit tests for KPI formulas.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
