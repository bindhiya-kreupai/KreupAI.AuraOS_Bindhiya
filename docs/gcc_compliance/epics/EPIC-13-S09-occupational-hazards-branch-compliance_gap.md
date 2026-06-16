# Gap Analysis: EPIC-13-S09 — Occupational Hazards Branch Compliance

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** the Occupational Hazards branch fully modelled — applicable to all workers, employer-funded — with work-injury linkage, **so that** every worker is covered and injury claims reference the correct GOSI registration.

**Description**
The Occupational Hazards (OH) branch covers all employees (Saudi and expatriate) and is employer-funded at a configurable rate. This story ensures OH enrolment is universal, the OH contribution is calculated and remitted even when Annuities does not apply (expats), and that work-injury/HSE incidents can be linked to the GOSI OH coverage for claim handling.

**Covers:** 13.12
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given any in-scope employee regardless of nationality, when registered, then Occupational Hazards enrolment is mandatory and cannot be disabled per-employee.
- [ ] Given an expatriate with no Annuities branch, when contributions are calculated, then the OH employer contribution is still computed and included in the monthly file.
- [ ] Given a recorded work injury (from HSE), when linked, then the employee's GOSI OH registration reference is attached for claim purposes.
- [ ] Given the OH rate, when changed, then it is effective-dated and applies to all workers per the rule engine.
- [ ] Given any OH coverage change, then it is written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: enforce mandatory OH enrolment in registration service
- [ ] Backend: ensure OH contribution line generated for expats even without Annuities
- [ ] Backend: link `work_injury` records to GOSI OH registration reference
- [ ] Frontend: OH coverage indicator on employee GOSI profile + injury link
- [ ] Rules/Config: OH employer rate (all nationalities) effective-dated
- [ ] Tests: unit tests for universal OH enrolment and expat OH contribution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
