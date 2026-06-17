# Gap Analysis: EPIC-34-S19 — EOSB formula engine

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** a configurable EOSB formula engine, **so that** gratuity/end-of-service amounts compute correctly per country and separation type.

**Description**
Build the EOSB formula engine that holds per-country gratuity formulas as configurable rules — service-band day rates, salary basis, resignation-vs-termination factors, unpaid-leave exclusion, caps — and computes EOSB deterministically (e.g., UAE: 21 days/yr for first 5 years then 30 days/yr; KSA, Bahrain, Qatar, Oman, Kuwait variants) with a traceable calculation breakdown.

**Covers:** 34.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given country, service period, salary basis and separation type, when computed, then EOSB returns the correct amount with a step-by-step breakdown.
- [ ] Given UAE, when computed, then the engine applies 21 days/yr for the first 5 years and 30 days/yr thereafter, with resignation reductions where applicable.
- [ ] Given unpaid leave, when present, then it is excluded from service per the country rule.
- [ ] Given a formula change, when published with an effective date, then prior settlements remain on the old formula and new ones use the new version.
- [ ] Given any computation, when run, then inputs, formula version and result are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_formula`, `eosb_calculation` schemas (service bands, day rate, salary basis, factors, caps)
- [ ] Backend: deterministic EOSB calculation engine with breakdown trace and effective-dating
- [ ] Frontend: EOSB formula editor + calculation preview
- [ ] Rules/Config: per-country EOSB formulas (UAE/KSA/BH/QA/OM/KW)
- [ ] Tests: unit tests per country (e.g., UAE 21/30-day bands, resignation reductions, unpaid-leave exclusion)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
