# Gap Analysis: EPIC-11-S08 — WPS exception management

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** a WPS exception workflow, **so that** rejected records, mismatches and delays are tracked to resolution.

**Description**
Manage WPS exceptions (file rejections, returned records, reconciliation breaks, missing bank details, salary delays) as tracked cases with owner, root cause, corrective action, re-submission linkage and SLA, ensuring nothing falls through before certification.

**Covers:** 11.12
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

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a rejected/returned record or reconciliation break, when raised, then a WPS exception case is created with type, owner and due date.
- [ ] Given an exception, when resolved, then root cause, corrective action and (where applicable) the re-submission reference are captured.
- [ ] Given open exceptions, when a period is certified, then certification is blocked until critical exceptions are closed or formally accepted.
- [ ] Given any exception action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `wps_exception` schema with lifecycle, SLA and re-submission link
- [ ] Backend: certification-gate on open critical exceptions
- [ ] Frontend: WPS exception register/board with SLA aging
- [ ] Alerts/Workflow: SLA-breach and unresolved-exception alerts
- [ ] Tests: integration tests for certification gating on open exceptions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
