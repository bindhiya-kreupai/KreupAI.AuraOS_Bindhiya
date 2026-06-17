# Gap Analysis: EPIC-17-S03 — 2026–2028 Nitaqat direction projection

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
Applies the scheduled 2026–2028 threshold increases (configurable per activity/size) to the current workforce and projects the future band per year, highlighting where the entity would slip to Yellow/Red if hiring does not keep pace.

**Covers:** 17.5
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

- [ ] Given configured future-year thresholds, when projected, then the band for 2026/2027/2028 is computed against the current ratio.
- [ ] Given a projected band drop, when detected, then the required additional Saudis to hold the band per year are shown.
- [ ] Given a hiring scenario, when applied, then the projected band per year recomputes.
- [ ] Given config, then future-year thresholds are editable and versioned.

## Implementation Tasks From Backlog

- [ ] Backend: projection service applying future-year thresholds to current/forecast ratio.
- [ ] Backend: `nitaqat_direction_projection` entity (`entityId`, `year`, `projectedRatio`, `projectedBand`, `saudisNeeded`).
- [ ] Frontend: direction-projection view with year-by-year band outlook.
- [ ] Rules/Config: effective-dated 2026–2028 threshold schedule.
- [ ] Tests: unit tests for multi-year band projection.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
