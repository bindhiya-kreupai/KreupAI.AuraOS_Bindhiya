# Gap Analysis: EPIC-10-S14 — Payroll & GL/Finance integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** payroll to post a balanced journal to Finance, **so that** labour cost and liabilities are recorded accurately by cost center and entity.

**Description**
Map pay components to GL accounts and cost centers, generate a balanced (debit/credit) journal per locked period including accruals (EOSB/leave provisions feed where applicable), and integrate with the ERP/GL via API/file with posting confirmation and reconciliation.

**Covers:** 10.14
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/payroll/bank-integration/page.tsx
- apps/web/src/app/dashboard/admin/payroll/settings/bank-integration/page.tsx
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

- [ ] Given mapped components, when a period closes, then a balanced journal (total debits = total credits) is generated per legal entity.
- [ ] Given cost centers (EPIC-09), when posting, then costs are split by cost center/department.
- [ ] Given the GL system, when the journal is sent, then a posting confirmation/reference is captured, or failure is flagged for retry.
- [ ] Given multi-currency, when posting, then amounts post in entity base currency with FX rate captured.
- [ ] Given any posting, when completed, then it is audit-logged and reconciles to the payroll register.

## Implementation Tasks From Backlog

- [ ] Backend: `gl_mapping` (component → account) + journal-generation service with balance check
- [ ] Backend: ERP/GL integration adapter (API/file) with posting status
- [ ] Frontend: GL mapping configuration + posting status screen
- [ ] Rules/Config: per-entity chart-of-accounts mapping + FX source
- [ ] Tests: integration tests for balanced-journal generation and posting confirmation
- [ ] Alerts/Workflow: posting-failure alert and retry

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
