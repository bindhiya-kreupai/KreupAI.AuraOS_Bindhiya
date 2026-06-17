# Gap Analysis: EPIC-14: Chapter 14 – GPSSA Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 19
- Partial: 17
- Likely Partial/Implemented: 1
- Minimal Evidence: 1

## Epic Goal

Deliver a complete GPSSA (General Pension and Social Security Authority, UAE) compliance engine in AuraOS that registers the employer establishment and eligible employees (UAE and GCC nationals), derives the GPSSA contribution account salary from the salary structure, calculates employer, employee and government-share contributions using configurable rates in the country rule engine, produces the monthly GPSSA submission, reconciles GPSSA to payroll, links GPSSA registration to Emiratisation evidence and end-of-service, and generates the monthly GPSSA compliance pack, certificate and variance register. The outcome keeps GPSSA aligned with payroll, transfers and exits so the entity meets its pension obligations and Emiratisation evidence requirements with zero manual reconciliation.

## Storywise Gaps

### EPIC-14-S01 — GPSSA Foundation, Applicability & Contribution Framework

**Status:** Partial
**Covers:** 14.1, 14.2, 14.3, 14.4
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S02 — Employer Responsibilities & Compliance Calendar

**Status:** Partial
**Covers:** 14.5
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S03 — Employer Registration & Establishment Setup

**Status:** Partial
**Covers:** 14.6
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S04 — GPSSA Employee Registration

**Status:** Partial
**Covers:** 14.7
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S05 — Contribution Account Salary Derivation

**Status:** Partial
**Covers:** 14.8
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S06 — GPSSA Contribution Calculation Engine (Employer/Employee/Government, Configurable Rates)

**Status:** Partial
**Covers:** 14.4 (calculation aspect), 14.8 (consumes)
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/government/pension-scheme/page.tsx
- apps/web/src/app/dashboard/government/pensions/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S07 — Monthly GPSSA Process & Submission File

**Status:** Partial
**Covers:** 14.9
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/[id]/transition/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/route.ts
- apps/web/src/app/api/v1/compliance/wps/submissions/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S08 — Salary Changes & GPSSA Updates

**Status:** Partial
**Covers:** 14.10
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S09 — Employee Transfers & GPSSA Continuity

**Status:** Partial
**Covers:** 14.11
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S10 — End of Service & GPSSA Interaction

**Status:** Likely Partial/Implemented
**Covers:** 14.12
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/services/compliance/gosi.service.test.ts
- apps/web/src/app/api/benefits/dependents/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S11 — GPSSA ↔ Emiratisation Evidence Linkage

**Status:** Partial
**Covers:** 14.13
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S12 — GPSSA ↔ Payroll Reconciliation

**Status:** Partial
**Covers:** 14.14
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/(modules)/payroll/payroll-reconciliation/page.tsx
- apps/web/src/app/api/payroll/reconciliation/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/payroll/payroll-reconciliation/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S13 — GPSSA Audit Checklist & Risk Matrix

**Status:** Partial
**Covers:** 14.15, 14.17
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- packages/@aura/database/src/extensions/audit-log.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S14 — GPSSA KPIs & Dashboard

**Status:** Partial
**Covers:** 14.16, 14.19
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S15 — HRMS GPSSA Automation Design (Events, Rule Engine, Workflow)

**Status:** Minimal Evidence
**Covers:** 14.18
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/version-control/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S16 — Monthly GPSSA Compliance Pack

**Status:** Partial
**Covers:** 14.20
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- packages/@aura/database/src/extensions/audit-log.ts
- packages/@aura/database/src/extensions/index.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S17 — Sample GPSSA Monthly Compliance Certificate (Configurable Form)

**Status:** Partial
**Covers:** 14.21
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S18 — Sample GPSSA Variance Register (Configurable Register)

**Status:** Partial
**Covers:** 14.22
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-14-S19 — GPSSA Key Takeaways & In-Product Guidance

**Status:** Partial
**Covers:** 14.23
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
