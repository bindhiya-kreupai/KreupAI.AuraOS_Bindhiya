# Gap Analysis: EPIC-17-S07 — GOSI linkage & reconciliation

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** counted Saudis reconciled to GOSI registrations and contribution wages, **so that** the numerator matches what GOSI/Nitaqat see.

**Description**
Matches each counted Saudi to a GOSI registration (which underpins official Nitaqat counting), compares GOSI contribution wage vs. payroll, and flags unregistered, salary-mismatched or recently de-registered Saudis. Feeds the genuineness score and gap register.

**Covers:** 17.9
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/services/compliance/gosi.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given counted Saudis, when reconciled, then each is matched to a GOSI registration or flagged "not registered."
- [ ] Given a GOSI contribution wage differing from payroll beyond tolerance, when detected, then a variance flag is raised.
- [ ] Given a GOSI de-registration, when detected, then the Saudi is removed from the numerator and an alert is raised.
- [ ] Given a Saudi registered in GOSI very recently before a band check, when detected, then a timing red flag is raised (potential artificial counting).
- [ ] Given config, then salary-match tolerance and timing thresholds are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: GOSI reconciliation service joining numerator to GOSI registration/contribution data.
- [ ] Backend: `saudization_gosi_recon` entity (`employeeId`, `gosiStatus`, `gosiWage`, `payrollWage`, `variance`, `registrationTimingFlag`, `flag`).
- [ ] Frontend: GOSI reconciliation grid with variance/timing highlights.
- [ ] Rules/Config: configurable tolerance and registration-timing window.
- [ ] Tests: integration tests for unregistered/mismatch/timing cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
