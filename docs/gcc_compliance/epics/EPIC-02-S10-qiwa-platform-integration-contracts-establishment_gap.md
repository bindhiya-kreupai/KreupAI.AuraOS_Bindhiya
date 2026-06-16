# Gap Analysis: EPIC-02-S10 — Qiwa platform integration (contracts & establishment)

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8

**Description**
Provides a Qiwa adapter to authenticate/register employment contracts, retrieve establishment and workforce data, and reconcile Qiwa contract status against local records, with validation that a Qiwa-authenticated contract exists where required (e.g., for Saudization counting).

**Covers:** 2.9
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Saudi employment contract, when submitted to Qiwa, then required fields are validated and the authentication reference is stored.
- [ ] Given Qiwa establishment/workforce data, when retrieved, then it is reconciled with local headcount and mismatches flagged.
- [ ] Given a Saudization-counted employee, when they lack a Qiwa-authenticated contract, then a compliance flag is raised.
- [ ] Given any Qiwa call, then request reference and outcome are audit-logged.
- [ ] Given an integration failure, then it is retried and surfaced as an exception.
- [ ] Given RBAC, then only HR Admin/Compliance Officer may trigger Qiwa actions.

## Implementation Tasks From Backlog

- [ ] Backend: Qiwa adapter interface (sandbox), `QiwaContract` schema + migration.
- [ ] Backend: establishment/workforce reconciliation service; mismatch events.
- [ ] Frontend: Qiwa contract status register and reconciliation view.
- [ ] Rules/Config: Qiwa contract-field validation rules.
- [ ] Alerts/Workflow: missing-authenticated-contract flag and retry/exception handling.
- [ ] Tests: integration tests for submission, reconciliation, and exception handling.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
