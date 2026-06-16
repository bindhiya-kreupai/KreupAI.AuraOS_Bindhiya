# Gap Analysis: EPIC-11-S05 — Bahrain, Oman & Kuwait wage-payment controls

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** wage-payment controls and wage files for Bahrain, Oman and Kuwait, **so that** wage-protection obligations in those countries are met.

**Description**
Implement the wage-payment/WPS controls for Bahrain (LMRA-linked wage protection), Oman (wage payment via approved channels) and Kuwait, generating each country's required wage file/evidence from locked payroll with bank-channel validation and statutory-timing tracking, configured via the rule engine.

**Covers:** 11.7, 11.8, 11.9
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/bahrain-sio/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/kuwait-pifss/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a locked payroll for Bahrain/Oman/Kuwait, when processed, then the country's required wage file/evidence is generated with CPR/Civil ID/IBAN and pay data.
- [ ] Given each country's wage-payment rules, when validated, then bank-channel and mandatory-field controls are enforced before release.
- [ ] Given statutory timing for each country, when the period closes, then payment/reporting windows are tracked and salary-delay flags raise on breach.
- [ ] Given generation, when complete, then per-country output is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: per-country (BH/OM/KW) wage-file/evidence generators
- [ ] Backend: bank-channel + mandatory-field validators per country
- [ ] Frontend: country wage-control generation screens
- [ ] Rules/Config: BH/OM/KW wage-payment rules and windows
- [ ] Alerts/Workflow: salary-delay flags per country
- [ ] Tests: integration tests for each country's validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
