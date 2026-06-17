# Gap Analysis: EPIC-25-S13 — ER KPIs, Dashboard & ER Automation Design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 8

**Description**
Builds the ER analytics layer (KPIs: open cases, average resolution time, SLA compliance %, % formal vs informal, harassment/discrimination counts, repeat-respondent rate, appeal rate, retaliation flags) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation design (auto-triage, SLA timers, alerts, escalation) documented as the module's automation blueprint.

**Covers:** 25.25, 25.27, 25.28
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

- [ ] Given grievance data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given SLA breaches/critical cases, when present, then they are highlighted with trend lines.
- [ ] Given the automation design, when configured, then auto-triage, SLA timers and escalation rules run on case events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then sensitive case details are masked while aggregate KPIs remain visible.
- [ ] Given KPI computation, when run, then figures reconcile with the grievance register.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation services + materialised views; automation rules wired to event bus.
- [ ] Backend: dashboard data APIs with RBAC masking.
- [ ] Frontend: ER dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: configurable KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard-driven alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
