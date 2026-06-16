# Gap Analysis: EPIC-17-S10 — Saudization workforce planning

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
A forward-looking planner modelling headcount growth, planned Saudi hires and attrition, and rising 2026–2028 thresholds, projecting ratio and band per period and showing the hires needed to reach a target band.

**Covers:** 17.12
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given growth and hire/attrition assumptions, when projected, then ratio and band per future period are forecast under the configured thresholds.
- [ ] Given a target band, when set, then the additional Saudi hires needed per period are computed.
- [ ] Given a scenario, when saved, then it compares against baseline.
- [ ] Given a projected band drop, then it is highlighted with the corrective hiring requirement.

## Implementation Tasks From Backlog

- [ ] Backend: `saudization_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedRatio[]`, `projectedBand[]`).
- [ ] Backend: projection engine over denominator growth + thresholds + hires/attrition.
- [ ] Frontend: scenario planner with baseline vs. scenario.
- [ ] Rules/Config: configurable growth and threshold assumptions.
- [ ] Tests: unit tests for multi-period ratio/band projection.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
