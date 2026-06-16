# Gap Analysis: EPIC-18-S11 — Payroll wage evidence linkage

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Links each counted Bahraini to monthly payroll records and wage-transfer confirmations, flags salary delays, missing transfers and wage < declared, and assembles the wage-evidence section of the monthly pack.

**Covers:** 18.13
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
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a counted Bahraini, when the month closes, then payroll net pay and the wage transfer are linked as evidence.
- [ ] Given a salary delay beyond the statutory window or a missing transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given a transfer amount < declared payroll wage beyond tolerance, when detected, then a variance flag is raised and fed to artificial-Bahrainization detection.
- [ ] Given the monthly pack, then per-Bahraini wage evidence with transfer reference and date is included.
- [ ] Given the period lock, then evidence links become immutable.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `transferAmount`, `transferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per Bahraini and period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
