# Analytics & Reporting Completion Guide

**Document Version**: 1.0
**Last Updated**: July 12, 2026
**Owner**: Platform Backend Team
**Status**: Planning Ready
**Estimated Timeline**: 5 phases (sequenced with AI & Automation)
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [AI & Automation Completion Guide](./GUIDE-AI-AUTOMATION-COMPLETION.md)
5. [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md) — covers file generation/delivery mechanics; this guide covers the report/dashboard _definition and execution engine_ that produces the data those exports serialize
6. Source requirements: [docs/marketing/FEATURES-GUIDE.md](../marketing/FEATURES-GUIDE.md), Section 11 "Analytics & Reporting"

## Overview

This guide completes the **Analytics & Reporting** module (`apps/web/src/app/dashboard/analytics/`, 32 pages) so that Dashboards, Report Builder, Standard Reports, and Advanced Analytics are backed by a real query/execution engine instead of mock data.

### Current Evidence

Confirmed via `docs/qa-reports/MODULES-SUMMARY-REPORT.md`: Analytics & Reporting is **55% complete, Quality Score 6.5/10** — "Mock analytics calculations. No real-time data. Limited customization."

Representative mock-backed paths:

- [../../apps/web/src/app/dashboard/analytics/services.ts](../../apps/web/src/app/dashboard/analytics/services.ts)
- [../../apps/web/src/app/dashboard/analytics/types.ts](../../apps/web/src/app/dashboard/analytics/types.ts)
- [../../apps/web/src/app/dashboard/analytics/data.ts](../../apps/web/src/app/dashboard/analytics/data.ts)

Only 2 real API routes exist against 32 frontend pages:

- [../../apps/web/src/app/api/analytics/predictive/route.ts](../../apps/web/src/app/api/analytics/predictive/route.ts)
- [../../apps/web/src/app/api/analytics/hr-dashboard/route.ts](../../apps/web/src/app/api/analytics/hr-dashboard/route.ts)

Existing Prisma schema already provisioned but largely unused (`packages/@aura/database/prisma/schema.prisma`):

- `ReportDefinition` — query spec: `columns`, `filters`, `groupBy`, `sortBy`, `chartType`, `chartConfig`, `isPublic`, `isScheduled`, `scheduleConfig`
- `ReportExecution` — materialized run: `resultData`, `exportUrl`, `exportFormat`, `status`, `recordCount`, `executionTime`
- `DashboardWidget` — `type`, `dataSource`, `config`, `position`, `roles` (role-filtered visibility)
- `PredictiveModel` / `Prediction` — shared with the AI & Automation module for Advanced Analytics' predictive models

---

## Objective

Build one generic, reusable report/dashboard query engine — driven by `ReportDefinition` and `DashboardWidget` — that serves Standard Reports, Custom Report Builder, Dashboards, and Advanced Analytics, rather than four separate ad hoc implementations.

---

## Functional Scope

### Dashboards

1. Executive Dashboard, HR Dashboard, Manager Dashboard, Employee Dashboard — role-filtered views over the same `DashboardWidget` engine

### Report Builder

1. Custom Reports (drag-and-drop → `ReportDefinition` CRUD)
2. Saved Reports (reusable `ReportDefinition` templates)
3. Scheduled Reports (`isScheduled` + `scheduleConfig` → job)
4. Export Options (delegates to [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md) for file generation)

### Standard Reports

1. Headcount Reports, Turnover Reports, Compensation Reports, Compliance Reports — pre-seeded `ReportDefinition` rows, not bespoke code paths

### Advanced Analytics

1. Trend Analysis, Benchmarking, What-If Analysis — aggregation queries over the report engine
2. Predictive Models — reads from the same `Prediction` table populated by the AI & Automation module (do not build a second predictive pipeline)

---

## Phased Plan

### Phase 1: Generic Report Execution Engine

Deliverables:

1. Safe, parameterized query builder that turns a `ReportDefinition` (`dataSource`, `columns`, `filters`, `groupBy`, `sortBy`) into an executable, tenant-scoped Prisma query — no raw SQL from user input
2. `POST /api/analytics/reports/:id/execute` creates a `ReportExecution` row with `resultData`
3. Seed Standard Reports (Headcount, Turnover, Compensation, Compliance) as `ReportDefinition` rows consuming this engine

### Phase 2: Custom Report Builder + Export Options

Deliverables:

1. CRUD API for `ReportDefinition` (`GET/POST /api/analytics/reports`, `PUT/DELETE /api/analytics/reports/:id`)
2. Report Builder UI wired to this CRUD instead of `services.ts` mocks
3. Export Options routed through the existing `exceljs`/`pdfkit` libraries per the Export and Reporting Completion Guide — this guide only produces `resultData`; it does not duplicate file-generation logic

### Phase 3: Scheduled Reports

Deliverables:

