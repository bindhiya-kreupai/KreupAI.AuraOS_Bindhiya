# Gap Analysis: EPIC-28-S19 — Sample EOSB Monthly Compliance Certificate (Configurable Form)

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable EOSB Monthly Compliance Certificate auto-populated from period data with attestation, **so that** I can certify and evidence EOSB compliance and provisioning.

**Description**
Provides a digital, template-driven EOSB certificate auto-populated from the period (entity, country, total accrued liability, provision movement, settlements completed and on-time %, open disputes, provision-vs-actual variance, netting total) with an e-attestation block. Configurable per entity, exports to PDF and attaches to the monthly pack.

**Covers:** 28.29
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a finalised EOSB period, when generated, then the certificate auto-populates entity, country, total liability, provision movement, settlement stats, disputes, and provision-vs-actual variance.
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
