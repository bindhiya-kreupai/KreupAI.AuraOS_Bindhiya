# Gap Analysis: EPIC-26-S12 — Disciplinary KPIs, Dashboard & Automation Design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 8

**Description**
Builds disciplinary analytics (KPIs: cases by type/severity, penalty distribution, % with hearing, average time-to-decision, deduction-cap breaches prevented, appeal/overturn rate, dismissal rate, repeat-offender rate, consistency-flag rate) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation blueprint (matrix evaluation, gates, alerts, escalation).

**Covers:** 26.21, 26.23, 26.24
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given disciplinary data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given overturn/consistency-flag/cap-breach metrics, when present, then they are highlighted with trends.
- [ ] Given the automation design, when configured, then matrix evaluation, gates and escalations run on case events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then individual case detail is masked while aggregate KPIs remain.
- [ ] Given KPI computation, when run, then figures reconcile with the disciplinary register.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation + materialised views; automation rules on event bus.
- [ ] Backend: dashboard APIs with RBAC masking.
- [ ] Frontend: disciplinary dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
