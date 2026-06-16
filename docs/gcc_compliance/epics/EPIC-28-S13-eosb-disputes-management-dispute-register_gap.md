# Gap Analysis: EPIC-28-S13 — EOSB Disputes Management & Dispute Register

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5

**Description**
Provides a dispute workflow and configurable EOSB Dispute Register: a leaver (or authority) raises a dispute against a specific EOSB calculation; HR records the claim, attaches the locked breakdown, runs a recalculation/what-if, records the resolution (upheld/revised/rejected), any adjustment, and links to any labour-court/authority reference. The register tracks status, ageing, root cause and outcome, feeding the audit checklist and dashboard.

**Covers:** 28.20, 28.28
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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a finalised EOSB, when a dispute is raised, then it is logged against the specific calculation with the locked breakdown attached.
- [ ] Given a dispute, when investigated, then a recalculation/what-if can be run and compared to the original without altering the locked figure.
- [ ] Given a resolution, when recorded, then outcome (upheld/revised/rejected), adjustment amount, authority reference and resolution date are captured.
- [ ] Given an open dispute ageing beyond threshold, then it is escalated and flagged.
- [ ] Given the register, then it filters by status/country/outcome, exports, and feeds the monthly pack; all actions are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_dispute` + `eosb_dispute_register` entities (calcRef, claim, status, outcome, adjustment, authorityRef)
- [ ] Backend: what-if recalculation isolated from locked figure
- [ ] Frontend: dispute workflow + register grid with filters/export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for what-if isolation and status transitions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
