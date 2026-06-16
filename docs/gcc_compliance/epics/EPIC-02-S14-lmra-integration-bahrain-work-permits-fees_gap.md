# Gap Analysis: EPIC-02-S14 — LMRA integration (Bahrain work permits & fees)

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** LMRA work-permit and fee data integrated for Bahrain, **so that** expat permits and Bahrainization-linked obligations are tracked and alerted.

**Description**
Provides an LMRA adapter to manage expat work permits, fees, and establishment status, with expiry/renewal alerting and reconciliation, and exposes the permit data needed for Bahrainization calculations.

**Covers:** 2.13
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

- [ ] Given an expat in Bahrain, when a work permit is registered, then LMRA-required fields are validated.
- [ ] Given a permit/fee due date, when it approaches, then alerts fire at 60/30/7 days to the PRO/Immigration Officer.
- [ ] Given LMRA status, when retrieved, then it is reconciled with local records and mismatches flagged.
- [ ] Given Bahrainization needs, then valid LMRA permits feed the localization calculation.
- [ ] Given any LMRA action, then reference and outcome are audit-logged.
- [ ] Given RBAC, then only PRO/Immigration Officer/HR Admin may act.

## Implementation Tasks From Backlog

- [ ] Backend: `LmraPermit`, `LmraFee` schema + LMRA adapter; migration.
- [ ] Backend: reconciliation service and permit-expiry scheduler.
- [ ] Frontend: LMRA permit/fee register with expiry indicators.
- [ ] Rules/Config: LMRA field-validation and fee parameters.
- [ ] Alerts/Workflow: 60/30/7-day permit/fee reminders.
- [ ] Tests: integration tests for validation, reconciliation, and alerting.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
