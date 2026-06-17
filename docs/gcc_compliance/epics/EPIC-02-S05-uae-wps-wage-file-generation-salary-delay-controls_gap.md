# Gap Analysis: EPIC-02-S05 — UAE WPS wage-file generation & salary-delay controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** UAE WPS wage files generated to the statutory SIF format with salary-delay controls, **so that** salaries are paid through WPS on time and penalties are avoided.

**Description**
Implements UAE Wage Protection System rule parameters and a wage-file (SIF) generator, validating against MOHRE WPS requirements, flagging salary delays beyond the statutory window, and reconciling generated vs. paid.

**Covers:** 2.4
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/compliance/wps/WpsConfigPanel.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an approved UAE payroll, when a WPS file is generated, then it conforms to the SIF structure and passes format validation.
- [ ] Given the statutory pay window, when salaries are not paid within it (delay > 15 days), then a salary-delay flag and alert are raised.
- [ ] Given a WPS file, when records are missing mandatory fields (e.g., IBAN, labour card / MOL id), then generation is blocked with a clear error list.
- [ ] Given a generated file, then it is reconciled against payroll totals and discrepancies are flagged.
- [ ] Given file generation/submission, then the run is audit-logged with totals and record counts.
- [ ] Given RBAC + maker-checker, then file release requires an approver different from the preparer.

## Implementation Tasks From Backlog

- [ ] Backend: `WpsFile`, `WpsRecord` schema + SIF generator and validator; migration.
- [ ] Backend: salary-delay detection against statutory window from the rule engine.
- [ ] Frontend: WPS run screen with validation results and file download.
- [ ] Rules/Config: UAE WPS parameters (window, mandatory fields, SIF format).
- [ ] Alerts/Workflow: salary-delay alert and maker-checker release.
- [ ] Tests: unit tests for SIF format, mandatory-field blocking, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
