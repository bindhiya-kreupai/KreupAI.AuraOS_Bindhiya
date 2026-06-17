# Gap Analysis: EPIC-23-S10 — Accommodation payroll & cost allocation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** accommodation to feed payroll and cost allocation, **so that** any worker deductions and the rent/utility/maintenance cost per occupant are accurate and posted to the right cost centre.

**Description**
Handle accommodation-related payroll (deductions where permitted, suppression of housing allowance for provided cases) and allocate total accommodation cost (rent, utilities, maintenance, catering) per occupant/cost centre/project for chargeback.

**Covers:** 23.18, 23.19
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given provided accommodation, then any housing allowance is suppressed and only permitted deductions post to payroll.
- [ ] Given total site cost, when allocated, then it distributes per occupant-night/cost-centre/project for the period.
- [ ] Given a mid-month move, then cost allocation and any deduction prorate by occupancy days.
- [ ] Given a payroll lock, when an accommodation deduction input is missing for an assigned worker, then the lock flags the gap.
- [ ] Given any cost/payroll posting, then it is reconcilable and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_cost`, `cost_allocation` schema; payroll feed service
- [ ] Backend: occupant-night allocation + proration engine
- [ ] Frontend: cost allocation + chargeback report
- [ ] Rules/Config: permitted-deduction rules per country; allocation basis
- [ ] Tests: integration (payroll + allocation) + unit (proration)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
