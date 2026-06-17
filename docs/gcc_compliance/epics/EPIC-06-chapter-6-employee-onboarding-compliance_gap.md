# Gap Analysis: EPIC-06: Chapter 6 – Employee Onboarding Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 17
- Implemented - pending verification/migration/integration: 7
- Likely Partial/Implemented: 10
- Partial: 0

## Epic Goal

Deliver an end-to-end AuraOS onboarding engine that converts an accepted offer into a fully compliant, active employee record across any GCC country. It must orchestrate pre-joining and joining-day checklists, create governed employee master data, run country-specific onboarding (visa stamping, Emirates ID/Iqama/CPR linkage), and trigger payroll, medical insurance and social-insurance (GPSSA/GOSI/SIO/PASI) enrolment — all under a configurable workflow, RBAC and full audit trail, with probation tracking and a completeness/KPI dashboard.

## Storywise Gaps

### EPIC-06-S01 — Onboarding case lifecycle & governance model

**Status:** Implemented - pending migration/event-bus integration verification
**Covers:** 6.3, 6.4
**Acceptance criteria count:** 6 · **Task count:** 7

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616113000_add_onboarding_case_governance/migration.sql
- apps/web/src/lib/services/onboarding-case.service.ts
- apps/web/src/lib/services/**tests**/onboarding-case.service.test.ts
- apps/web/src/app/api/v1/onboarding/cases/route.ts
- apps/web/src/app/api/v1/onboarding/cases/[id]/transition/route.ts
- apps/web/src/app/dashboard/onboarding/cases/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
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

**Gap to close:** run the new Prisma migration in target environments; wire recruitment offer acceptance to `onboardingCaseService.consumeOfferAccepted(...)` through the production event bus/worker; run integration/E2E with seeded governance templates, accepted offers, onboarding instances, and role-bearing users.

**Next verification:** Targeted S01 service test passed; Prisma generate passed; web type-check passed. Run integration/E2E against seeded governance and recruitment event data before final operational sign-off.

### EPIC-06-S02 — Onboarding objectives, intro context & key takeaways content

**Status:** Implemented - pending migration/workspace integration verification
**Covers:** 6.1, 6.2, 6.23
**Acceptance criteria count:** 4 · **Task count:** 5

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616114500_add_onboarding_guidance_content/migration.sql
- apps/web/src/lib/services/onboarding-guidance.service.ts
- apps/web/src/lib/services/**tests**/onboarding-guidance.service.test.ts
- apps/web/src/app/api/v1/onboarding/guidance/route.ts
- apps/web/src/app/dashboard/onboarding/guidance/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
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

**Gap to close:** run the new Prisma migration in target environments; embed `onboardingGuidanceService.resolve(...)` into the final case workspace help drawer/banner; run integration/E2E with seeded published guidance and role-bearing admin users.

**Next verification:** Targeted S02 service test passed; Prisma generate passed; web type-check passed. Run integration/E2E against seeded published guidance before final operational sign-off.

### EPIC-06-S03 — Pre-joining checklist & document collection

**Status:** Likely Partial/Implemented
**Covers:** 6.5
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S04 — Joining day formalities & first-day workflow

**Status:** Likely Partial/Implemented
**Covers:** 6.6
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S05 — Employee master data creation & activation

**Status:** Implemented - pending migration/integration verification
**Covers:** 6.7
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616110000_add_employee_master_activation/migration.sql
- apps/web/src/lib/services/employee-master-activation.service.ts
- apps/web/src/lib/services/**tests**/employee-master-activation.service.test.ts
- apps/web/src/app/api/v1/onboarding/employee-master/route.ts
- apps/web/src/app/api/v1/onboarding/employee-master/[id]/route.ts
- apps/web/src/app/api/v1/onboarding/employee-master/[id]/transition/route.ts
- apps/web/src/app/dashboard/onboarding/employee-master/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** run the new Prisma migration in target environments; wire `employee.activated` outbox rows to the production message bus/worker; run integration/E2E with seeded companies, status/type/job/grade/location masters, and S06 activation tasks.

**Next verification:** Targeted S05 service test passed; Prisma generate passed; web type-check passed. Run integration/E2E against seeded master data and activation workflow users before final operational sign-off.

### EPIC-06-S06 — Country-specific onboarding requirements (rule-engine driven)

**Status:** Implemented - pending migration/operational verification
**Covers:** 6.8
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616103000_add_country_onboarding_rules/migration.sql
- apps/web/src/lib/services/country-onboarding-rule.service.ts
- apps/web/src/lib/services/**tests**/country-onboarding-rule.service.test.ts
- apps/web/src/app/api/v1/onboarding/country-rules/route.ts
- apps/web/src/app/api/v1/onboarding/country-rules/[id]/activation-gate/route.ts
- apps/web/src/app/dashboard/onboarding/country-rules/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
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

