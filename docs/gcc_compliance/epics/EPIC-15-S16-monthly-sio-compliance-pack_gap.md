# Gap Analysis: EPIC-15-S16 — Monthly SIO Compliance Pack

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a one-click Monthly SIO Compliance Pack, **so that** I have a complete sign-off-ready evidence bundle each month.

**Description**
Compiles the period's SIO artefacts into one downloadable pack: submission file reference + upload confirmation, reconciliation summary, variance register, KPI snapshot, gratuity-funding summary, LMRA-alignment exceptions, and the compliance certificate. Requires sign-off, is versioned and archived for retention.

**Covers:** 15.20
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- packages/@aura/database/src/extensions/audit-log.ts
- packages/@aura/database/src/extensions/index.ts
- packages/@aura/database/src/extensions/soft-delete.ts
- packages/@aura/database/src/seeds/22-benefits.seed.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a closed and reconciled SIO period, when the pack is generated, then it includes file ref/upload confirmation, reconciliation summary, variance register, KPI snapshot, gratuity-funding summary, and LMRA-alignment exceptions.
- [ ] Given the pack, then it requires Compliance Officer sign-off before Final.
- [ ] Given an unreconciled period, when generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

## Implementation Tasks From Backlog

- [ ] Backend: compliance-pack assembler aggregating run/recon/variance/KPI/gratuity/LMRA artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack contents and block-on-unreconciled

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
