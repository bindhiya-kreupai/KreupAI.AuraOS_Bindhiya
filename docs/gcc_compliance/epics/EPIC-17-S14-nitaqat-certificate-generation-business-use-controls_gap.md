# Gap Analysis: EPIC-17-S14 — Nitaqat certificate generation & business use controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** the Nitaqat certificate captured with its band and expiry, plus controls tied to its business uses, **so that** we don't lose tenders, visa quotas or permit services because of an expired or downgraded certificate.

**Description**
Stores the current Nitaqat certificate (band, ratio, issue/expiry), tracks its business-use dependencies (visa quota issuance, work-permit renewal, contract authentication, government tenders/contracting prequalification), and alerts at 60/30/7 days before expiry or on a band downgrade that would impair those services.

**Covers:** 17.16
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a Nitaqat certificate, when stored, then band, ratio, issue and expiry dates and document are captured.
- [ ] Given 60/30/7 days before expiry, when reached, then tiered renewal alerts are raised to Compliance/PRO.
- [ ] Given a band downgrade to Yellow/Red, when detected, then impacted business uses (visa quota, permit renewals, tenders) are flagged with impact.
- [ ] Given a tender requiring a minimum band, when checked, then eligibility (meets/does-not-meet) is shown.
- [ ] Given config, then business-use thresholds and certificate fields are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: `nitaqat_certificate` entity (`entityId`, `band`, `ratio`, `issueDate`, `expiryDate`, `documentRef`).
- [ ] Backend: business-use impact + tender-eligibility service.
- [ ] Frontend: certificate panel with expiry/band status and business-use impacts.
- [ ] Rules/Config: configurable business-use band thresholds and alert tiers (60/30/7).
- [ ] Alerts/Workflow: expiry and downgrade alerts to Compliance/PRO.
- [ ] Tests: integration tests for expiry alerts and tender-eligibility checks.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
