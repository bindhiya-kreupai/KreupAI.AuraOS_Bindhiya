# Gap Analysis: EPIC-02-S09 — GOSI compliance & contribution integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** GOSI registration and contribution rules with integration support, **so that** Saudi and expat social-insurance contributions are computed, submitted, and reconciled.

**Description**
Encodes GOSI branches (annuities for Saudis, occupational-hazard for all), contribution-wage definition and ceiling, employer/employee rates differing by nationality, monthly process, and reconciliation; provides a GOSI adapter/file.

**Covers:** 2.8
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/compliance/gosi/GosiConfigPanel.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/services/compliance/gosi.service.test.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Saudi employee, when contributions compute, then annuities + occupational-hazard branches and the correct rates/ceiling are applied.
- [ ] Given an expat employee, when contributions compute, then only the applicable (occupational-hazard) branch and rate are applied.
- [ ] Given the contribution wage, then it is capped at the GOSI ceiling from the rule engine.
- [ ] Given monthly close, when the GOSI submission is prepared, then it reconciles to payroll and flags variances.
- [ ] Given any GOSI action, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run GOSI processing.

## Implementation Tasks From Backlog

- [ ] Backend: `GosiRegistration`, `GosiContribution` schema + branch-aware contribution engine; migration.
- [ ] Backend: GOSI adapter/file generator and payroll reconciliation service.
- [ ] Frontend: GOSI monthly run + variance review screen.
- [ ] Rules/Config: GOSI branches, rates by nationality, contribution-wage definition, ceiling.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for Saudi vs. expat branches, ceiling cap, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
