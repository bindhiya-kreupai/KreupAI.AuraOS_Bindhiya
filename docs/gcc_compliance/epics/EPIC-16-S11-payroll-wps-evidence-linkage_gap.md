# Gap Analysis: EPIC-16-S11 — Payroll & WPS evidence linkage

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Links each counted national to monthly payroll records and WPS wage-file transfer confirmations, flags salary delays (> statutory window), missing transfers, and salary < declared, and assembles the wage-evidence section of the monthly pack.

**Covers:** 16.13
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a counted national, when the month closes, then payroll net pay and the corresponding WPS transfer are linked as evidence.
- [ ] Given a salary delay > 15 days or a missing WPS transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given WPS amount < declared payroll salary beyond tolerance, when detected, then a variance flag is raised and fed to fake-Emiratisation detection.
- [ ] Given the monthly pack, then per-national wage evidence is included with transfer reference and date.
- [ ] Given audit, then evidence links are immutable once the period is locked.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `wpsAmount`, `wpsTransferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll/WPS linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per national and per period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
