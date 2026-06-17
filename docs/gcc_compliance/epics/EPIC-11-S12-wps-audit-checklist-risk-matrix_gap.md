# Gap Analysis: EPIC-11-S12 — WPS audit checklist & risk matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3

**Description**
Provide a configurable WPS audit checklist (e.g., coverage completeness, on-time submission, reconciliation closed, bank details valid, registered-vs-paid match) and a risk matrix of WPS risks (salary delay, partial payment, ghost/unreported employees, mismatched wages) with likelihood × impact scoring and remediation tracking.

**Covers:** 11.15, 11.17
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/qatar-wps/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the checklist, when run for a period, then it flags red-flag conditions (late submission, uncovered employees, open reconciliation breaks, invalid bank data).
- [ ] Given a risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given checklist/risk items, when configured, then they are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: WPS audit-rule engine + `wps_risk_register`
- [ ] Frontend: WPS audit checklist runner + risk heatmap
- [ ] Rules/Config: configurable red-flag rules and scoring
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
