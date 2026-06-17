# Gap Analysis: EPIC-03-S06 — Workforce localization planning & nationalization-gap targeting

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** nationalization targets planned per entity with gap tracking against the country rule engine, **so that** planning and requisitions actively close Emiratisation/Nitaqat/Bahrainization/Omanisation gaps.

**Description**
Computes required localized headcount per entity from country thresholds (e.g., Emiratisation %, Nitaqat band/colour, Bahrainization ratio), compares to current localized actuals, and produces a localization plan that reserves positions and shapes the requisition pipeline. Surfaces gaps as planning gates and feeds nationalization-reserved flags on positions/requisitions.

**Covers:** 3.8
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an entity and country, when localization is planned, then required localized FTE is derived from the rule engine threshold and current actuals.
- [ ] Given a localization gap, when computed, then a target plan recommends localized hires per period and flags reserved positions.
- [ ] Given a requisition for a non-national in a gap entity, when raised, then a localization justification is required and logged.
- [ ] Given a KSA entity, when planned, then Nitaqat band impact of the planned hires is simulated.
- [ ] Given target vs actual, when viewed, then gap by entity/department renders with trend.
- [ ] Given any localization-plan change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `localization_plan` entity (entityId, countryCode, requiredLocalFte, currentLocalFte, gap, period) + migration.
- [ ] Backend: gap-calc service calling country rule engine thresholds.
- [ ] Frontend: localization planning view with gap and band simulation.
- [ ] Rules/Config: country thresholds (Emiratisation/Nitaqat/Bahrainization/Omanisation) via rule engine.
- [ ] Alerts/Workflow: alert on widening gap / breach risk; gate non-national requisitions.
- [ ] Tests: unit (gap + Nitaqat band sim) + integration (requisition gating).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
