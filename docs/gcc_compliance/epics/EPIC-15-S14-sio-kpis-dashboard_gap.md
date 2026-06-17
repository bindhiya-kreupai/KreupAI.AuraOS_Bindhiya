# Gap Analysis: EPIC-15-S14 — SIO KPIs & Dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers SIO KPIs (registration timeliness %, on-time submission %, reconciliation pass rate, contribution-salary coverage, gratuity-funding completeness, LMRA-alignment exceptions, variance count/value, late-registration count, exited-still-listed count, employer/employee totals) and a role-based dashboard with trend charts and drill-down, filterable by entity, nationality and period.

**Covers:** 15.16, 15.19
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given SIO data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, nationality, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target, then it is red with drill-down to records.
- [ ] Given RBAC, Executives see summary tiles; Payroll/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: SIO dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
