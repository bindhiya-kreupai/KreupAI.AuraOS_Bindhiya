# Gap Analysis: EPIC-14-S11 — GPSSA ↔ Emiratisation Evidence Linkage

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** GPSSA registration and contribution data linked to Emiratisation evidence, **so that** counted UAE nationals are genuinely registered and contributing, and fake-Emiratisation risk is detected.

**Description**
GPSSA registration plus active contribution is the proof that a UAE national is genuinely employed for Emiratisation purposes. This story exposes GPSSA registration/contribution status to the Emiratisation module, flags nationals counted for Emiratisation but not registered or not contributing in GPSSA, and surfaces inconsistencies (e.g. registered but zero/near-zero salary) as fake-Emiratisation red-flags.

**Covers:** 14.13
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a UAE national counted for Emiratisation, when cross-checked, then their GPSSA registration and current-period contribution status are exposed.
- [ ] Given a counted national with no GPSSA registration or no contribution, when detected, then a fake-Emiratisation red-flag is raised.
- [ ] Given a registered national with anomalously low GPSSA salary vs role, when detected, then it is flagged for review.
- [ ] Given the linkage, when consumed by the Emiratisation epic, then a stable API/event provides per-national GPSSA evidence.
- [ ] Given any flag, then it is written to the audit trail and surfaced on the dashboard.

## Implementation Tasks From Backlog

- [ ] Backend: GPSSA evidence API/event for Emiratisation (registration + contribution status)
- [ ] Backend: fake-Emiratisation red-flag rules (unregistered / non-contributing / anomalous salary)
- [ ] Frontend: GPSSA–Emiratisation consistency panel
- [ ] Rules/Config: anomaly thresholds
- [ ] Tests: unit tests for red-flag detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
