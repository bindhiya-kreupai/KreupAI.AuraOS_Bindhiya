# Gap Analysis: EPIC-13-S15 — Sample GOSI Monthly Compliance Certificate (Configurable Form)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable GOSI Monthly Compliance Certificate generated from period data with management attestation, **so that** I can certify and evidence GOSI compliance for management and auditors.

**Description**
Provides a digital, template-driven GOSI compliance certificate auto-populated from the period (entity, GOSI registration number, period, total members, total contribution wage, employer/employee totals, submission date/reference, reconciliation status) with an e-attestation block. Template is configurable per entity and exports to PDF.

**Covers:** 13.20
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

- [ ] Given a finalised GOSI period, when a certificate is generated, then it auto-populates entity, registration number, period, member count, wage base, employer/employee totals, submission reference, and reconciliation status.
- [ ] Given the certificate template, when configured, then header/footer/clauses/logo are editable per entity without code changes.
- [ ] Given the certifying user, when they attest, then an e-signature/attestation with name, role, and timestamp is recorded.
- [ ] Given generation, then the certificate exports to PDF and attaches to the monthly pack.
- [ ] Given any certificate issued, then it is logged in the audit trail and versioned.

## Implementation Tasks From Backlog

- [ ] Backend: certificate template engine + data-binding from period
- [ ] Backend: e-attestation capture and versioning
- [ ] Frontend: certificate template editor + generate/attest screen
- [ ] Rules/Config: per-entity template configuration
- [ ] Tests: unit test for data-binding and PDF export

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
