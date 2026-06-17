# Gap Analysis: EPIC-10-S15 — Multi-country & multi-currency payroll

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to run payroll across GCC countries and currencies from one platform, **so that** each legal entity is processed under its own rules and currency.

**Description**
Enable per-legal-entity, per-country payroll execution where the rule engine resolves statutory deductions, proration conventions, pay components, file formats and rounding by country, and each entity processes in its base currency with FX handling for cross-currency elements and consolidated reporting.

**Covers:** 10.15
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

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given multiple legal entities across UAE/Saudi/Bahrain/Qatar/Oman/Kuwait, when payroll runs, then each resolves its own statutory rules, components and currency via the rule engine.
- [ ] Given a cross-currency element, when calculated, then the FX rate and source are captured and stored on the result.
- [ ] Given consolidated reporting, when requested, then figures convert to a chosen reporting currency with rates shown.
- [ ] Given country file/format differences, when generating outputs, then the correct payslip, bank/WPS file and GL format per country is produced.

## Implementation Tasks From Backlog

- [ ] Backend: country/entity context resolution in run engine + `fx_rate` store
- [ ] Backend: reporting-currency consolidation service
- [ ] Frontend: multi-entity run dashboard + currency display
- [ ] Rules/Config: bind per-country rule packs (deductions, proration, formats) to entities
- [ ] Tests: integration tests for two-country, two-currency run isolation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
