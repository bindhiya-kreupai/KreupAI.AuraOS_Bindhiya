# Gap Analysis: EPIC-35-S03 — Payroll & social insurance filing calendars

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** payroll and social-insurance filing calendars, **so that** pay runs, WPS/Mudad submissions and GOSI/GPSSA/SIO filings are never late.

**Description**
Configure the payroll compliance calendar (cut-off, run, approval, WPS/Mudad submission, GL posting) and the social-insurance filing calendar (GOSI, GPSSA, SIO and Qatar/Oman/Kuwait equivalents) with per-country statutory due dates and salary-delay thresholds, generating tasks and alerts from the scheduler.

**Covers:** A1.8, A1.9
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/bahrain-sio/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given an entity, when configured, then payroll cut-off/run/WPS-submission tasks generate with country due dates (e.g., WPS within statutory window).
- [ ] Given social insurance, when configured, then GOSI/GPSSA/SIO filing tasks generate per country deadline.
- [ ] Given a due date approaching, when reached, then tiered alerts fire to the payroll owner.
- [ ] Given task completion, when recorded, then it is audit-logged with evidence link.

## Implementation Tasks From Backlog

- [ ] Backend: payroll/social-insurance calendar templates feeding the scheduler
- [ ] Backend: country deadline resolution from rule engine
- [ ] Frontend: payroll & social-insurance calendar views
- [ ] Rules/Config: per-country payroll/WPS/contribution deadlines
- [ ] Alerts/Workflow: deadline alerts to task owners
- [ ] Tests: integration tests for deadline generation per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