1. Scheduled job (matching the existing Notification module's BullMQ job pattern) that scans `ReportDefinition.isScheduled` rows and creates `ReportExecution` runs on the configured cadence
2. Delivery hook (email) reusing the existing notification delivery channel, not a new one

### Phase 4: Dashboards

Deliverables:

1. `GET /api/analytics/dashboards/:id/widgets` — role-filtered by `DashboardWidget.roles`
2. `POST /api/analytics/widgets` — widget CRUD
3. Dashboard Builder UI wired to widget CRUD
4. Executive/HR/Manager/Employee dashboards implemented as role-scoped widget sets, not four separate page implementations

### Phase 5: Advanced Analytics

Deliverables:

1. Trend Analysis / Benchmarking / What-If Analysis built as aggregation `ReportDefinition` variants on top of the Phase 1 engine
2. Predictive Models panel reads directly from `Prediction` rows populated by the AI & Automation module's Phase 2 (do not recompute predictions here)

---

## Required Architecture

### Report Request Lifecycle

1. Receive request (execute report or fetch dashboard widgets)
2. Validate permissions (`analytics:read`/`analytics:write`) and tenant scope
3. Resolve `ReportDefinition` or `DashboardWidget` config
4. Build parameterized query against the declared `dataSource`
5. Execute; persist `ReportExecution` (for reports) with `resultData`, `recordCount`, `executionTime`
6. Return result to caller; large exports hand off to the Export and Reporting pipeline for file generation
7. Emit audit event for report/dashboard creation, execution, and export access

### API Contract Convention

```
GET    /api/analytics/reports                 list ReportDefinition (tenant-scoped)
POST   /api/analytics/reports                  create ReportDefinition
PUT    /api/analytics/reports/:id              update ReportDefinition
POST   /api/analytics/reports/:id/execute      create ReportExecution, run query, return resultData
GET    /api/analytics/reports/:id/executions   execution history
POST   /api/analytics/reports/:id/schedule     set scheduleConfig / isScheduled
GET    /api/analytics/dashboards/:id/widgets   list DashboardWidget for a dashboard, role-filtered
POST   /api/analytics/widgets                  create DashboardWidget
GET    /api/analytics/predictive/:modelCode    latest Prediction rows (shared with AI & Automation)
```

---

## Security Rules

1. Every report/dashboard route is tenant-scoped and permission-checked (`analytics:read`/`analytics:write`), matching existing route wrapper conventions.
2. `ReportDefinition.dataSource` and `columns` must be validated against an allow-list of queryable fields per data source — never pass user input directly into a raw query.
3. `DashboardWidget.roles` must be enforced server-side, not only hidden client-side.
4. Report execution and export access must be audited (who ran what report, when, over what date range).
5. `ReportExecution.resultData` containing PII must respect the same data-masking rules defined in the Security & Access Control Completion Guide once available.

---

## Testing Strategy

### Unit Tests

1. Query builder: filters, grouping, sorting translate correctly and safely
2. Allow-list validation rejects unknown fields/data sources

### Integration Tests

1. Report execution end-to-end: `ReportDefinition` → `ReportExecution` with real `resultData`
2. Scheduled report job creates executions on schedule
3. Dashboard widget fetch respects role filtering
4. Tenant isolation across all report/dashboard routes

### Performance Tests

1. Large-tenant Standard Report execution (Headcount/Turnover) within target latency
2. Dashboard widget fetch for a dashboard with 10+ widgets

---

## Success Criteria

1. No Analytics page reads from `data.ts`/`services.ts` mock arrays.
2. Report Builder, Standard Reports, and Dashboards all execute through the same underlying engine.
3. Scheduled Reports run on cadence and produce real `ReportExecution` rows.
4. Advanced Analytics' predictive panel reads real `Prediction` data with no duplicate inference logic.

---

## Exit Gate

This guide is complete when:

1. `ReportDefinition`/`ReportExecution`/`DashboardWidget` are the authoritative source for all Analytics & Reporting pages.
2. Scheduling and export are wired to existing job/file-generation infrastructure, not new bespoke systems.
3. No second predictive-analytics pipeline exists outside the one shared with AI & Automation.

---

## Risks

| ID  | Risk                                                                                             | Impact | Mitigation                                                              |
| --- | ------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| N1  | Building Report Builder and Dashboard Builder as separate query systems duplicates ~70% of logic | High   | Phase 1 explicitly builds one shared engine before any UI wiring        |
| N2  | Unrestricted `dataSource`/`columns` input enables unsafe or cross-tenant queries                 | High   | Allow-list validation mandatory in Phase 1, tested before Phase 2       |
| N3  | Advanced Analytics duplicates the AI & Automation module's predictive pipeline                   | Medium | Phase 5 explicitly reads shared `Prediction` table, no new inference    |
| N4  | Report query performance degrades at scale for large tenants                                     | Medium | Performance testing required in Phase 1 before Standard Reports go live |

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md)
4. [AI & Automation Completion Guide](./GUIDE-AI-AUTOMATION-COMPLETION.md)
5. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
