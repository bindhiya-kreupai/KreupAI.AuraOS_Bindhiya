# Gap Analysis: EPIC-16: Chapter 16 – Emiratisation Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 21
- Likely Partial/Implemented: 17
- Partial: 4

## Epic Goal

Deliver a configurable Emiratisation compliance engine in AuraOS that computes UAE-national targets against the correct skilled-workforce denominator, tracks mid-year and year-end MOHRE checkpoints, and surfaces Nafis subsidy and non-compliance fine exposure in real time. The platform must cross-check GPSSA, payroll and WPS data to detect fake/artificial Emiratisation, drive UAE-national recruitment, onboarding, retention and training, and produce a defensible monthly evidence pack, certificate, gap register and fake-Emiratisation risk register.

## Storywise Gaps

### EPIC-16-S01 — Emiratisation overview, purpose & regulatory framework knowledge base

**Status:** Likely Partial/Implemented
**Covers:** 16.1, 16.2, 16.3
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S02 — Emiratisation applicability determination

**Status:** Likely Partial/Implemented
**Covers:** 16.4
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S03 — Target calculation against skilled-workforce denominator

**Status:** Likely Partial/Implemented
**Covers:** 16.5
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S04 — Mid-year and year-end compliance checkpoints

**Status:** Likely Partial/Implemented
**Covers:** 16.6
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S05 — Nafis contributions, fines & financial exposure projection

**Status:** Likely Partial/Implemented
**Covers:** 16.7
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S06 — Fake/artificial Emiratisation detection (GPSSA + payroll + WPS cross-checks)

**Status:** Partial
**Covers:** 16.8
**Acceptance criteria count:** 6 · **Task count:** 7

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S07 — UAE national recruitment strategy & pipeline overlay

**Status:** Partial
**Covers:** 16.9
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/recruitment/CandidatePipeline.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S08 — Job design for Emiratisation

**Status:** Likely Partial/Implemented
**Covers:** 16.10
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S09 — UAE national onboarding controls

**Status:** Likely Partial/Implemented
**Covers:** 16.11
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S10 — GPSSA & Emiratisation alignment / reconciliation

**Status:** Likely Partial/Implemented
**Covers:** 16.12
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S11 — Payroll & WPS evidence linkage

**Status:** Partial
**Covers:** 16.13
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S12 — Retention of UAE national employees

**Status:** Partial
**Covers:** 16.14
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/integration/employees/employees.test.ts
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/api/core-hr/employees/[employeeId]/route.ts
- apps/web/src/app/api/core-hr/employees/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S13 — Training & development for UAE nationals

**Status:** Likely Partial/Implemented
**Covers:** 16.15
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S14 — Emiratisation workforce planning

**Status:** Likely Partial/Implemented
**Covers:** 16.16
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S15 — Emiratisation audit checklist & red-flag controls

**Status:** Likely Partial/Implemented
**Covers:** 16.17
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S16 — Emiratisation KPIs

**Status:** Likely Partial/Implemented
**Covers:** 16.18
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S17 — Emiratisation risk matrix

**Status:** Likely Partial/Implemented
**Covers:** 16.19
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S18 — HRMS Emiratisation automation design (rule engine & events)

**Status:** Likely Partial/Implemented
**Covers:** 16.20
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S19 — Emiratisation dashboard

**Status:** Likely Partial/Implemented
**Covers:** 16.21
**Acceptance criteria count:** 5 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S20 — Emiratisation evidence pack + monthly certificate, gap register & fake-Emiratisation risk register

**Status:** Likely Partial/Implemented
**Covers:** 16.22, 16.23, 16.24, 16.25
**Acceptance criteria count:** 6 · **Task count:** 7

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-16-S21 — Emiratisation key takeaways & guidance summary

**Status:** Likely Partial/Implemented
**Covers:** 16.26
**Acceptance criteria count:** 3 · **Task count:** 3

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
