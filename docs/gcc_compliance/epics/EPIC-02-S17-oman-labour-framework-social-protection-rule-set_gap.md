# Gap Analysis: EPIC-02-S17 — Oman labour framework & social-protection rule set

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the Oman labour framework and Social Protection System encoded, **so that** Oman entities compute entitlements and social-protection contributions correctly.

**Description**
Seeds Oman Labour Law parameters (working hours, annual leave, notice, end-of-service for expats and social-protection linkage for Omanis) and the Social Protection System (PASI successor) contribution rules differing by nationality, with reconciliation hooks. Covers both Oman framework and Social Protection sections.

**Covers:** 2.17, 2.18
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts
- apps/web/src/components/compliance/gosi/GosiConfigPanel.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an Oman entity, when EOS/social-protection is evaluated, then expat end-of-service and Omani social-protection contributions are handled per nationality.
- [ ] Given annual leave/notice, then the seeded Oman parameters are returned.
- [ ] Given an Omani employee, when contributions compute, then the Social Protection branches and rates are applied with the correct contribution salary.
- [ ] Given monthly close, then the social-protection contribution set reconciles to payroll and flags variances.
- [ ] Given a future change, then a new effective-dated Oman version supersedes cleanly.
- [ ] Given any evaluation/contribution, then inputs and outcomes are traced/audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: seed Oman `RuleSet` (working_hours, annual_leave, notice, eos/social_protection); `OmanContribution` schema + engine; migration.
- [ ] Backend: contribution computation by nationality + payroll reconciliation.
- [ ] Frontend: Oman rule-set view and contribution run screen.
- [ ] Rules/Config: Oman labour and Social Protection parameters with source references.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for nationality branching, leave/notice, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
