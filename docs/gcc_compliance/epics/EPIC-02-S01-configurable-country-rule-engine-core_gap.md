# Gap Analysis: EPIC-02-S01 — Configurable country rule engine core

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** a versioned, effective-dated rule engine that stores labour-law parameters per GCC country, **so that** every module evaluates rules by country and date without hard-coded logic.

**Description**
The foundational service: rules are typed parameters (numeric thresholds, formulas, enums, schedules) grouped by domain (working-hours, leave, notice, EOSB, contributions, nationalization, WPS) and scoped to a country with effective-from/to dates. Modules call `evaluate(domain, country, asOfDate, context)` and receive the applicable rule version.

**Covers:** 2.1
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a domain, country, and as-of date, when a module queries the engine, then it returns exactly one effective rule version (or a clear "no rule" result).
- [ ] Given overlapping effective dates for the same country/domain, when saving, then the engine rejects the overlap.
- [ ] Given a rule, when published, then the prior version is retained and remains queryable for historical (retro) calculations.
- [ ] Given a rule evaluation, then inputs, matched rule version, and output are logged for audit and reproducibility.
- [ ] Given a country not enabled for the tenant (per EPIC-01), then evaluation is blocked.
- [ ] Given RBAC, then only Compliance Officer/System Administrator may author rules.

## Implementation Tasks From Backlog

- [ ] Backend: `RuleSet`, `RuleVersion` (domain, country, effective_from, effective_to, status), `RuleParameter` (key, type, value/formula) schema + migration.
- [ ] Backend: `RuleEvaluationService.evaluate()` with effective-date resolution and overlap guard.
- [ ] Backend: evaluation-trace persistence and `rule.evaluated` event.
- [ ] Frontend: rule-authoring workspace (parameter editor, effective-date picker, version history).
- [ ] Rules/Config: domain taxonomy and parameter type system.
- [ ] Tests: unit tests for effective-date resolution, overlap rejection, and retro evaluation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
