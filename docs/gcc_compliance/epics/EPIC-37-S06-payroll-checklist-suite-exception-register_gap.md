# Gap Analysis: EPIC-37-S06 — Payroll checklist suite & exception register

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the full payroll checklist suite with an exception register, **so that** every payroll input, event and reconciliation is verified before the run is certified.

**Description**
Materialize the Appendix A4 payroll checklist suite as templates — monthly master, inputs, new-joiner, exit, salary-change, allowances, deductions, overtime, leave, salary-advance, loan, bonus/commission, WPS, Mudad, social-insurance, final-settlement and reconciliation checklists — with payroll red flags and a payroll exception register that captures, owns and tracks failures to resolution before lock/certification.

**Covers:** A4.4, A4.5, A4.6, A4.7, A4.8, A4.9, A4.10, A4.11, A4.12, A4.13, A4.14, A4.15, A4.16, A4.17, A4.18, A4.19, A4.20, A4.21
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

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a payroll period, when the master and sub-checklists run, then all input/event/reconciliation items are evaluated with red flags.
- [ ] Given a failed item (e.g., missing input, WPS/Mudad gap, GOSI mismatch, reconciliation break), when detected, then a payroll exception is raised with owner and due date.
- [ ] Given open critical exceptions, when present, then payroll certification is blocked until closed or accepted.
- [ ] Given checklist/exception actions, when taken, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: payroll checklist templates + `payroll_exception` register linked to runs
- [ ] Backend: payroll red-flag rules (inputs, WPS/Mudad, GOSI, reconciliation)
- [ ] Frontend: payroll checklist suite + exception register
- [ ] Rules/Config: payroll red-flag thresholds per country
- [ ] Alerts/Workflow: exception SLA + certification gating
- [ ] Tests: integration tests for exception capture and certification gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
