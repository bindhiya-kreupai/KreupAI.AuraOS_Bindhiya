# Gap Analysis: EPIC-18-S18 — Bahrainization KPIs, risk matrix & dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8

**Description**
Combines (a) KPIs (ratio, gap to target, Bahraini headcount, Bahraini attrition, permit-quota headroom, % counted Bahrainis with full evidence, artificial-Bahrainization flag count), (b) a configurable likelihood × impact risk matrix (shortfall, artificial-Bahrainization exposure, attrition, certificate expiry, permit-block risk) rendered as a heatmap, and (c) an RBAC-aware dashboard showing ratio vs. target, permit/tender eligibility, certificate status and open flags, filterable by entity/period and drillable to source.

**Covers:** 18.20, 18.21, 18.23
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given a period, when KPIs compute, then ratio, gap, Bahraini headcount/attrition, permit-quota headroom and evidence-completeness % are produced with trend deltas.
- [ ] Given a risk, when scored, then likelihood × impact yields a rating on the heatmap, and linked data (open flags, projected shortfall) updates risks automatically.
- [ ] Given the dashboard, then ratio vs. target, permit/tender eligibility, certificate status and open artificial-Bahrainization flags render from live data with per-entity roll-up and drill-down.
- [ ] Given RBAC, then risk/permit tiles respect role visibility.
- [ ] Given config, then KPI thresholds, risk scales and dashboard colour states are editable.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + `bahrainization_kpi_snapshot` entity.
- [ ] Backend: `bahrainization_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`) and dashboard aggregation API.
- [ ] Frontend: KPI tiles, risk heatmap and Bahrainization dashboard with drill-downs.
- [ ] Rules/Config: configurable KPI thresholds, risk scales and colour states.
- [ ] Tests: unit tests for KPI/risk formulas; e2e test of dashboard data and drill-downs.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
