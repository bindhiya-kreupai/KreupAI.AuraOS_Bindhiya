# Gap Analysis: EPIC-15-S03 — Employer Registration & Portal Access

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
Captures and validates the employer SIO establishment registration: SIO establishment/employer number, registration date, status, portal-access details, and linkage to the Bahrain legal entity, with multi-establishment support. This record is the parent for all employee SIO registrations and monthly files.

**Covers:** 15.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/lib/services/compliance/**tests**/bahrain-sio-portal.service.test.ts
- apps/web/src/lib/services/compliance/bahrain-sio-portal.service.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a Bahrain legal entity, when registered, then the SIO establishment number, registration date and portal-access reference are captured and format-validated.
- [ ] Given multiple legal entities, when each is registered, then each files independently under its own establishment.
- [ ] Given an establishment status change, when recorded, then dependent employee processing respects it.
- [ ] Given missing establishment registration, when employee registration is attempted, then it is blocked with a clear message.
- [ ] Given any establishment/access change, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: extend `sio_establishment` (establishmentNo, registrationDate, status, portalAccessRef) + migration
- [ ] Backend: guard preventing employee registration without active establishment
- [ ] Frontend: employer SIO establishment + access management screen
- [ ] Rules/Config: per-entity establishment configuration
- [ ] Tests: unit tests for validation and block-without-establishment

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
