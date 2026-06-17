# Gap Analysis: EPIC-28-S01 — EOSB Foundation, Governance, Terminology & Objectives

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** the EOSB domain, governance model, terminology and objectives modelled as configurable reference data, **so that** AuraOS shares one consistent EOSB vocabulary and control framework across all GCC entities.

**Description**
Establishes the EOSB module foundation: purpose/objectives, the governance framework (roles, approval authority, segregation of duties for preparer/approver/payer), and a configurable terminology glossary (gratuity, award, indemnity, qualifying service, daily wage, capped wage, accrued liability, vested/forfeited portion). Provides inline guidance and anchors all downstream calculation stories.

**Covers:** 28.1, 28.2, 28.3, 28.4
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

- [ ] Given the EOSB module, when opened, then objectives and governance (roles, authority matrix, segregation of duties) are configurable and displayed inline.
- [ ] Given the terminology glossary, when configured, then each term has a definition surfaced contextually on calculation screens.
- [ ] Given governance roles, when set, then preparer ≠ approver ≠ payer is enforceable downstream.
- [ ] Given guidance content (28.1–28.4), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/terminology change, then it is versioned with effective date and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_governance` (entityId, authorityMatrix JSON, sodRules) + `eosb_term` glossary entity
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: EOSB governance + glossary configuration screens
- [ ] Rules/Config: seed governance roles and EOSB terminology
- [ ] Tests: unit tests for SoD rule evaluation and versioning

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
