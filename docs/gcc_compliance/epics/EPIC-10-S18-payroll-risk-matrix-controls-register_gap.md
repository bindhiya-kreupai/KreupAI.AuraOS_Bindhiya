# Gap Analysis: EPIC-10-S18 — Payroll risk matrix & controls register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable payroll risk matrix and controls register, **so that** payroll risks are identified, scored and mitigated.

**Description**
Provide a risk register of common payroll risks (ghost employees, duplicate payments, unauthorized changes, salary delay, deduction-cap breach, reconciliation breaks) with likelihood × impact scoring, linked controls, red-flag detection rules and remediation tracking.

**Covers:** 10.18
**Acceptance criteria count:** 4 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the risk matrix, when configured, then each risk has likelihood, impact, score, owner and linked control.
- [ ] Given red-flag rules, when run against a period, then conditions like duplicate IBAN, ghost/no-attendance pay, or post-lock change attempts are detected and logged.
- [ ] Given a flagged risk, when raised, then it is tracked to remediation with due date and status.
- [ ] Given the register, when configured, then risks and scoring are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: `payroll_risk_register` + red-flag detection rules engine
- [ ] Frontend: risk matrix/heatmap + remediation board
- [ ] Rules/Config: configurable red-flag rules and scoring
- [ ] Alerts/Workflow: red-flag alerts to Compliance Officer
- [ ] Tests: integration tests for duplicate-IBAN/ghost-pay detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
