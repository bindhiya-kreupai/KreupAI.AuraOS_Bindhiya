# Gap Analysis: EPIC-02-S19 — GCC regulatory comparison matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Renders a configurable matrix (countries as columns, obligation themes as rows: working hours, leave, notice, EOSB, WPS, social insurance, nationalization, key authorities) sourced live from the effective rule sets, so the comparison always reflects current configuration and is exportable for board/audit use.

**Covers:** 2.20
**Acceptance criteria count:** 6 · **Task count:** 5

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

- [ ] Given the matrix, when opened, then it shows all six GCC countries with rows for the key obligation themes drawn from the rule engine.
- [ ] Given an as-of date, when changed, then the matrix reflects the effective rule versions for that date.
- [ ] Given a cell, when no rule exists for a country/theme, then it renders "not applicable / not configured" clearly.
- [ ] Given the matrix, then it is exportable (PDF/Excel) for audit and board reporting.
- [ ] Given RBAC, then only countries within the user's scope are shown.
- [ ] Given a rule change, then the matrix reflects it without code changes.

## Implementation Tasks From Backlog

- [ ] Backend: matrix-builder service reading effective rule versions across countries/themes for an as-of date.
- [ ] Frontend: comparison-matrix screen with as-of-date selector and PDF/Excel export.
- [ ] Rules/Config: configurable theme catalogue mapping to rule-engine domains.
- [ ] Alerts/Workflow: deep-link from cells to the underlying rule version.
- [ ] Tests: integration tests for as-of resolution, missing-rule handling, and export.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
