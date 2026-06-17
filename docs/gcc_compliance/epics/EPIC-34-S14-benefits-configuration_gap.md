# Gap Analysis: EPIC-34-S14 — Benefits configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3

**Description**
Configure benefit catalogue (medical insurance, life/PA, air ticket, housing, transport, education, loans) with eligibility by grade/category/country, statutory-minimum flags (e.g., mandatory medical cover), payroll linkage and EOSB interaction.

**Covers:** 34.16
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given an entity, when benefits are configured, then plans, eligibility and statutory-minimum flags are defined per country.
- [ ] Given a mandatory benefit (e.g., medical insurance), when an eligible employee lacks it, then a compliance flag is raised.
- [ ] Given payroll linkage, when configured, then benefit values map to pay components/EOSB basis correctly.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_plan`, `eligibility_rule` schemas
- [ ] Backend: statutory-minimum compliance flagging
- [ ] Frontend: benefits configuration screen
- [ ] Rules/Config: per-country mandatory-benefit rules
- [ ] Tests: unit tests for eligibility and mandatory-cover flags

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
