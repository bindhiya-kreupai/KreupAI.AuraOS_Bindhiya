# Gap Analysis: EPIC-10-S19 — HRMS payroll automation design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** payroll workflow automation and scheduling, **so that** the cycle runs end-to-end with minimal manual intervention.

**Description**
Implement the handbook's payroll automation design: scheduled cut-off enforcement, auto-ingest of inputs, auto trial-run, exception-only intervention, automated payslip/bank/GL emission on close, and event-driven notifications across the cycle, all configurable per entity.

**Covers:** 10.19
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a configured schedule, when the cut-off date arrives, then inputs auto-freeze and a trial run is auto-triggered.
- [ ] Given a clean run, when no exceptions exist, then it proceeds to the approval step automatically; otherwise it halts on exceptions.
- [ ] Given period close, when locked, then payslip, bank-file and GL events fire automatically.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: payroll scheduler/orchestrator + event-driven step transitions
- [ ] Backend: exception-only halt logic
- [ ] Frontend: automation/schedule configuration console
- [ ] Alerts/Workflow: cycle-stage notifications via event bus
- [ ] Tests: e2e test of an automated cycle with and without exceptions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
