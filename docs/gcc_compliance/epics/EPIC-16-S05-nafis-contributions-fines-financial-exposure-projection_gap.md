# Gap Analysis: EPIC-16-S05 — Nafis contributions, fines & financial exposure projection

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
A financial model that, from the gap and counted nationals, computes (a) MOHRE non-compliance fines for shortfall (configurable per-shortfall monthly amount with annual escalation) and (b) Nafis subsidy entitlement/risk for counted nationals. Outputs feed the dashboard and certificate.

**Covers:** 16.7
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a shortfall of N nationals, when projected, then monthly and annualised fine exposure = N × configured rate (with year-on-year escalation) is shown.
- [ ] Given counted nationals on Nafis-eligible terms, when computed, then projected subsidy is shown with eligibility caveats.
- [ ] Given a salary below a Nafis/registration threshold, when detected, then the national is flagged as at-risk of non-counting/clawback.
- [ ] Given config changes to rates, then projections recompute without code change and the rate version is recorded.
- [ ] Given RBAC, then financial-exposure figures are visible only to Compliance/Finance/Executive roles.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_financials` entity (`entityId`, `period`, `fineExposureMonthly`, `fineExposureAnnual`, `nafisProjected`, `rateVersion`).
- [ ] Backend: exposure projection service consuming gap + counted-national data.
- [ ] Frontend: financial-exposure widget with fine vs. subsidy breakdown.
- [ ] Rules/Config: per-country fine rate, escalation schedule, Nafis parameters and salary thresholds.
- [ ] Tests: unit tests for fine escalation and subsidy edge cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
