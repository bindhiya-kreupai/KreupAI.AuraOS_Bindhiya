# Gap Analysis: EPIC-29-S09 — Immigration Exit ↔ Final Settlement & Payroll Linkage

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** immigration-exit events linked to final settlement and to drive payroll stop/hold and last-payment sequencing, **so that** salary stops at the right point and the final settlement/payout is released only when immigration closure permits.

**Description**
Connects the exit case to final settlement (EPIC-27/EPIC-28) and payroll: sets the salary-stop date from the last working day / absconding date, links the immigration-closure status to the final-settlement gate so the settlement and final payout are held until required immigration steps (cancellation/transfer/grace) reach the configured sequencing checkpoint, and ensures any recoveries (e.g. unreturned ticket, immigration costs) flow to final settlement. Prevents both continued salary for departed employees and premature final settlement/payout before closure.

**Covers:** 29.8, 29.13
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given an exit, when the last working/absconding date is set, then payroll salary-stop is applied from that date.
- [ ] Given the final-settlement gate, when configured, then the settlement/final payout is held until the required immigration checkpoint is reached or explicitly overridden with reason.
- [ ] Given an absconding case, then salary is stopped and flagged immediately.
- [ ] Given immigration-related recoveries, then they are passed to final settlement.
- [ ] Given any final-settlement/payroll-linkage action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: immigration-closure → final-settlement gate + payroll salary-stop + final-payment-hold based on exit checkpoints
- [ ] Backend: recovery hand-off to final settlement
- [ ] Frontend: final-settlement/payroll-linkage panel within the exit case
- [ ] Rules/Config: final-settlement sequencing checkpoints per scenario/country
- [ ] Alerts/Workflow: hold/override gate
- [ ] Tests: integration tests for stop date, settlement gate, hold and override

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
