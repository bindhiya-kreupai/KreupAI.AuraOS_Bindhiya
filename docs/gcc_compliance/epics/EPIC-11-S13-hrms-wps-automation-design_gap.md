# Gap Analysis: EPIC-11-S13 — HRMS WPS automation design

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** WPS automation wired to payroll close, **so that** wage files generate, validate and submit with exception-only intervention.

**Description**
Implement the WPS automation design: on payroll lock, auto-generate the country wage file, auto-run controls, auto-submit (or stage for release) via the authority/bank adapter, ingest confirmations, auto-trigger reconciliation, and notify on exceptions/delays — all event-driven and configurable per entity.

**Covers:** 11.18
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

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a payroll lock event, when received, then the correct country wage file is auto-generated and validated.
- [ ] Given a clean file, when controls pass, then it auto-submits or stages for authorized release per config; on failure it halts with exceptions.
- [ ] Given an authority confirmation/return, when received, then reconciliation auto-triggers and statuses update.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: WPS orchestrator consuming payroll-lock events + submission/confirmation adapters
- [ ] Backend: event-driven generate→validate→submit→reconcile pipeline
- [ ] Frontend: WPS automation configuration console
- [ ] Alerts/Workflow: stage notifications + exception halts
- [ ] Tests: e2e test of automated WPS cycle with and without exceptions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
