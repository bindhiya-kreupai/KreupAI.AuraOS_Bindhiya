# Gap Analysis: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 15
- Partial: 14
- Minimal Evidence: 1

## Epic Goal

Deliver AuraOS's unified HR Compliance Command Centre: a governed analytics layer that aggregates compliance signals from every HRMS domain (payroll, WPS/Mudad, social insurance, nationalization, immigration, leave/attendance, benefits, accommodation, HSE, employee relations, separation, documents) into an executive scorecard, per-domain dashboards, a risk heatmap, and closed-loop corrective-action tracking. The epic turns scattered control data into a single RAG-rated compliance posture per legal entity and GCC country, with management certification, a review calendar, and RBAC-controlled access.

## Storywise Gaps

### EPIC-31-S01 — Compliance dashboard governance, objectives & design principles

**Status:** Partial
**Covers:** 31.1, 31.2, 31.3, 31.4
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S02 — Compliance KPI engine, scorecard & sample scorecard export

**Status:** Partial
**Covers:** 31.5, 31.28
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/(modules)/workflow-engine/workflow-analytics/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S03 — Executive HR Compliance Dashboard

**Status:** Partial
**Covers:** 31.6
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S04 — Country-wise compliance dashboard

**Status:** Partial
**Covers:** 31.7
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S05 — Payroll, WPS/Mudad & Social Insurance compliance dashboards

**Status:** Minimal Evidence
**Covers:** 31.8, 31.9, 31.10
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/(modules)/payroll/analytics/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S06 — Nationalization & immigration/work-permit dashboards

**Status:** Partial
**Covers:** 31.11, 31.12
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S07 — Leave/attendance & benefits compliance dashboards

**Status:** Partial
**Covers:** 31.13, 31.14
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/e2e/attendance/shift-management.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S08 — Accommodation/welfare & HSE compliance dashboards

**Status:** Partial
**Covers:** 31.15, 31.16
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S09 — Employee relations, termination/final-settlement & document compliance dashboards

**Status:** Partial
**Covers:** 31.17, 31.18, 31.19
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/dashboard/analytics/retention/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S10 — Compliance risk heatmap

**Status:** Partial
**Covers:** 31.20
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S11 — Corrective action tracking & sample corrective-action register

**Status:** Partial
**Covers:** 31.21, 31.29
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S12 — Management certification, monthly compliance pack & monthly certificate

**Status:** Partial
**Covers:** 31.22, 31.27, 31.30
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S13 — Compliance review calendar & audit controls

**Status:** Partial
**Covers:** 31.23, 31.24
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S14 — Compliance automation design & dashboard access control

**Status:** Partial
**Covers:** 31.25, 31.26
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-31-S15 — Compliance dashboard key takeaways & adoption guide

**Status:** Partial
**Covers:** 31.31
**Acceptance criteria count:** 3 · **Task count:** 3

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
