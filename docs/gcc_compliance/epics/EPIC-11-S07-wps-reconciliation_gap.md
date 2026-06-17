# Gap Analysis: EPIC-11-S07 — WPS reconciliation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** WPS reconciliation across registered, paid and submitted wages, **so that** I can prove every employee was paid the correct registered amount.

**Description**
Reconcile three views per period — registered/contract wage, payroll-paid amount, and WPS-submitted/authority-confirmed amount — at employee and aggregate level, flagging mismatches, unpaid-but-active employees and paid-but-unreported cases, with documented resolution.

**Covers:** 11.11
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payroll-reconciliation/page.tsx
- apps/web/src/app/api/payroll/reconciliation/route.ts
- apps/web/src/app/dashboard/payroll/payroll-reconciliation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a period, when reconciliation runs, then registered vs paid vs submitted wages are compared per employee and in total.
- [ ] Given a mismatch (amount, missing employee, extra record), when detected, then it is flagged with type and routed to exception management.
- [ ] Given an authority confirmation/return, when ingested, then submitted-vs-confirmed status updates per employee.
- [ ] Given reconciliation, when completed, then a reconciliation pack is stored and audit-logged for the period.

## Implementation Tasks From Backlog

- [ ] Backend: three-way reconciliation engine (registered/paid/submitted) + break classification
- [ ] Backend: authority-confirmation ingest adapter
- [ ] Frontend: WPS reconciliation dashboard with break drill-down
- [ ] Rules/Config: match tolerance and country rules
- [ ] Tests: integration tests for break detection and pack generation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
