# Gap Analysis: EPIC-22-S17 — Benefits KPIs, dashboard & automation design

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** Executive / Leadership, **I want** a benefits KPI dashboard with automation, **so that** I can monitor coverage, cost, renewals and exceptions in real time.

**Description**
Deliver benefit KPIs (coverage %, expiring policies, benefit cost per head, exception count, claim turnaround) on an executive dashboard, plus the automation design (event-driven enrolment, alerts, auto-posting) that underpins the module.

**Covers:** 22.23, 22.25, 22.26
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/app/(modules)/benefits/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when opened, then it shows coverage %, upcoming renewals (60/30/7), benefit cost per head and open exceptions by country/entity.
- [ ] Given a KPI threshold breach (e.g. coverage < 100% for mandatory benefit), then it is highlighted red and drillable to the affected employees.
- [ ] Given automation design, then event-driven triggers (onboarding, grade change, separation) auto-create benefit tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects entity/country and sensitive cost data is role-restricted.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation queries/materialized views; automation event handlers
- [ ] Frontend: benefits dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
