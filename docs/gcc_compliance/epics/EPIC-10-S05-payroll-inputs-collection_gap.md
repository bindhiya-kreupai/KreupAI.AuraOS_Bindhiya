# Gap Analysis: EPIC-10-S05 — Payroll inputs collection

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** all variable inputs collected and validated before the run, **so that** payroll is calculated on complete, approved data.

**Description**
Aggregate period inputs — attendance/LWP (EPIC-19), leave (EPIC-20), approved overtime (EPIC-12), one-time earnings/deductions, new joiners/leavers, salary changes — with a completeness checklist and mandatory-input validation that gates the run.

**Covers:** 10.5
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/api/payroll/payslips/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a period, when input collection runs, then attendance, leave, OT, joiners/leavers and one-time payments are ingested from source modules.
- [ ] Given mandatory inputs, when any are missing (e.g., unposted attendance, unapproved OT, pending bank details), then the run is blocked and the gaps are listed.
- [ ] Given an input source change after ingest but before cut-off, when synced, then inputs refresh and the completeness status updates.
- [ ] Given any manual input entry, when saved, then it is captured with source and audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: input-aggregation service pulling from attendance/leave/OT modules + `payroll_input` store
- [ ] Backend: mandatory-input completeness checklist + run-gate
- [ ] Frontend: input collection dashboard with per-employee completeness
- [ ] Rules/Config: configurable mandatory-input list per entity
- [ ] Alerts/Workflow: missing-input alerts to Payroll Officer before cut-off
- [ ] Tests: integration tests for run-block on missing mandatory inputs

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
