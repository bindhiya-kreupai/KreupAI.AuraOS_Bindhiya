# Gap Analysis: EPIC-14-S03 — Employer Registration & Establishment Setup

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
Captures and validates the employer GPSSA establishment registration: establishment number, registration date, status, and linkage to the UAE legal entity, including multi-establishment support where a group has several registered entities. This record is the parent for all employee GPSSA registrations and monthly files.

**Covers:** 14.6
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given a UAE legal entity, when registered, then the GPSSA establishment number and registration date are captured and format-validated.
- [ ] Given multiple legal entities, when each is registered, then each has its own establishment record and files independently.
- [ ] Given an establishment status change (active/suspended), when recorded, then dependent employee processing respects the status.
- [ ] Given missing establishment registration, when employee registration is attempted, then it is blocked with a clear message.
- [ ] Given any establishment change, then it is written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: extend `gpssa_establishment` (establishmentNo, registrationDate, status) + migration
- [ ] Backend: guard preventing employee registration without active establishment
- [ ] Frontend: employer GPSSA establishment management screen
- [ ] Rules/Config: per-entity establishment configuration
- [ ] Tests: unit tests for validation and block-without-establishment

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
