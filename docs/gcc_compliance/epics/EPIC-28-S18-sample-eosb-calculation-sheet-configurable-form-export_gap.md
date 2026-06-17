# Gap Analysis: EPIC-28-S18 — Sample EOSB Calculation Sheet (Configurable Form/Export)

> **✅ SHIPPED 2026-06-17** — Theme D closure. Default form template added to `hr-forms-compliance` DEFAULT_TEMPLATES with writeback target. Surfaced via existing forms registry, routing, e-signature, and writeback infrastructure. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** a configurable EOSB Calculation Sheet auto-populated from the calculation with a full line-by-line breakdown, **so that** the leaver and auditors see exactly how the figure was derived.

**Description**
Provides a digital, template-driven EOSB Calculation Sheet auto-populated from a calculation: employee/entity/country, join and last-working-day dates, qualifying service (with unpaid-leave adjustment), salary basis and day/month rate, accrual bands with sub-totals, caps, resignation/termination treatment, social-insurance netting, and the final entitlement. Configurable per entity, bilingual (EN/AR), exports to PDF and attaches to the final settlement and dispute records.

**Covers:** 28.27
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

- [ ] Given a calculation, when generated, then the sheet auto-populates identity, dates, service (incl. unpaid-leave adjustment), salary basis/rate, accrual bands, caps, separation treatment, netting and final figure.
- [ ] Given the template, when configured, then header/footer/clauses/logo are editable per entity without code, and EN/AR layouts are supported.
- [ ] Given the sheet, when generated, then it exports to PDF and attaches to the final settlement and any dispute.
- [ ] Given a recalculation, then a new versioned sheet is produced and the prior retained.
- [ ] Given any sheet generation, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: calculation-sheet template engine + calculation data-binding
- [ ] Backend: versioning + PDF export + attachment links
- [ ] Frontend: template editor + generate/preview screen
- [ ] Rules/Config: per-entity template config (EN/AR)
- [ ] Tests: unit test for data-binding, versioning and PDF export

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
