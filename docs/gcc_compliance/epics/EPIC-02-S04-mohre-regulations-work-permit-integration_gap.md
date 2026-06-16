# Gap Analysis: EPIC-02-S04 — MOHRE regulations & work-permit integration

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** MOHRE establishment, contract, and work-permit rules with integration hooks, **so that** UAE permit obligations are tracked, validated, and alerted automatically.

**Description**
Encodes MOHRE rules (establishment status, labour-contract registration, work-permit lifecycle, quota/category context) and provides an integration adapter to submit/track contracts and permits, with expiry alerting on the EPIC-01 backbone.

**Covers:** 2.3
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

- [ ] Given a UAE employee, when a labour contract is registered, then required MOHRE fields are validated before submission.
- [ ] Given a work permit, when its expiry approaches, then alerts fire at 60/30/7 days to the PRO/Immigration Officer.
- [ ] Given a MOHRE integration response, when received, then status is reconciled against the local record and mismatches are flagged.
- [ ] Given a missing or expired permit, then dependent actions (e.g., payroll activation hooks) can be blocked per configuration.
- [ ] Given any MOHRE submission/response, then the payload reference and outcome are audit-logged.
- [ ] Given RBAC, then only PRO/Immigration Officer and HR Admin may initiate MOHRE actions.

## Implementation Tasks From Backlog

- [ ] Backend: `MohreEstablishment`, `LabourContract`, `WorkPermit` schema + migration; MOHRE adapter interface (stub + sandbox).
- [ ] Backend: reconciliation service comparing MOHRE status vs. local; emit mismatch events.
- [ ] Frontend: MOHRE contract/permit register with status and expiry indicators.
- [ ] Rules/Config: MOHRE field-validation rules sourced from the UAE rule set.
- [ ] Alerts/Workflow: 60/30/7-day permit-expiry reminders.
- [ ] Tests: integration tests for submission, reconciliation, and expiry alerting.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
