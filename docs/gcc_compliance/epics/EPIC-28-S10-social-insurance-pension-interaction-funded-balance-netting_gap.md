# Gap Analysis: EPIC-28-S10 — Social Insurance & Pension Interaction (Funded-Balance Netting)

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** EOSB to interact correctly with social-insurance/pension funding (GOSI, GPSSA, SIO, Oman SPF) so that funded portions are netted and nationals' treatment is handled per country, **so that** the employer neither double-funds nor under-pays.

**Description**
Models the interaction between EOSB and social-insurance/pension: for GCC nationals (covered by GPSSA/GOSI/SIO pension), EOSB treatment differs from expatriates per country rule (some nationals receive pension instead of/alongside gratuity); for expatriates under funded schemes (Bahrain SIO monthly gratuity funding, Oman SPF), the funded balance reduces the employer lump-sum. This story consumes funded-balance/service data from the social-insurance epics and nets it into the EOSB result, flagging any shortfall the employer must top up.

**Covers:** 28.17
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/dashboard/government/pension-scheme/page.tsx
- apps/web/src/app/dashboard/government/pensions/page.tsx
- apps/web/src/services/pensionEosbService.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a GCC national, when EOSB runs, then the configured national treatment (pension-covered, gratuity, or combination) is applied per country.
- [ ] Given an expatriate under a funded scheme, when computed, then the funded balance (from SIO/SPF) is netted from the lump-sum and any employer top-up is shown.
- [ ] Given a funded balance exceeding the entitlement, then the lump-sum is reduced to zero and the surplus is noted (no negative payout).
- [ ] Given the interaction, then funded amount, netting and top-up appear on the calculation sheet.
- [ ] Given any netting, then the source social-insurance reference and value are audited.

## Implementation Tasks From Backlog

- [ ] Backend: funded-balance/pension-interaction consumer (GOSI/GPSSA/SIO/SPF APIs)
- [ ] Backend: netting logic + top-up/shortfall computation in the engine
- [ ] Frontend: social-insurance interaction lines on calculation sheet
- [ ] Rules/Config: per-country national vs expatriate EOSB-vs-pension treatment
- [ ] Tests: unit tests for national treatment, expat netting, surplus handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
