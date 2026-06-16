# Gap Analysis: EPIC-17-S19 — Nitaqat dashboard

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
A consolidated, RBAC-aware dashboard with a band indicator (Platinum/Green tiers/Yellow/Red), ratio gauge, next-band distance, 2026–2028 outlook, certificate/expiry status, evidence-completeness and open artificial-Saudization flags, filterable by entity/period and drillable to source.

**Covers:** 17.21
**Acceptance criteria count:** 5 · **Task count:** 4

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

- [ ] Given a KSA entity, when the dashboard loads, then ratio, band, next-band distance and certificate status render from live data.
- [ ] Given multi-entity, then a consolidated roll-up with per-entity drill-down is available.
- [ ] Given a tile, when clicked, then it drills to underlying employee/evidence records.
- [ ] Given RBAC, then risk/financial tiles respect role visibility.
- [ ] Given a period filter, then tiles recompute for that period.

## Implementation Tasks From Backlog

- [ ] Backend: dashboard aggregation API.
- [ ] Frontend: Nitaqat dashboard with band indicator, gauges, projections, drill-downs.
- [ ] Rules/Config: configurable colour states aligned to bands.
- [ ] Tests: e2e test of dashboard data and drill-downs.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
