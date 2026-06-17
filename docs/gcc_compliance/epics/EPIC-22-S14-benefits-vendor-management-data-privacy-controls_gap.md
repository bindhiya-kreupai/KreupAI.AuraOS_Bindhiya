# Gap Analysis: EPIC-22-S14 — Benefits vendor management & data privacy controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to manage benefit vendors and enforce data-privacy controls, **so that** insurer/provider contracts, SLAs and renewals are tracked and only minimum necessary personal data is shared with consent.

**Description**
Maintain a vendor register (insurers, clinics, EAP, transport, catering, telecom) with contract/SLA/renewal tracking, and enforce data-minimization, masking and consent for any benefit data (medical, dependants) shared internally or with vendors.

**Covers:** 22.20, 22.21
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/dashboard/benefits/data.ts
- packages/@aura/database/src/seeds/22-benefits.seed.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given a benefit vendor, when recorded, then contract, SLA, policy document, renewal date and DPA/consent status are captured.
- [ ] Given a contract/policy renewal, when 60/30 days out, then an alert fires to the Benefits Owner.
- [ ] Given a data export to a vendor, then only fields the vendor is entitled to are included and the export is logged.
- [ ] Given sensitive benefit fields (diagnosis, dependant medical), then they are masked by default and require elevated RBAC plus a logged reason to view.
- [ ] Given a privacy consent withdrawal, then affected vendor sharing is flagged for review and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_vendor`, `vendor_contract`, `data_sharing_log`, `privacy_consent` schema
- [ ] Backend: data-minimization + masking middleware; consent service
- [ ] Frontend: vendor register + privacy/consent admin
- [ ] Rules/Config: field-level entitlement per vendor; country privacy rules
- [ ] Alerts/Workflow: contract/renewal alerts
- [ ] Tests: unit (masking/entitlement) + integration (export filtering)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
