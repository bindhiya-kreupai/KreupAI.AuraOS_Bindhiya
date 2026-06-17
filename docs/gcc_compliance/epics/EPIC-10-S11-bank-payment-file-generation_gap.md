# Gap Analysis: EPIC-10-S11 — Bank/payment file generation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to generate validated bank/payment files from locked payroll, **so that** salaries are paid through the correct bank/WPS-ready channel.

**Description**
Produce per-bank, per-entity payment files in required formats (including WPS-compatible SIF where applicable) from locked net-pay results, with IBAN/account validation, beneficiary checks, currency handling and a release step separate from approval.

**Covers:** 10.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll/bank-file-generation/page.tsx
- apps/web/src/app/dashboard/payroll/bank-file-generation/page.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/dashboard/payroll/payslip-generation/page.tsx
- apps/web/src/app/api/payroll/bank-file/route.ts
- apps/web/src/components/payroll/BankFileManager.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a locked run, when a bank file is generated, then it includes validated IBAN/account, amount, currency and value date per beneficiary.
- [ ] Given invalid bank details, when validation runs, then those employees are blocked from the file and flagged for correction.
- [ ] Given a country, when generating, then the correct file format/layout is produced and the net-pay data is made available for the WPS module (EPIC-11).
- [ ] Given file release, when actioned, then it is a separate authorized step (releaser ≠ preparer) and is audit-logged.
- [ ] Given totals, when the file is produced, then the file control total reconciles to the approved run net total.

## Implementation Tasks From Backlog

- [ ] Backend: payment-file generator with per-country layout templates + control totals
- [ ] Backend: IBAN/account validation service
- [ ] Frontend: bank-file generation + release screen with validation results
- [ ] Rules/Config: per-country/bank file format and value-date rules
- [ ] Alerts/Workflow: release authorization step + exception list
- [ ] Tests: integration tests for control-total reconciliation and invalid-IBAN exclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
