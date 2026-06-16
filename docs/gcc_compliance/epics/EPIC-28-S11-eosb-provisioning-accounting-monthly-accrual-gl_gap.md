# Gap Analysis: EPIC-28-S11 — EOSB Provisioning & Accounting (Monthly Accrual + GL)

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** EOSB liability accrued monthly per employee and posted as journal data to finance, **so that** the balance sheet reflects an accurate, audit-ready provision at all times.

**Description**
Runs a monthly EOSB provisioning calculation: for every active employee, the engine computes the hypothetical entitlement at month-end (as if they left), records the period accrual (movement vs prior month: service increase, salary change, new joiners, leavers releasing provision), and produces journal lines (provision charge, release on settlement) for the Payroll→GL integration. Maintains a per-employee accrued-liability ledger feeding the dashboard and audit.

**Covers:** 28.18
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/components/admin/TenantProvisioningWizard.tsx
- apps/web/src/lib/auth/user-provisioning.service.ts
- apps/web/src/services/tenantProvisioningService.ts
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given month-end, when provisioning runs, then each active employee's accrued EOSB liability is computed and the movement vs prior month recorded.
- [ ] Given a new joiner, salary change, or service growth, when provisioned, then the accrual movement is captured and explained.
- [ ] Given a leaver, when settled, then the provision is released and the difference vs actual payout posted.
- [ ] Given the provisioning run, then journal lines (charge/release) are produced and handed to the GL integration with a cost-centre/entity split.
- [ ] Given the per-employee ledger, then accrued balances reconcile to the total provision and are auditable.

## Implementation Tasks From Backlog

- [ ] Backend: monthly provisioning job using the formula engine in "as-if-leaving" mode
- [ ] Backend: `eosb_provision_ledger` (employeeId, period, openingBal, accrual, release, closingBal) + journal builder
- [ ] Backend: GL hand-off payload (account, cost centre, entity)
- [ ] Frontend: provision movement report + per-employee ledger
- [ ] Rules/Config: provision GL mapping per entity
- [ ] Tests: unit tests for movement, release on settlement, ledger reconciliation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
