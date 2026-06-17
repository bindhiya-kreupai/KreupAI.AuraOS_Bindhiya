# Gap Analysis: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 20
- Likely Partial/Implemented: 12
- Missing: 2
- Minimal Evidence: 2
- Partial: 4

## Epic Goal

Deliver a complete End-of-Service Benefits (EOSB) compliance engine in AuraOS built around a configurable per-country **EOSB formula engine** that calculates gratuity/award/indemnity for every GCC jurisdiction (UAE 21→30 days/yr, Saudi end-of-service award, Bahrain/Qatar/Oman/Kuwait gratuity/indemnity), correctly applies resignation-vs-termination rules, derives the service period and salary basis, adjusts for unpaid leave, nets social-insurance/pension funding, provisions and accounts for accrued liability, integrates with final settlement, and manages disputes. The outcome is a defensible, auditable EOSB number produced automatically at separation — and accrued monthly — with no spreadsheet calculation.

## Storywise Gaps

### EPIC-28-S01 — EOSB Foundation, Governance, Terminology & Objectives

**Status:** Likely Partial/Implemented
**Covers:** 28.1, 28.2, 28.3, 28.4
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S02 — EOSB Calculation Inputs & Country-Wise Rule Catalogue

**Status:** Likely Partial/Implemented
**Covers:** 28.5, 28.6
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S03 — EOSB Formula Engine Core (Configurable, Effective-Dated)

**Status:** Likely Partial/Implemented
**Covers:** 28.5 (engine evaluation aspect)
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S04 — UAE & Saudi EOSB Rules (Gratuity 21→30 days/yr; KSA Award)

**Status:** Likely Partial/Implemented
**Covers:** 28.7, 28.8
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S05 — Bahrain, Qatar, Oman & Kuwait EOSB Rules (Gratuity / Indemnity / Social-Protection Linkage)

**Status:** Likely Partial/Implemented
**Covers:** 28.9, 28.10, 28.11, 28.12
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S06 — Resignation vs Termination Impact Engine

**Status:** Missing
**Covers:** 28.13
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S07 — Service Period Calculation

**Status:** Minimal Evidence
**Covers:** 28.14
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/lib/services/taxCalculationEngine.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S08 — Salary Basis Derivation

**Status:** Missing
**Covers:** 28.15
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S09 — Unpaid Leave Impact on EOSB

**Status:** Partial
**Covers:** 28.16
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/holiday-management/page.tsx
- apps/web/src/app/api/leave/holidays/route.ts
- apps/web/src/app/dashboard/leave/holiday-management/page.tsx
- apps/mobile/src/screens/leave/ApplyLeaveScreen.tsx
- apps/mobile/src/screens/leave/LeaveApprovalsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S10 — Social Insurance & Pension Interaction (Funded-Balance Netting)

**Status:** Partial
**Covers:** 28.17
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/dashboard/government/pension-scheme/page.tsx
- apps/web/src/app/dashboard/government/pensions/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S11 — EOSB Provisioning & Accounting (Monthly Accrual + GL)

**Status:** Partial
**Covers:** 28.18
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/components/admin/TenantProvisioningWizard.tsx
- apps/web/src/lib/auth/user-provisioning.service.ts
- apps/web/src/services/tenantProvisioningService.ts
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S12 — EOSB ↔ Final Settlement Integration

**Status:** Likely Partial/Implemented
**Covers:** 28.19
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S13 — EOSB Disputes Management & Dispute Register

**Status:** Likely Partial/Implemented
**Covers:** 28.20, 28.28
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S14 — EOSB Audit Checklist & Risk Matrix

**Status:** Partial
**Covers:** 28.21, 28.23
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S15 — EOSB KPIs & Dashboard

**Status:** Likely Partial/Implemented
**Covers:** 28.22, 28.25
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S16 — HRMS EOSB Automation Design (Events, Rule Engine, Workflow)

**Status:** Minimal Evidence
**Covers:** 28.24
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/(modules)/workflow-engine/ai-path-prediction/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S17 — Monthly EOSB Compliance Pack

**Status:** Likely Partial/Implemented
**Covers:** 28.26
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S18 — Sample EOSB Calculation Sheet (Configurable Form/Export)

**Status:** Likely Partial/Implemented
**Covers:** 28.27
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S19 — Sample EOSB Monthly Compliance Certificate (Configurable Form)

**Status:** Likely Partial/Implemented
**Covers:** 28.29
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-28-S20 — EOSB Key Takeaways & In-Product Guidance

**Status:** Likely Partial/Implemented
**Covers:** 28.30
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
