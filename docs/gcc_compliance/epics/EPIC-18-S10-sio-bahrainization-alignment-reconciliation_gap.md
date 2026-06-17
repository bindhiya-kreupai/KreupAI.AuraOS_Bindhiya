# Gap Analysis: EPIC-18-S10 — SIO & Bahrainization alignment / reconciliation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** counted Bahrainis reconciled against SIO registrations and contribution wages, **so that** the numerator matches what SIO/LMRA see.

**Description**
A reconciliation engine matching each counted Bahraini to an SIO registration, comparing SIO contribution wage vs. payroll, and flagging unregistered, wage-mismatched or de-registered Bahrainis. Feeds the genuineness score and gap register.

**Covers:** 18.12
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/e2e/visual/visual-regression.spec.ts
- apps/web/src/**tests**/middleware/api-version.test.ts
- apps/web/src/**tests**/performance/tests/regression.test.js
- apps/web/src/app/(modules)/master-data/roles-permissions/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/bahrain-sio/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/india-statutory/professional-tax/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given counted Bahrainis, when reconciled, then each is matched to an SIO registration or flagged "not registered."
- [ ] Given an SIO contribution wage differing from payroll beyond tolerance, when detected, then a variance flag with amounts is raised.
- [ ] Given an SIO de-registration, when detected, then the Bahraini is removed from the numerator and an alert is raised.
- [ ] Given a Bahraini registered very recently before a permit/tender check, when detected, then a timing red flag is raised.
- [ ] Given config, then salary-match tolerance and timing thresholds are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: SIO reconciliation service joining numerator to SIO registration/contribution data.
- [ ] Backend: `bahrainization_sio_recon` entity (`employeeId`, `sioStatus`, `sioWage`, `payrollWage`, `variance`, `timingFlag`, `flag`).
- [ ] Frontend: SIO reconciliation grid with variance/timing highlights.
- [ ] Rules/Config: configurable tolerance and registration-timing window.
- [ ] Tests: integration tests for unregistered/mismatch/timing cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
