# Gap Analysis: EPIC-16-S12 — Retention of UAE national employees

> **✅ SHIPPED 2026-06-17** — Theme B closure. Shared `nationalisation-overlay` registry: requisition tags (TA pipeline), job/position tags, retention ledger with early-attrition flag, L&D plan tracker, artificial-risk detection (9 signals, banded LOW/MEDIUM/HIGH/CRITICAL), Saudi profession-localisation codes. Consumed by emiratisation-, nitaqat-, bahrainization-compliance services. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
A retention module tracking national tenure, attrition, flight-risk indicators and Nafis-linked tenure commitments, alerting when a counted national resigns or trips a risk indicator, and quantifying the gap/financial impact of attrition.

**Covers:** 16.14
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/integration/employees/employees.test.ts
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/api/core-hr/employees/[employeeId]/route.ts
- apps/web/src/app/api/core-hr/employees/route.ts
- apps/web/src/app/api/employees/autocomplete/route.ts
- apps/web/src/app/api/employees/search/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given national employees, when tenure/attrition is computed, then national attrition rate and at-risk nationals are shown.
- [ ] Given a counted national submits resignation, when recorded, then the projected gap impact and fine/subsidy effect are surfaced.
- [ ] Given a Nafis tenure commitment, when at risk of breach, then an alert is raised.
- [ ] Given retention actions, then interventions are logged and linked to the employee.
- [ ] Given RBAC, then retention-risk data is restricted to HR Manager/Compliance.

## Implementation Tasks From Backlog

- [ ] Backend: national retention analytics service (tenure, attrition, flight-risk).
- [ ] Backend: `emiratisation_retention_event` entity (`employeeId`, `eventType`, `gapImpact`, `financialImpact`).
- [ ] Frontend: retention-risk panel with at-risk list.
- [ ] Alerts/Workflow: resignation/risk alerts to HR Manager.
- [ ] Tests: unit tests for gap-impact calculation on attrition.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
