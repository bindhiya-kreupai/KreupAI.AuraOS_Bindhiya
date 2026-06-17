# Gap Analysis: EPIC-11-S14 — WPS document library, policy & monthly certificate

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a WPS document library, compliance policy and monthly compliance certificate, **so that** wage-protection evidence and governance are standardized and auditable.

**Description**
Maintain a WPS document library (per-period files, confirmations, reconciliation packs, exception logs), a configurable WPS compliance policy template, and a monthly WPS compliance certificate attesting timely payment, full coverage, reconciliation and exception closure, with the key-takeaways reference; all versioned and exportable.

**Covers:** 11.19, 11.20, 11.21, 11.22
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/file-history/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a period, when closed, then all WPS artifacts (files, confirmations, reconciliation pack, exceptions) are filed in the document library against the period/entity.
- [ ] Given the policy template, when configured, then it can be versioned, published and acknowledged.
- [ ] Given the monthly certificate, when generated, then it attests on-time payment, coverage %, reconciliation status and exception closure, signed off by the authorized role.
- [ ] Given export, when requested, then policy, certificate and library items export to PDF and are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: WPS document-library store keyed by period/entity + certificate generator
- [ ] Backend: configurable WPS policy template with versioning
- [ ] Frontend: WPS document library + policy editor + certificate view with e-sign/export
- [ ] Rules/Config: certificate attestation fields per country
- [ ] Tests: integration tests for certificate attestation gating on reconciliation/exceptions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
