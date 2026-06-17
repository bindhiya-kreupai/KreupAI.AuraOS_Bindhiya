# Gap Analysis: EPIC-17-S12 — Retention of Saudi employees

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5

**Description**
Tracks Saudi tenure, attrition, flight-risk indicators and HRDF/Tamheer commitments, alerting when a counted Saudi resigns or trips a risk indicator and quantifying the band/financial impact.

**Covers:** 17.14
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

- [ ] Given Saudi employees, when computed, then Saudi attrition rate and at-risk Saudis are shown.
- [ ] Given a counted Saudi resignation, when recorded, then projected band impact and any HRDF-support effect are surfaced.
- [ ] Given an HRDF/Tamheer commitment at risk, when detected, then an alert is raised.
- [ ] Given interventions, then they are logged and linked to the employee.
- [ ] Given RBAC, then retention-risk data is restricted to HR Manager/Compliance.

## Implementation Tasks From Backlog

- [ ] Backend: Saudi retention analytics service (tenure, attrition, flight-risk).
- [ ] Backend: `saudization_retention_event` entity (`employeeId`, `eventType`, `bandImpact`, `financialImpact`).
- [ ] Frontend: retention-risk panel with at-risk list.
- [ ] Alerts/Workflow: resignation/risk alerts to HR Manager.
- [ ] Tests: unit tests for band-impact on attrition.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
