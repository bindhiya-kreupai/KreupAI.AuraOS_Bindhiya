# Gap Analysis: EPIC-06-S07 — Payroll onboarding & first-pay readiness

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** new hires set up for payroll with validated salary, bank and proration data before the first run, **so that** the first salary is correct, on time and WPS-compliant.

**Description**
On master activation, create the payroll profile (salary structure, allowances, bank/IBAN, WPS/Mudad routing, cost centre, proration from actual join date). Payroll readiness checks block payroll lock if any mandatory input is missing or the employee is not yet enrolled where statutorily required.

**Covers:** 6.9
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Implemented - pending migration/config verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616100000_add_employee_payroll_profile/migration.sql
- apps/web/src/lib/services/payroll-onboarding.service.ts
- apps/web/src/lib/services/**tests**/payroll-onboarding.service.test.ts
- apps/web/src/app/api/v1/onboarding/payroll/route.ts
- apps/web/src/app/api/v1/onboarding/payroll/[id]/approve/route.ts
- apps/web/src/app/dashboard/onboarding/payroll/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Wire `payrollOnboardingService.validatePayrollLock(...)` into the final payroll-run lock/approval flow once the payroll run employee-selection path is finalized.
- Confirm with product/compliance whether the built-in GCC WPS/Mudad readiness rule map should remain code-owned for MVP or move under the configurable country-rule engine from S06.

## Acceptance Criteria To Verify

- [ ] Given an activated employee, when the payroll profile is created, then salary components, IBAN and cost centre are validated against entity rules.
- [ ] Given a mid-month join, when proration runs, then first-period salary is prorated from the actual join date.
- [ ] Given WPS-governed countries, when payroll readiness is checked, then a missing IBAN/labour-card/WPS routing blocks payroll lock with a clear reason.
- [ ] Given salary delay risk, when join-to-first-pay would exceed the statutory wage window, then an alert is raised.
- [ ] Given any payroll-profile change, then it is audit-logged and routed for approval where required.

## Implementation Tasks From Backlog

- [ ] Backend: `employee_payroll_profile` (salary_components, iban, wps_route, cost_center, proration_basis).
- [ ] Backend: payroll-readiness validation service + lock-blocking hook.
- [ ] Frontend: payroll onboarding screen for Payroll Officer.
- [ ] Rules/Config: country WPS routing + mandatory payroll inputs.
- [ ] Alerts/Workflow: readiness-failure and salary-delay alerts.
- [ ] Tests: proration + lock-block integration tests.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/payroll-onboarding.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after a seeded tenant has payroll configuration, WPS/Mudad configuration, salary structures, bank data, and department cost centres.
