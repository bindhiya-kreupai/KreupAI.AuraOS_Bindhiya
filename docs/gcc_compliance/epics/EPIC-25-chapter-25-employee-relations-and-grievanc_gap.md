# Gap Analysis: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 17
- Partial: 17

## Epic Goal

Deliver an end-to-end AuraOS Employee Relations & Grievance module that captures complaints from multiple channels, runs structured risk triage, supports informal resolution and formal investigations with interviews and evidence standards, and enforces confidentiality, statutory timelines, anti-retaliation and appeal controls across all six GCC countries. The module must produce defensible case files that withstand scrutiny by MOHRE, MHRSD, LMRA, PAM, Qatar MOL/ADLSA and Oman MOL labour authorities and protect the employer from authority complaints and litigation.

## Storywise Gaps

### EPIC-25-S01 — ER Governance Framework, Grievance Policy & Grievance Type Catalogue

**Status:** Partial
**Covers:** 25.1, 25.2, 25.3, 25.4, 25.5, 25.6
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/grievance/types.ts
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/dashboard/core-hr/employee-database/types.ts
- apps/web/src/lib/services/employee/types.ts
- apps/web/src/app/api/my-services/grievances/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S02 — Multi-Channel Complaint Intake & Grievance Case Creation

**Status:** Partial
**Covers:** 25.7, 25.8
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S03 — Initial Risk Assessment & Triage Routing

**Status:** Partial
**Covers:** 25.9
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S04 — Informal Resolution & Workplace Conflict Resolution

**Status:** Partial
**Covers:** 25.10, 25.16
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S05 — Formal Investigation Process, Interviews & Evidence Standards

**Status:** Partial
**Covers:** 25.11, 25.12
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S06 — Harassment, Bullying & Discrimination Case Handling

**Status:** Partial
**Covers:** 25.13, 25.14
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S07 — Retaliation Controls & Whistleblower Protection

**Status:** Partial
**Covers:** 25.15
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S08 — Grievance↔Disciplinary Linkage & Outcome Routing

**Status:** Partial
**Covers:** 25.17
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S09 — Confidentiality, Documentation Standards & Grievance Data Privacy

**Status:** Partial
**Covers:** 25.18, 25.19, 25.23
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S10 — Grievance Timelines, SLA Engine & Appeals

**Status:** Partial
**Covers:** 25.20, 25.21
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S11 — Labour Authority Complaint Tracking

**Status:** Partial
**Covers:** 25.22
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S12 — ER Audit Checklist & Risk Matrix

**Status:** Partial
**Covers:** 25.24, 25.26
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S13 — ER KPIs, Dashboard & ER Automation Design

**Status:** Partial
**Covers:** 25.25, 25.27, 25.28
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S14 — Monthly ER Compliance Pack

**Status:** Partial
**Covers:** 25.29
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- packages/@aura/database/src/seeds/23-employees-extended.seed.ts
- packages/@aura/database/src/seeds/24-employee-lifecycle.seed.ts
- packages/@aura/events/src/events/employee-events.ts
- packages/@aura/testing/src/factories/employee-factory.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S15 — Sample Grievance Intake Form (Configurable Digital Form)

**Status:** Partial
**Covers:** 25.30
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S16 — Sample Grievance Register, Investigation Report & Corrective Action Register

**Status:** Partial
**Covers:** 25.31, 25.32, 25.33
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-25-S17 — Key Takeaways & ER Knowledge Reference

**Status:** Partial
**Covers:** 25.34
**Acceptance criteria count:** 5 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
