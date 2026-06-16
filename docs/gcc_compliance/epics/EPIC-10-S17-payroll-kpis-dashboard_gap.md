# Gap Analysis: EPIC-10-S17 — Payroll KPIs & dashboard

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Build a dashboard covering total payroll cost by entity/cost center, payroll accuracy (error/off-cycle rate), on-time payment %, salary-delay risk, processing cycle time, variance trend and exception counts, with drill-down and RBAC scoping.

**Covers:** 10.17
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/api/payroll/payslips/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then it shows payroll cost, on-time-payment %, error rate, off-cycle %, and variance trend per entity.
- [ ] Given a salary-delay risk, when the projected pay date breaches the statutory window, then a compliance KPI flags it.
- [ ] Given a KPI tile, when clicked, then it drills down to the contributing runs/employees.
- [ ] Given RBAC, when a leader logs in, then they see only their in-scope entities.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation endpoints (cost, timeliness, accuracy, variance)
- [ ] Frontend: payroll KPI dashboard with drill-down + export
- [ ] Rules/Config: KPI definitions and threshold configuration
- [ ] Tests: integration tests for KPI computation and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
