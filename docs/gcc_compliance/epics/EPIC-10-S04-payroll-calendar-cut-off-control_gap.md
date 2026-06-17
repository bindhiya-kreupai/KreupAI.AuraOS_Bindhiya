# Gap Analysis: EPIC-10-S04 — Payroll calendar & cut-off control

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** a per-entity payroll calendar with cut-off dates, **so that** inputs freeze on time and salaries are paid within statutory windows.

**Description**
Define payroll periods, cut-off dates, processing dates and pay dates per legal entity/frequency, with cut-off enforcement that locks input changes after cut-off and tracks the statutory pay-by date (to support WPS salary-delay prevention).

**Covers:** 10.4
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a payroll calendar, when configured, then each period has cut-off, processing and pay dates per legal entity.
- [ ] Given the cut-off has passed, when a user attempts to change inputs, then changes are blocked or routed as exceptions to the next period/off-cycle.
- [ ] Given a country statutory pay window, when the projected pay date approaches the limit (e.g., flag if salary would be delayed > 15 days after period end), then an alert is raised.
- [ ] Given calendar changes, when saved, then they are versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `payroll_calendar`/`payroll_period` schema (`cutoff_date`, `processing_date`, `pay_date`, `statutory_paydue_date`)
- [ ] Backend: cut-off enforcement service on input changes
- [ ] Frontend: payroll calendar configuration + period status view
- [ ] Rules/Config: per-country statutory pay-window thresholds
- [ ] Alerts/Workflow: salary-delay risk alert at 60/30/7-day style thresholds before statutory due date
- [ ] Tests: unit tests for post-cut-off change blocking

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
