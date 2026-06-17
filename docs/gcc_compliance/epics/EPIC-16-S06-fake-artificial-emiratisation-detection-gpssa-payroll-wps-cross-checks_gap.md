# Gap Analysis: EPIC-16-S06 — Fake/artificial Emiratisation detection (GPSSA + payroll + WPS cross-checks)

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** automated detection of fake/artificial Emiratisation by cross-checking GPSSA, payroll and WPS, **so that** we never count ghost or non-genuine nationals and avoid Tawteen blacklisting.

**Description**
A red-flag engine scoring each counted UAE national for genuineness using cross-source signals: GPSSA registration present and salary-matched, WPS shows an actual monthly wage transfer to the employee's account, payroll shows a real salary consistent with role/grade, attendance/active status, and no clustering anomalies (e.g., many nationals registered same day, identical low salaries, no system access). Flags feed the fake-Emiratisation risk register (S20).

**Covers:** 16.8
**Acceptance criteria count:** 6 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a counted national with no matching GPSSA registration, when scanned, then a high-severity fake-Emiratisation flag is raised.
- [ ] Given a national whose WPS transfer is absent or far below declared payroll salary, when scanned, then a flag with the variance is raised.
- [ ] Given multiple nationals onboarded the same day with identical near-minimum salaries and no attendance, when detected, then a clustering/ghost-employment pattern flag is raised.
- [ ] Given each flag, then a risk score, evidence references (GPSSA/payroll/WPS records) and a recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then detection thresholds (variance %, cluster size) are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: `fake_nationalization_flag` entity (`employeeId`, `countryCode`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining GPSSA registration, payroll salary and WPS transfer data.
- [ ] Backend: anomaly/clustering rules (same-day onboarding, identical salary, no attendance/access).
- [ ] Frontend: detection results screen with evidence drill-down and disposition action.
- [ ] Rules/Config: configurable variance/cluster thresholds and severity mapping per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests covering missing-GPSSA, WPS-variance and clustering scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
