# Gap Analysis: EPIC-10-S03 — Deductions (statutory, loans, advances)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to manage statutory and voluntary deductions including loans and advances, **so that** net pay is accurate and recoveries are tracked to closure.

**Description**
Support deduction components: statutory (social insurance employee share — GOSI/GPSSA/SIO), loan instalments, salary-advance recovery, fines (within legal limits), and other deductions, with balances, schedules and legal deduction-cap enforcement.

**Covers:** 10.3
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll/statutory-deductions/page.tsx
- apps/web/src/app/api/payroll/statutory-deductions/route.ts
- apps/web/src/app/dashboard/payroll/statutory-deductions/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/lwf/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/pf-esi/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/professional-tax/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/tds/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a loan/advance, when set up, then an instalment schedule with outstanding balance is created and recovered each period until closed.
- [ ] Given statutory deductions, when computed, then the employee share is pulled from the social-insurance modules (EPIC-13/14/15) per country.
- [ ] Given a period, when total deductions are applied, then they cannot exceed the legal maximum % of wage for that country (deduction-cap rule), else flagged/blocked.
- [ ] Given a leaver, when final period runs, then outstanding loan/advance balances are surfaced for recovery in settlement.
- [ ] Given deduction changes, when saved, then audit trail captures actor, amount and reason.

## Implementation Tasks From Backlog

- [ ] Backend: `deduction`, `loan`, `advance` schemas with schedule + outstanding balance
- [ ] Backend: deduction-cap rule + statutory-deduction integration service
- [ ] Frontend: deduction/loan/advance management screens with balances
- [ ] Rules/Config: per-country legal deduction-cap thresholds
- [ ] Alerts/Workflow: alert when deductions exceed cap or loan nears closure
- [ ] Tests: integration tests for instalment recovery and cap enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
