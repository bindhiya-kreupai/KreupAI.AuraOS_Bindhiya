# Gap Analysis: EPIC-17-S08 — Payroll & Mudad wage evidence linkage

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Links each counted Saudi to monthly payroll and Mudad wage-file transfer confirmations, flags salary delays, missing transfers and Mudad amount < declared salary, and assembles the wage-evidence section of the monthly pack.

**Covers:** 17.10
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a counted Saudi, when the month closes, then payroll net pay and the Mudad transfer are linked as evidence.
- [ ] Given a salary delay beyond the statutory window or a missing Mudad transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given Mudad amount < declared payroll wage beyond tolerance, when detected, then a variance flag is raised and fed to artificial-Saudization detection.
- [ ] Given the monthly pack, then per-Saudi wage evidence with transfer reference and date is included.
- [ ] Given the period lock, then evidence links become immutable.

## Implementation Tasks From Backlog

- [ ] Backend: `saudization_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `mudadAmount`, `mudadTransferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll/Mudad linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per Saudi and period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
