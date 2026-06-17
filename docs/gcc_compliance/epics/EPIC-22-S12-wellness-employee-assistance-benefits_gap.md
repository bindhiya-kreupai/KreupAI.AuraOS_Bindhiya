# Gap Analysis: EPIC-22-S12 — Wellness & employee assistance benefits

> **✅ SHIPPED 2026-06-17** — Themes E + F + I closure. Workforce extensions: ContractorAssignment (cross-domain), EmployeeLoanSchedule (amortized), UniformPpeIssuance register, AccommodationTransportRoute / Clinic / MaintenanceTicket (SLA-tracked). BenefitCatalogue extended with EDUCATION / RELOCATION / WELLNESS_EAP. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Could · **Estimate:** 3
**User story:** Employee (Self-Service), **I want** access to wellness and employee assistance (EAP) benefits, **so that** I can use health/wellbeing services confidentially while HR tracks enrolment and vendor usage anonymously.

**Description**
Administer wellness programs and EAP (counselling, telehealth, gym) with eligibility, confidential enrolment, and anonymized usage tracking that protects employee privacy.

**Covers:** 22.16
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/web/src/app/dashboard/benefits/wellness-tracker/page.tsx
- apps/web/src/components/benefits/WellnessTracker.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given an eligible employee, when wellness/EAP is enrolled, then access details are provided and enrolment recorded.
- [ ] Given EAP usage data, then HR sees only aggregated/anonymized metrics, never individual case detail.
- [ ] Given a vendor wellness program, then enrolment counts feed vendor cost reconciliation.
- [ ] Given any enrolment, then privacy consent is captured and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `wellness_program`, `wellness_enrolment` schema with anonymization
- [ ] Backend: aggregated usage reporting service
- [ ] Frontend: wellness/EAP self-service catalogue
- [ ] Rules/Config: eligibility per entity
- [ ] Tests: unit (anonymization/aggregation)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
