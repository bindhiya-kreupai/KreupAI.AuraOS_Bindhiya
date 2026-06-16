# Gap Analysis: EPIC-18-S12 — Bahrainization certificate generation & tracking

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** the Bahrainization certificate captured with ratio, status and expiry plus renewal alerts, **so that** we never lose permit or tender eligibility to an expired certificate.

**Description**
Stores the current Bahrainization certificate (ratio, status, issue/expiry), tracks its business-use dependencies (LMRA permit issuance/renewal, tender prequalification), and alerts at 60/30/7 days before expiry or when the ratio falls below the level required to maintain the certificate.

**Covers:** 18.14
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

- [ ] Given a Bahrainization certificate, when stored, then ratio, status, issue and expiry dates and document are captured.
- [ ] Given 60/30/7 days before expiry, when reached, then tiered renewal alerts go to Compliance/PRO.
- [ ] Given the ratio falling below the maintenance level, when detected, then a certificate-risk flag with impacted business uses is raised.
- [ ] Given a permit or tender requiring the certificate, when checked, then eligibility is shown.
- [ ] Given config, then certificate fields and maintenance thresholds are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_certificate` entity (`entityId`, `ratio`, `status`, `issueDate`, `expiryDate`, `documentRef`).
- [ ] Backend: certificate-risk + eligibility service.
- [ ] Frontend: certificate panel with expiry/status and business-use impacts.
- [ ] Rules/Config: configurable maintenance thresholds and alert tiers (60/30/7).
- [ ] Alerts/Workflow: expiry and ratio-drop alerts to Compliance/PRO.
- [ ] Tests: integration tests for expiry alerts and eligibility checks.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
