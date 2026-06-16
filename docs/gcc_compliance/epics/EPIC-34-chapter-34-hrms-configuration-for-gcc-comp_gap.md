# Gap Analysis: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 29
- Likely Partial/Implemented: 15
- Partial: 14

## Epic Goal

Deliver the AuraOS configuration backbone that makes every GCC compliance module country-correct without code changes: a versioned country rule engine, legal-entity and master-data configuration, and per-domain configuration surfaces (contract, payroll, WPS/Mudad, social insurance, nationalization, immigration, leave, attendance/overtime, benefits, accommodation, HSE, ER/disciplinary, separation, EOSB formula engine, documents). It also provides the cross-cutting platform configuration — approval workflows, alerts, audit trail, RBAC, integrations, data migration — plus the implementation checklist, configuration control sheet and go-live certification that govern a compliant rollout.

## Storywise Gaps

### EPIC-34-S01 — Configuration objectives & compliance architecture baseline

**Status:** Likely Partial/Implemented
**Covers:** 34.1, 34.2, 34.3
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S02 — Country rule engine (versioned, effective-dated)

**Status:** Partial
**Covers:** 34.4
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S03 — Legal entity configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.5
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S04 — Employee master data configuration & HR data dictionary

**Status:** Partial
**Covers:** 34.6
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S05 — Position & organization configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.7
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/services/organization/**tests**/department.service.test.ts
- apps/web/src/lib/services/organization/department.service.ts
- apps/web/src/lib/services/organization/**tests**/position.service.test.ts
- apps/web/src/lib/services/organization/position.service.ts
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add protected API route with validation/RBAC.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S06 — Contract management configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.8
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S07 — Payroll configuration

**Status:** Partial
**Covers:** 34.9
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S08 — WPS & Mudad file configuration

**Status:** Partial
**Covers:** 34.10
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/payroll-compliance/wps/file-history/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/components/compliance/wps/WpsConfigPanel.tsx
- apps/web/src/components/compliance/wps/WpsFileGenerator.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S09 — Social insurance configuration

**Status:** Partial
**Covers:** 34.11
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/admin/TenantProvisioningWizard.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S10 — Nationalization configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.12
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js

**Planning / prior analysis evidence**

- None found.

**Gap to close:** manual verification against acceptance criteria.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S11 — Immigration configuration

**Status:** Partial
**Covers:** 34.13
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S12 — Leave configuration

**Status:** Partial
**Covers:** 34.14
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/country-specific-rules/page.tsx
- apps/web/src/app/(modules)/leave/holiday-management/page.tsx
- apps/web/src/app/(modules)/leave/policies/country-rules/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S13 — Attendance & overtime configuration

**Status:** Partial
**Covers:** 34.15
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/punch-rules/route.ts
- apps/web/src/app/dashboard/attendance/punch-rules/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

**Gap to close:** add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S14 — Benefits configuration

**Status:** Partial
**Covers:** 34.16
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S15 — Accommodation configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.17
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S16 — HSE configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.18
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S17 — Employee relations & disciplinary configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.19
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- services/employee-service/tsconfig.json
- apps/web/src/app/api/my-services/grievances/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S18 — Separation & final settlement configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.20
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S19 — EOSB formula engine

**Status:** Partial
**Covers:** 34.21
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S20 — Document management configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.22
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- services/document-service/tsconfig.json
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/chaos/chaos.config.json

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

**Gap to close:** add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S21 — Approval workflow configuration

**Status:** Partial
**Covers:** 34.23
**Acceptance criteria count:** 4 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add tests; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S22 — Alerts & notifications configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.24
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S23 — Audit trail configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.25
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/dashboard/compliance/audit-trail/page.tsx
- apps/web/src/app/dashboard/user-management/audit-trail/page.tsx
- apps/web/src/lib/services/audit/audit-trail-service.ts
- apps/web/src/**tests**/chaos/chaos.config.json

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S24 — Role-based access control configuration

**Status:** Likely Partial/Implemented
**Covers:** 34.26
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S25 — Data integration configuration

**Status:** Partial
**Covers:** 34.27
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/lib/database/pool-config.ts
- packages/@aura/database/src/connection-pool.config.ts
- packages/@aura/database/src/partitioning/partition-config.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S26 — Data migration for GCC HRMS implementation

**Status:** Partial
**Covers:** 34.28
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/database/pool-config.ts
- packages/@aura/database/src/connection-pool.config.ts
- packages/@aura/database/src/partitioning/partition-config.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S27 — Implementation checklist & configuration control sheet

**Status:** Likely Partial/Implemented
**Covers:** 34.29, 34.32
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S28 — HRMS configuration KPIs & risk matrix

**Status:** Likely Partial/Implemented
**Covers:** 34.30, 34.31
**Acceptance criteria count:** 4 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** add/wire service logic; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-34-S29 — HRMS go-live certification & key takeaways

**Status:** Partial
**Covers:** 34.33, 34.34
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
