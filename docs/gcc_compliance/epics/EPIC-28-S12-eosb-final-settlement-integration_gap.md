# Gap Analysis: EPIC-28-S12 — EOSB ↔ Final Settlement Integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8

**Description**
Connects EOSB to the EPIC-27 final settlement: on separation the EOSB calculation is generated, attached to the final settlement alongside leave encashment, deductions and recoveries, routed through maker-checker (preparer ≠ approver), and on approval/payout the provision is released and the actual-vs-provision difference posted. Prevents the settlement from being finalised without an approved EOSB figure.

**Covers:** 28.19
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a separation, when initiated, then an EOSB calculation is generated and attached to the final settlement record.
- [ ] Given the EOSB figure, when submitted, then maker-checker requires an approver different from the preparer before it can be included in payout.
- [ ] Given final settlement approval, then the EOSB amount is locked, the provision released, and any actual-vs-provision variance posted.
- [ ] Given a settlement attempted without an approved EOSB, then it is blocked with a clear message.
- [ ] Given any settlement integration step, then it is audited and the locked breakdown retained.

## Implementation Tasks From Backlog

- [ ] Backend: EOSB→final-settlement attachment + lock-on-approval
- [ ] Backend: maker-checker state machine via workflow engine
- [ ] Backend: provision-release + actual-vs-provision posting on payout
- [ ] Frontend: EOSB panel within the final-settlement screen
- [ ] Alerts/Workflow: approval routing + block-without-approved-EOSB gate
- [ ] Tests: integration test settlement incl. preparer≠approver and provision release

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
