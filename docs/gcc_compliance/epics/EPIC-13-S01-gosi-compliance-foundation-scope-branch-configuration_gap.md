# Gap Analysis: EPIC-13-S01 — GOSI Compliance Foundation, Scope & Branch Configuration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** GOSI scope, purpose and the employer-relevant branches modelled as configurable reference data, **so that** the platform applies the correct GOSI rules to each Saudi legal entity and worker population.

**Description**
Establishes the GOSI domain model in AuraOS: which entities/establishments are in scope, which GOSI branches apply (Annuities/Pensions branch and Occupational Hazards branch), and the purpose/coverage notes surfaced as in-product guidance. Branch applicability differs by nationality (e.g. Occupational Hazards applies to all workers; Annuities primarily to Saudi nationals), so this is the anchor configuration the calculation engine reads.

**Covers:** 13.1, 13.2, 13.3, 13.4
**Acceptance criteria count:** 5 · **Task count:** 6

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

- add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Saudi legal entity, when an admin opens GOSI settings, then they can enable GOSI scope and see the establishment's GOSI registration number captured and validated for format.
- [ ] Given GOSI branches, when configured, then the Annuities branch and Occupational Hazards branch are each modelled with applicability rules keyed by nationality (Saudi / GCC national / expatriate).
- [ ] Given an out-of-scope (non-KSA) entity, when GOSI settings are opened, then GOSI is disabled and the module hidden, with rationale shown.
- [ ] Given contextual help, when a user views any GOSI screen, then purpose/scope guidance (13.1–13.3) is available as inline tooltips sourced from a configurable content table.
- [ ] Given any change to branch applicability, then the change is versioned with effective date and written to the audit trail (who/when/old/new).

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_establishment` entity (id, legalEntityId, gosiRegistrationNumber, status, scopeEnabled, effectiveFrom) + migration
- [ ] Backend: `gosi_branch_config` entity (branchCode = ANNUITIES|OCC_HAZARDS, applicabilityByNationality JSONB, effectiveFrom/To)
- [ ] Backend: rule-engine loader that resolves active GOSI branches for an entity at a given date
- [ ] Frontend: GOSI Settings admin screen (scope toggle, registration number, branch applicability matrix)
- [ ] Rules/Config: nationality classification mapping (Saudi / GCC / Expat) feeding branch applicability
- [ ] Tests: unit tests for branch resolution by nationality and effective date

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
