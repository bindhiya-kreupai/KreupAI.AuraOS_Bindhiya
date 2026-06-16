# Gap Analysis: EPIC-36-S05 — GCC comparison tables (overview, payroll, social insurance, nationalization, immigration)

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Parent epic: EPIC-36: GCC Country Compliance Library & Rule Config
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** side-by-side GCC comparison tables generated from the rule packs, **so that** multi-country differences are visible and never drift from the live rules.

**Description**
Generate comparison tables from the live rule packs: the overall GCC country comparison table plus domain comparisons for payroll, social insurance, nationalization and immigration — so each table is a live projection of the rule packs, not a static document, and updates when a country rule changes.

**Covers:** A2.9, A2.10, A2.11, A2.12, A2.13
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/api/v1/benefits/cost-comparison/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/benefits/PlanComparisonTable.tsx
- services/payroll-service/src/services/emiratisation-service.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the rule packs, when compared, then the GCC comparison table and payroll/social-insurance/nationalization/immigration comparisons render the six countries side by side.
- [ ] Given a rule-pack change, when published, then the affected comparison cells update automatically.
- [ ] Given a comparison cell, when clicked, then it drills to the underlying rule and citation.
- [ ] Given a comparison, when exported, then it produces a table export and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: comparison-projection service reading live rule packs
- [ ] Frontend: comparison-table views (overview + payroll/SI/nationalization/immigration) with drill-down
- [ ] Rules/Config: comparison dimension definitions per domain
- [ ] Tests: integration tests for live projection and auto-update on rule change

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
