# Gap Analysis: EPIC-02-S16 — Qatar labour framework & WPS rule set + file

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the Qatar labour framework and WPS encoded with wage-file generation, **so that** Qatar entities compute entitlements correctly and pay salaries through WPS on time.

**Description**
Seeds Qatar Labour Law parameters (working hours, annual leave, end-of-service gratuity of at least three weeks' basic wage per year, notice) and implements the Qatar WPS (SIF) wage-file generator with salary-delay controls and reconciliation. Covers both Qatar framework and Qatar WPS sections.

**Covers:** 2.15, 2.16
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/qatar-wps/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/file-history/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/api/compliance/qatar-wps/route.ts
- apps/web/src/app/dashboard/payroll-compliance/qatar-wps/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/compliance/wps/WpsConfigPanel.tsx
- apps/web/src/components/compliance/wps/WpsFileGenerator.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Qatar entity, when EOS gratuity is evaluated, then at least three weeks' basic wage per year of service is applied per the rule.
- [ ] Given annual leave/notice, then the seeded Qatar parameters are returned for the as-of date.
- [ ] Given an approved Qatar payroll, when a WPS file is generated, then it conforms to the Qatar SIF and passes validation.
- [ ] Given salary not paid within the statutory window, then a delay flag and alert are raised.
- [ ] Given missing mandatory WPS fields (IBAN/QID), then generation is blocked with an error list.
- [ ] Given file generation, then it reconciles to payroll and is audit-logged; release uses maker-checker.

## Implementation Tasks From Backlog

- [ ] Backend: seed Qatar `RuleSet` (working_hours, annual_leave, notice, eos_gratuity_formula); `QatarWpsFile`/`QatarWpsRecord` schema + generator/validator; migration.
- [ ] Backend: salary-delay detection and payroll reconciliation.
- [ ] Frontend: Qatar rule-set view and WPS run screen.
- [ ] Rules/Config: Qatar labour and WPS parameters (window, SIF format, mandatory fields).
- [ ] Alerts/Workflow: salary-delay alert and maker-checker release.
- [ ] Tests: unit tests for EOS gratuity, SIF format, blocking, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
