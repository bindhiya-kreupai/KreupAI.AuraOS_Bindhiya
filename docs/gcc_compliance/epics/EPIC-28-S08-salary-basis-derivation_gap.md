# Gap Analysis: EPIC-28-S08 — Salary Basis Derivation

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** the EOSB salary basis derived from the configured components per country, **so that** the day/month rate uses the legally correct wage (e.

**Description**
Defines, per country and rule profile, which salary components form the EOSB basis (e.g. UAE basic salary only; some jurisdictions include certain allowances), how the basis is determined at separation (last drawn vs average over a period), and how the daily/monthly rate is derived from it. Produces the salary-basis snapshot that the accrual engine multiplies by qualifying days/years.

**Covers:** 28.15
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a country rule profile, when configured, then the included salary components for the EOSB basis are selectable per jurisdiction.
- [ ] Given the basis method, when set to "last drawn" or "average", then the engine derives the basis accordingly from payroll history.
- [ ] Given the basis amount, when computed, then the daily/monthly rate is derived using the country day-count basis and shown.
- [ ] Given a UAE employee, then by default only basic salary forms the basis unless reconfigured.
- [ ] Given any basis derivation, then the components and method are shown on the calculation sheet and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_salary_basis_rule` (countryCode, includedComponentCodes[], method, averagingWindow, effectiveFrom)
- [ ] Backend: salary-basis service producing `eosb_salary_basis` snapshot + day/month-rate
- [ ] Frontend: salary-basis rule config + per-employee basis breakdown
- [ ] Rules/Config: seed UAE basic-only + other-country component sets and methods
- [ ] Tests: unit tests for last-drawn vs average and component inclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
