# Gap Analysis: EPIC-02-S11 — Mudad platform integration (Saudi wage protection)

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** Mudad wage-file generation and payroll integration for KSA, **so that** Saudi salaries are processed and protected through Mudad with delay controls.

**Description**
Implements Saudi Wage Protection (Mudad) rules and a wage-file generator/adapter, validating mandatory fields, generating the Mudad-compliant file, flagging wage commitment ratio/delays, and reconciling against payroll.

**Covers:** 2.10
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx
- apps/web/src/app/api/compliance/mudad/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an approved KSA payroll, when a Mudad file is generated, then it conforms to the Mudad format and passes validation.
- [ ] Given the Mudad wage-commitment expectation, when payment is delayed beyond the statutory window, then a delay flag and alert are raised.
- [ ] Given missing IBAN/national-id/GOSI linkage, then file generation is blocked with an error list.
- [ ] Given a generated file, then it reconciles against payroll totals.
- [ ] Given generation/submission, then the run is audit-logged with totals.
- [ ] Given RBAC + maker-checker, then release requires a different approver.

## Implementation Tasks From Backlog

- [ ] Backend: `MudadFile`, `MudadRecord` schema + generator/validator; Mudad adapter; migration.
- [ ] Backend: delay detection against the KSA statutory window from the rule engine.
- [ ] Frontend: Mudad run screen with validation and download.
- [ ] Rules/Config: KSA wage-protection parameters (window, mandatory fields, format).
- [ ] Alerts/Workflow: wage-delay alert and maker-checker release.
- [ ] Tests: unit tests for format, blocking, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