**Gap to close:** run the new Prisma migration in target environments; decide whether to keep seeded GCC rule JSON managed through the new rule API/page for MVP or add a richer admin editor; wire `getActivationGate(...)` into the final employee activation transition.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S07 — Payroll onboarding & first-pay readiness

**Status:** Implemented - pending migration/config verification
**Covers:** 6.9
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616100000_add_employee_payroll_profile/migration.sql
- apps/web/src/lib/services/payroll-onboarding.service.ts
- apps/web/src/lib/services/**tests**/payroll-onboarding.service.test.ts
- apps/web/src/app/api/v1/onboarding/payroll/route.ts
- apps/web/src/app/api/v1/onboarding/payroll/[id]/approve/route.ts
- apps/web/src/app/dashboard/onboarding/payroll/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md

**Gap to close:** run the new Prisma migration in target environments; wire `payrollOnboardingService.validatePayrollLock(...)` into the final payroll-run lock/approval flow; confirm whether GCC WPS/Mudad readiness rules should stay code-owned for MVP or move under S06 configurable rules.

**Next verification:** Targeted S07 service test passed; Prisma generate passed; web type-check passed. Run integration/E2E against seeded payroll/WPS/cost-centre data before final operational sign-off.

### EPIC-06-S08 — Medical insurance & benefits enrolment

**Status:** Implemented - pending migration/config verification
**Covers:** 6.10
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616093000_add_benefit_onboarding_tracking/migration.sql
- apps/web/src/lib/services/benefits-onboarding.service.ts
- apps/web/src/lib/services/**tests**/benefits-onboarding.service.test.ts
- apps/web/src/app/api/v1/onboarding/benefits/route.ts
- apps/web/src/app/api/v1/onboarding/benefits/[id]/issue-card/route.ts
- apps/web/src/app/dashboard/onboarding/benefits/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** run the new Prisma migration in target environments and confirm whether the GCC mandatory-cover rules should stay code-owned for MVP or move under S06 configurable rules.

**Next verification:** Targeted S08 service test passed; Prisma generate passed; web type-check passed. Run integration/E2E against seeded tenant plans before final operational sign-off.

### EPIC-06-S09 — Social insurance & pension onboarding

**Status:** Implemented - pending migration
**Covers:** 6.11
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616090000_add_social_insurance_registration/migration.sql
- apps/web/src/lib/services/social-insurance-onboarding.service.ts
- apps/web/src/app/api/v1/onboarding/social-insurance/route.ts
- apps/web/src/app/api/v1/onboarding/social-insurance/[id]/register/route.ts
- apps/web/src/app/dashboard/onboarding/social-insurance/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/lib/services/**tests**/social-insurance-onboarding.service.test.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** apply the new database migration in the target environment; replace the service-level GCC rule map with admin-editable country rule config under EPIC-06-S06 if runtime rule management is required.

**Next verification:** Targeted service test passed (`pnpm --filter web test:run src/lib/services/__tests__/social-insurance-onboarding.service.test.ts`), Prisma client generation passed, and `pnpm --filter web type-check` passed on 2026-06-16.

### EPIC-06-S10 — IT & asset provisioning

**Status:** Likely Partial/Implemented
**Covers:** 6.12
**Acceptance criteria count:** 5 · **Task count:** 6

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

### EPIC-06-S11 — Policy acknowledgement

**Status:** Likely Partial/Implemented
**Covers:** 6.13
**Acceptance criteria count:** 5 · **Task count:** 5

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

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S12 — Probation management

**Status:** Likely Partial/Implemented
**Covers:** 6.14
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

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S13 — Employee file creation during onboarding

**Status:** Likely Partial/Implemented
**Covers:** 6.15
**Acceptance criteria count:** 5 · **Task count:** 5

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

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S14 — Onboarding KPIs & compliance dashboard

**Status:** Likely Partial/Implemented
**Covers:** 6.16, 6.17
**Acceptance criteria count:** 5 · **Task count:** 4

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

**Gap to close:** confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S15 — Onboarding workflow & best-practice timeline configuration

**Status:** Likely Partial/Implemented
**Covers:** 6.18, 6.21
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S16 — Onboarding audit checklist & risk register

**Status:** Likely Partial/Implemented
**Covers:** 6.19, 6.20
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md

**Gap to close:** confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-06-S17 — Sample Employee Joining Form (configurable digital form)

**Status:** Likely Partial/Implemented
**Covers:** 6.22
**Acceptance criteria count:** 5 · **Task count:** 5

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

**Gap to close:** confirm/add tenant-scoped schema or config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
