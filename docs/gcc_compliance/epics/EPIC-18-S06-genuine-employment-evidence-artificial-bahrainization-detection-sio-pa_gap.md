# Gap Analysis: EPIC-18-S06 — Genuine employment evidence & artificial-Bahrainization detection (SIO + payroll cross-checks)

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** automated genuine-employment evidence and artificial-Bahrainization detection cross-checking SIO and payroll, **so that** we never count ghost Bahrainis and avoid LMRA penalties and permit blocking.

**Description**
A red-flag engine scoring each counted Bahraini for genuineness using cross-source signals: SIO registration present and wage-matched, payroll shows a real wage transfer consistent with role/grade, attendance/active status, and no clustering anomalies (mass same-day SIO registrations before a permit/tender check, identical near-minimum wages, "phantom" Bahrainis with no attendance/system access or registered only to unlock expat permits). Flags feed the artificial-Bahrainization risk register (S18).

**Covers:** 18.8
**Acceptance criteria count:** 7 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/bahrain-sio/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a counted Bahraini with no matching SIO registration, when scanned, then a high-severity artificial-Bahrainization flag is raised.
- [ ] Given a Bahraini whose payroll/SIO wage is absent or far below declared, when scanned, then a flag with the variance is raised.
- [ ] Given mass same-day SIO registrations shortly before a permit/tender check with no attendance, when detected, then a clustering/phantom-Bahrainization pattern flag is raised.
- [ ] Given a Bahraini with no attendance or system access over a sustained period, when detected, then a phantom-employee flag is raised.
- [ ] Given each flag, then a risk score, evidence references (SIO/payroll/attendance) and a recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then thresholds (variance %, cluster size, timing window) are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: reuse/extend `fake_nationalization_flag` entity (`employeeId`, `countryCode='BH'`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining SIO registration, payroll wage and attendance.
- [ ] Backend: anomaly/clustering rules (mass same-day SIO registration before permit/tender check, identical wages, no attendance/access).
- [ ] Frontend: detection results screen with evidence drill-down and disposition.
- [ ] Rules/Config: configurable variance/cluster/timing thresholds per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests for missing-SIO, wage-variance, clustering and phantom-employee scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
