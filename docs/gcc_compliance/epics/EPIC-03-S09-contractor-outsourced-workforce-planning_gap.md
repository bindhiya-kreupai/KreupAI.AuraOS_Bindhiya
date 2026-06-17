# Gap Analysis: EPIC-03-S09 — Contractor & outsourced workforce planning

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**User story:** HR Manager, **I want** to plan and track contractor/outsourced headcount distinctly from direct employees, **so that** blended workforce, sponsorship and localization-exclusion rules are correctly managed.

**Description**
Models contingent workforce (agency, outsourced, third-party-sponsored) with vendor, contract period, sponsorship/visa source and cost. Keeps contractor headcount separate from direct FTE so localization ratios and budgets are computed correctly, and flags contractors who must not be counted toward nationalization or whose work permits expire.

**Covers:** 3.11
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given a contractor record, when created, then vendor, contract type, sponsorship source, period and cost are captured.
- [ ] Given localization computation, when run, then contractor heads are excluded from national-ratio numerators/denominators per rule.
- [ ] Given blended planning, when viewed, then direct vs contingent headcount split is shown per unit.
- [ ] Given a contractor permit/contract nearing expiry, when within 60/30/7 days, then an alert is raised.
- [ ] Given any contractor-plan change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `contingent_worker` entity (vendorId, contractType, sponsorshipSource, periodFrom/To, cost) + migration.
- [ ] Backend: blended-headcount + localization-exclusion service.
- [ ] Frontend: contingent workforce planning view (direct vs contingent).
- [ ] Rules/Config: country rules on contractor counting/exclusion.
- [ ] Alerts/Workflow: 60/30/7-day contract/permit expiry alerts.
- [ ] Tests: unit (exclusion logic) + integration (expiry alerting).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
