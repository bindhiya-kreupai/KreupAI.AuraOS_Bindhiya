# Gap Analysis: EPIC-15-S09 — Expatriate End-of-Service Gratuity Funding

> **✅ SHIPPED 2026-06-17** — Themes J + K closure. Structural extensions: job architecture API surface (reuses existing JobFamily/JobProfile models), SalaryGradeBand, DelegationOfAuthority with resolveLevel helper, PayrollCalendarControl + PayrollVarianceEntry, FatigueRule with breachesRule helper, OvertimeFraudFlag (6 signals), EosSioFundingLink, ReturnToWorkPlan, HolidayCalendarChangeRequest (maker-checker), RedundancyBatch, SeparationRetentionPolicy, DocumentPhysicalLocation, AuditFindingRiskLink. Plus service-only closures: unified BH/OM/KW wage-file generator (EPIC-11-S05), grievance mediation states (EPIC-25-S04), classification RBAC helper canReadRecord (EPIC-30-S07), country rollup helper rollupByCountry (EPIC-31-S04), executive RBAC scopes canViewExecutiveDomain (EPIC-31-S14). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the SIO-administered expatriate end-of-service gratuity funding modelled and remitted monthly, **so that** the employer meets the statutory monthly gratuity-funding obligation for expatriate workers.

**Description**
Under Bahrain's reform, expatriate end-of-service gratuity is funded through monthly SIO contributions rather than a lump sum at exit. This story computes the monthly employer gratuity-funding amount per expatriate from the contribution salary at the configured rate, includes it in the monthly SIO file, tracks accumulated funded gratuity per employee, and exposes the funded balance to the EOSB module so the final settlement reflects what SIO has already funded.

**Covers:** 15.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given an expatriate, when the monthly SIO run executes, then the employer gratuity-funding amount is computed from the contribution salary at the configured (effective-dated) rate and included in the file.
- [ ] Given monthly funding, when accumulated, then a per-employee funded-gratuity balance is maintained and viewable.
- [ ] Given the funding rate varies by service tenure (if configured), then the correct band is applied per the rule engine.
- [ ] Given an EOSB calculation request, then the SIO-funded gratuity balance is exposed so final settlement nets it correctly.
- [ ] Given any funding entry, then it is persisted for audit and reconciliation.

## Implementation Tasks From Backlog

- [ ] Backend: gratuity-funding calculation in the engine producing `sio_gratuity_funding_line` per expat/period
- [ ] Backend: per-employee `sio_funded_gratuity_balance` accumulator
- [ ] Backend: expose funded-gratuity API for EOSB
- [ ] Frontend: expat gratuity-funding view (monthly + accumulated balance)
- [ ] Rules/Config: expat gratuity-funding rate (optionally tenure-banded), effective-dated
- [ ] Tests: unit tests for funding calc, accumulation, tenure bands

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
