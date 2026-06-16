# Gap Analysis: EPIC-34-S09 — Social insurance configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** to configure GOSI/GPSSA/SIO contribution rules per entity and nationality, **so that** social-insurance deductions are calculated correctly.

**Description**
Configure social-insurance schemes by country and nationality (GOSI KSA, GPSSA UAE nationals, SIO Bahrain, plus Qatar/Oman/Kuwait equivalents): contribution wage definition, employer/employee rates, caps/floors, branch applicability (e.g., occupational hazard), and registration mapping, all bound to the rule engine.

**Covers:** 34.11
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/admin/TenantProvisioningWizard.tsx
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiConfigPanel.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given country + nationality, when configured, then the applicable scheme, contribution wage and employer/employee rates resolve from the rule engine.
- [ ] Given caps/floors, when set, then the contribution wage is clamped accordingly.
- [ ] Given an entity, when activated, then social-insurance registration IDs must be present for the relevant scheme.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `social_insurance_scheme`, `contribution_rule` schemas (country, nationality, base, rates, cap/floor)
- [ ] Backend: scheme-resolution service by country + nationality
- [ ] Frontend: social-insurance configuration screen
- [ ] Rules/Config: GOSI/GPSSA/SIO/QA/OM/KW rates and bases
- [ ] Tests: unit tests for rate/cap resolution by nationality

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
