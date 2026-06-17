# Gap Analysis: EPIC-09-S13 — Nationalization reporting through org structure

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** nationalization headcount derived from org structure per legal entity and country, **so that** Emiratisation/Saudization/Bahrainization/Omanisation ratios reflect the true establishment.

**Description**
Tag positions/incumbents with nationality and counting eligibility, and aggregate national vs total headcount by legal entity, establishment and country to feed nationalization computation and authority reporting.

**Covers:** 9.15
**Acceptance criteria count:** 4 · **Task count:** 6

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

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given employees mapped to positions, when aggregated, then national vs expatriate headcount is computed per legal entity and establishment.
- [ ] Given a country, when ratios are derived, then the correct denominator rules (e.g., countable categories per Nitaqat/Emiratisation) are applied via the rule engine.
- [ ] Given a structural change, when applied, then nationalization counts recompute on the change's effective date.
- [ ] Given the report, when exported, then it is broken down by establishment ID for authority alignment.

## Implementation Tasks From Backlog

- [ ] Backend: nationalization aggregation service over org/incumbency data
- [ ] Backend: per-country countable-category rules via rule engine
- [ ] Frontend: nationalization-by-structure report view
- [ ] Rules/Config: Emiratisation/Saudization/Bahrainization/Omanisation counting rules
- [ ] Tests: integration tests for per-entity national-ratio computation
- [ ] Alerts/Workflow: feed to EPIC-16/17/18 nationalization modules

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
