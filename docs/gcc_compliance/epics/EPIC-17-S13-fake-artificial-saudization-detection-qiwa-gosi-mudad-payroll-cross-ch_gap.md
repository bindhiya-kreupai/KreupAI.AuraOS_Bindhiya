# Gap Analysis: EPIC-17-S13 — Fake/artificial Saudization detection (Qiwa + GOSI + Mudad/payroll cross-checks)

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** automated detection of artificial Saudization by cross-checking Qiwa, GOSI and Mudad/payroll, **so that** we never count ghost Saudis and avoid Qiwa penalties and band downgrade.

**Description**
A red-flag engine scoring each counted Saudi for genuineness: GOSI registration present and wage-matched, authenticated Qiwa contract present, Mudad shows a real monthly wage transfer matching declared salary, attendance/active status, and no clustering anomalies (mass same-day GOSI registrations before a band check, identical near-minimum wages, no attendance/access, Saudis "parked" with no genuine role). Flags feed the artificial-Saudization risk register (S20).

**Covers:** 17.15
**Acceptance criteria count:** 7 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a counted Saudi with no matching GOSI registration, when scanned, then a high-severity artificial-Saudization flag is raised.
- [ ] Given a Saudi with no authenticated Qiwa contract or with a wage far below declared, when scanned, then a flag with variance is raised.
- [ ] Given a Mudad transfer absent or far below payroll salary, when scanned, then a flag is raised.
- [ ] Given mass same-day GOSI registrations shortly before a band check with no attendance, when detected, then a clustering/ghost-Saudization pattern flag is raised.
- [ ] Given each flag, then a risk score, evidence references (Qiwa/GOSI/Mudad/payroll) and recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then thresholds (variance %, cluster size, timing window) are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: reuse/extend `fake_nationalization_flag` entity (`employeeId`, `countryCode='SA'`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining Qiwa contract, GOSI registration, Mudad transfer and payroll wage.
- [ ] Backend: anomaly/clustering rules (mass same-day GOSI registration, identical wages, no attendance/access, registration-timing before band check).
- [ ] Frontend: detection results screen with evidence drill-down and disposition.
- [ ] Rules/Config: configurable variance/cluster/timing thresholds per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests for missing-GOSI, no-Qiwa-contract, Mudad-variance and clustering scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
