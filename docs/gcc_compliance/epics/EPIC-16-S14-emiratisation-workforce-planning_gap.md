# Gap Analysis: EPIC-16-S14 — Emiratisation workforce planning

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
A forward-looking planner that projects target growth across upcoming years, models planned national hires, attrition and headcount growth, and shows the projected gap and fine exposure per future period so leadership can fund the right hiring plan.

**Covers:** 16.16
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

- [ ] Given current state and growth assumptions, when projected, then required nationals and gap are forecast for the next 1–3 years.
- [ ] Given planned hires and attrition, when modelled, then the projected achievement % and residual gap per period are shown.
- [ ] Given a scenario, when saved, then it can be compared against the baseline.
- [ ] Given a projected shortfall, then the projected fine exposure is shown to support budgeting.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedGap[]`, `projectedExposure[]`).
- [ ] Backend: projection engine over denominator growth + hire/attrition assumptions.
- [ ] Frontend: scenario planner with baseline vs. scenario comparison.
- [ ] Rules/Config: configurable growth-rate assumptions per period.
- [ ] Tests: unit tests for multi-period projection math.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
