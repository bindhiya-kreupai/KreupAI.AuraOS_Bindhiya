# Gap Analysis: EPIC-34-S17 — Employee relations & disciplinary configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** to configure grievance and disciplinary frameworks per country, **so that** ER processes follow lawful, consistent rules.

**Description**
Configure grievance categories/SLAs and the disciplinary framework: misconduct classification, penalty matrix, hearing requirements, suspension and salary-deduction limits (country-capped), and appeal timelines consumed by the ER/disciplinary module.

**Covers:** 34.19
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- services/employee-service/tsconfig.json
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- add tests.

## Acceptance Criteria To Verify

- [ ] Given a country, when configured, then the penalty matrix and salary-deduction caps resolve from the rule engine.
- [ ] Given grievance categories, when set, then SLAs and escalation tiers are defined.
- [ ] Given a disciplinary penalty, when configured, then it cannot exceed the country statutory deduction limit.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `grievance_config`, `disciplinary_matrix` schemas
- [ ] Backend: salary-deduction-cap validation
- [ ] Frontend: ER & disciplinary configuration screen
- [ ] Rules/Config: per-country penalty matrix and deduction caps
- [ ] Tests: unit tests for deduction-cap enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
