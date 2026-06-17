# Gap Analysis: EPIC-28-S17 — Monthly EOSB Compliance Pack

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a one-click Monthly EOSB Compliance Pack, **so that** I have a complete sign-off-ready evidence bundle of EOSB liability and settlement activity each month.

**Description**
Compiles the period's EOSB artefacts into one downloadable pack: provision movement summary, settlements completed (with calculation sheets), open disputes, KPI snapshot, social-insurance netting summary, provision-vs-actual reconciliation, and the EOSB compliance certificate. Requires sign-off, is versioned and archived for retention.

**Covers:** 28.26
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a closed EOSB period, when the pack is generated, then it includes provision movement, settlements with calculation sheets, open disputes, KPI snapshot, netting summary, and provision-vs-actual reconciliation.
- [ ] Given the pack, then it requires Compliance Officer sign-off before Final.
- [ ] Given an unreconciled provision, when generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

## Implementation Tasks From Backlog

- [ ] Backend: compliance-pack assembler aggregating provision/settlement/dispute/KPI/netting artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack contents and block-on-unreconciled

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
