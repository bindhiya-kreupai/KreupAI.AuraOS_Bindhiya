# Gap Analysis: EPIC-15-S17 — Sample SIO Monthly Compliance Certificate (Configurable Form)

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable SIO Monthly Compliance Certificate auto-populated from period data with attestation, **so that** I can certify and evidence SIO compliance.

**Description**
Provides a digital, template-driven SIO certificate auto-populated from the period (entity, establishment number, period, member count by population, total contribution salary, employer/employee totals, gratuity-funding total, submission reference, reconciliation status) with an e-attestation block. Configurable per entity, exports to PDF.

**Covers:** 15.21
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

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a finalised SIO period, when generated, then the certificate auto-populates entity, establishment number, period, member count, salary base, employer/employee totals, gratuity-funding total, submission reference, and reconciliation status.
- [ ] Given the template, when configured, then header/footer/clauses/logo are editable per entity without code.
- [ ] Given the certifying user, when they attest, then an e-signature with name, role and timestamp is recorded.
- [ ] Given generation, then it exports to PDF and attaches to the monthly pack.
- [ ] Given any certificate, then it is audited and versioned.

## Implementation Tasks From Backlog

- [ ] Backend: certificate template engine + period data-binding
- [ ] Backend: e-attestation capture and versioning
- [ ] Frontend: template editor + generate/attest screen
- [ ] Rules/Config: per-entity template configuration
- [ ] Tests: unit test for data-binding and PDF export

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
