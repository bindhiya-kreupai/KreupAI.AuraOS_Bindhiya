# Gap Analysis: EPIC-28-S05 — Bahrain, Qatar, Oman & Kuwait EOSB Rules (Gratuity / Indemnity / Social-Protection Linkage)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the Bahrain, Qatar, Oman and Kuwait end-of-service gratuity/indemnity rules encoded as formula-engine profiles, **so that** EOSB is correct across the remaining GCC jurisdictions, including social-protection-funded schemes.

**Description**
Implements the four remaining country profiles: Bahrain gratuity/indemnity (tiered day-rate bands for expatriates, with awareness of the SIO-administered monthly funding of expatriate gratuity so the lump-sum is reduced by the funded portion); Qatar gratuity (minimum three-weeks' basic wage per year, configurable upward, with eligibility minimum of one year); Oman gratuity with the Social Protection Fund linkage (post-reform contributions reduce/replace employer lump-sum for in-scope workers); and Kuwait end-of-service indemnity (15 days/yr for the first five years, one month/yr thereafter, with the resignation-based fractional entitlement bands). All bands/rates/caps are configurable.

**Covers:** 28.9, 28.10, 28.11, 28.12
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Bahrain expatriate, when EOSB runs, then the gratuity day-rate bands apply and the SIO-funded portion (from the social-insurance epic) is netted into the lump-sum result.
- [ ] Given a Qatar employee with ≥1 year service, when computed, then at least three weeks' basic wage per year of service is accrued, configurable upward.
- [ ] Given an Oman worker in scope of the Social Protection Fund, when computed, then the SPF-funded period reduces/replaces the employer lump-sum per the configured linkage.
- [ ] Given a Kuwait employee, when computed, then 15 days/yr for the first 5 years and one month/yr thereafter apply, with resignation fractional bands (e.g. 1/2 for 3–5, 2/3 for 5–10, full for 10+) per S06.
- [ ] Given all four, then rates/bands/caps and social-protection linkage are effective-dated config; any change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: Bahrain, Qatar, Oman, Kuwait accrual profiles
- [ ] Backend: social-protection netting hooks (Bahrain SIO funded balance; Oman SPF funded period)
- [ ] Backend: Kuwait resignation fractional-band handling
- [ ] Frontend: profile viewer/editor for the four countries
- [ ] Rules/Config: seed Bahrain/Qatar/Oman/Kuwait rates, eligibility minimums, social-protection linkage flags
- [ ] Tests: unit tests with worked examples per country incl. funded-portion netting

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
