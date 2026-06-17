# Gap Analysis: EPIC-36-S04 — Oman & Kuwait rule sets and summaries

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Parent epic: EPIC-36: GCC Country Compliance Library & Rule Config
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** authored Oman and Kuwait rule packs and summaries, **so that** entities in those countries apply correct labour-law rules across all modules.

**Description**
Author the Oman rule pack (PAM, Social Protection System, Omanisation, wage controls, EOSB/social-protection linkage) and the Kuwait rule pack (PACI, wage controls, Kuwaitisation, EOSB indemnity) with structured summaries, effective-dated and citation-backed.

**Covers:** A2.7, A2.8
**Acceptance criteria count:** 4 · **Task count:** 4

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

- [ ] Given Oman, when authored, then its summary and rules (Social Protection System, Omanisation, wage controls, EOSB linkage) are captured and bound to the rule engine.
- [ ] Given Kuwait, when authored, then its summary and rules (wage controls, Kuwaitisation, EOSB indemnity) are captured.
- [ ] Given a statutory change, when scheduled, then it activates on its effective date with prior versions retained.
- [ ] Given any change, when saved, then it is audit-logged with citation.

## Implementation Tasks From Backlog

- [ ] Backend: Oman and Kuwait rule-pack content authored against the schema
- [ ] Frontend: Oman/Kuwait summary + rule-pack editor views
- [ ] Rules/Config: Oman (Omanisation/Social Protection/EOSB) and Kuwait (Kuwaitisation/EOSB) rules
- [ ] Tests: unit tests validating key Oman/Kuwait thresholds resolve correctly

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
