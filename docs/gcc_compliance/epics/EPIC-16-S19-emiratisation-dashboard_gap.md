# Gap Analysis: EPIC-16-S19 — Emiratisation dashboard

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
A consolidated, RBAC-aware dashboard with target/achievement gauge, gap trend, checkpoint countdown, Nafis/fine exposure, evidence-completeness and open fake-Emiratisation flags, filterable by entity and period and drillable to source.

**Covers:** 16.21
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

- [ ] Given a UAE entity, when the dashboard loads, then achievement %, gap, checkpoint status and financial exposure render from live data.
- [ ] Given multi-entity, then a consolidated roll-up with per-entity drill-down is available.
- [ ] Given a tile, when clicked, then it drills to underlying employee/evidence records.
- [ ] Given RBAC, then financial and risk tiles respect role visibility.
- [ ] Given a period filter, then all tiles recompute for that period.

## Implementation Tasks From Backlog

- [ ] Backend: dashboard aggregation API.
- [ ] Frontend: Emiratisation dashboard with gauges, trends, drill-downs.
- [ ] Rules/Config: configurable thresholds for tile colour states (green/amber/red).
- [ ] Tests: e2e test of dashboard data and drill-downs.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
