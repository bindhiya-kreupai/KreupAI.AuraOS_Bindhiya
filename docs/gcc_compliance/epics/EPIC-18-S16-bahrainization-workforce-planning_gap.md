# Gap Analysis: EPIC-18-S16 — Bahrainization workforce planning

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
A forward-looking planner modelling headcount growth (including planned expat permits, which raise the denominator), planned Bahraini hires and attrition, projecting ratio per period and the Bahrainis needed to maintain target while accommodating expat growth.

**Covers:** 18.18
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

- [ ] Given growth and hire/attrition assumptions (including expat permit additions), when projected, then ratio per future period is forecast.
- [ ] Given a target ratio, when set, then additional Bahraini hires needed per period are computed.
- [ ] Given a scenario, when saved, then it compares against baseline.
- [ ] Given a projected drop below target, then it is highlighted with the corrective hiring requirement.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedRatio[]`).
- [ ] Backend: projection engine over denominator growth (incl. expats) + hires/attrition.
- [ ] Frontend: scenario planner with baseline vs. scenario.
- [ ] Rules/Config: configurable growth and target assumptions.
- [ ] Tests: unit tests for multi-period ratio projection.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
