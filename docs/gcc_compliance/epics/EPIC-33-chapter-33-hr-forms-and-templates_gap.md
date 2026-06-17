# Gap Analysis: EPIC-33: Chapter 33 – HR Forms and Templates

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 15
- Missing: 6
- Partial: 9

## Epic Goal

Build a **configurable digital HR forms engine** in AuraOS that replaces paper/PDF HR forms across the entire employee lifecycle with governed, versioned, workflow-driven digital forms. The engine provides a central forms library, a drag-and-drop form builder, routing/approval, e-signature, audit trail, and automatic write-back of approved form data into the relevant HRMS modules — so every HR transaction starts from a controlled, traceable form.

## Storywise Gaps

### EPIC-33-S01 — Configurable digital forms engine (form builder)

**Status:** Missing
**Covers:** 33.1, 33.2
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S02 — HR form governance framework & forms library

**Status:** Missing
**Covers:** 33.3, 33.4
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S03 — Forms routing, approval, e-signature & audit

**Status:** Partial
**Covers:** 33.3
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S04 — Recruitment forms group (requisition, interview evaluation, selection/offer approval)

**Status:** Partial
**Covers:** 33.5, 33.6, 33.7, 33.8
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S05 — Employment forms group (offer letter, contract checklist, joining form)

**Status:** Missing
**Covers:** 33.9, 33.10, 33.11, 33.12
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S06 — Payroll forms group (salary advance, loan, overtime, payroll change)

**Status:** Partial
**Covers:** 33.13, 33.14, 33.15, 33.16, 33.17
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/loan-recovery/page.tsx
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S07 — Leave & attendance forms group (leave request, attendance regularization, comp-off)

**Status:** Partial
**Covers:** 33.18, 33.19, 33.20, 33.21
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/attendance/regularization-request/route.ts
- apps/web/src/app/dashboard/attendance/regularization-request/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-regularization-route.test.ts
- apps/web/src/**tests**/e2e/attendance/regularization.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S08 — Benefits forms group (medical insurance enrollment, accommodation request, asset issue)

**Status:** Partial
**Covers:** 33.22, 33.23, 33.24, 33.25
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/app/api/benefits/enrollments/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/decline/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/elect/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/premium/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S09 — Employee relations forms group (grievance, disciplinary hearing record, warning letter)

**Status:** Partial
**Covers:** 33.26, 33.27, 33.28, 33.29
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

### EPIC-33-S10 — Separation forms group (resignation, handover, exit clearance, final settlement, exit interview)

**Status:** Partial
**Covers:** 33.30, 33.31, 33.32, 33.33, 33.34, 33.35
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/exit-interviews/route.ts
- apps/web/src/app/api/offboarding/final-settlements/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/app/dashboard/offboarding/exit-interview/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S11 — Compliance forms group (policy acknowledgement, document submission, visa/work-permit renewal)

**Status:** Partial
**Covers:** 33.36, 33.37, 33.38, 33.39
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/[id]/transition/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/route.ts
- apps/web/src/app/api/v1/compliance/wps/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S12 — HRMS forms automation design & module write-back framework

**Status:** Missing
**Covers:** 33.40
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S13 — HR forms audit checklist & risk matrix

**Status:** Partial
**Covers:** 33.41, 33.43
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S14 — HR forms KPIs & dashboard

**Status:** Missing
**Covers:** 33.42
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-33-S15 — Monthly HR forms compliance pack & key takeaways

**Status:** Missing
**Covers:** 33.44, 33.45
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
