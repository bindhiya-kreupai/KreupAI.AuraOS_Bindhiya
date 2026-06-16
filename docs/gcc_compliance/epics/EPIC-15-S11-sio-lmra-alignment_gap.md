# Gap Analysis: EPIC-15-S11 — SIO ↔ LMRA Alignment

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** SIO registrations reconciled against LMRA work-permit records, **so that** every SIO-registered worker has a valid LMRA permit and discrepancies are caught.

**Description**
SIO membership and LMRA work-permit status must align for expatriates (and the active workforce generally). This story cross-checks the SIO member list against LMRA permit data, flags workers in SIO without a valid LMRA permit (or vice versa), aligns leaving/cancellation events between SIO de-registration and LMRA permit cancellation, and surfaces mismatches for action.

**Covers:** 15.13
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

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given SIO members and LMRA permit data, when alignment runs, then workers in SIO without a valid LMRA permit (and permitted workers missing from SIO) are flagged.
- [ ] Given an exit, when SIO de-registration occurs, then the corresponding LMRA permit cancellation status is checked and a mismatch flagged if inconsistent.
- [ ] Given expired/cancelled LMRA permits, then affected SIO records are flagged for review.
- [ ] Given the alignment results, then they feed the dashboard, audit checklist, and variance handling.
- [ ] Given any alignment flag, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: SIO↔LMRA alignment service comparing member list vs permit data
- [ ] Backend: mismatch classification (SIO-only, LMRA-only, exit-cancellation mismatch)
- [ ] Frontend: SIO–LMRA alignment panel with drill-down
- [ ] Rules/Config: alignment thresholds and exit-event matching window
- [ ] Tests: unit tests for mismatch detection across scenarios

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
