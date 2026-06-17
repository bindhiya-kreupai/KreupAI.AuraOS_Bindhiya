# Gap Analysis: EPIC-02-S15 — SIO integration (Bahrain social insurance)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** Bahrain SIO registration and contribution rules with integration, **so that** Bahraini and expat social-insurance/EOS funding contributions are computed and reconciled.

**Description**
Encodes SIO contribution branches and rates (differing by nationality, including expat end-of-service savings funding), contribution-salary definition, monthly process, and reconciliation; aligns with LMRA records and provides a contribution file/adapter.

**Covers:** 2.14
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/lib/services/**tests**/benefits-claim.integration.test.ts
- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/app/(modules)/payroll-compliance/bahrain-sio/page.tsx
- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx
- apps/web/src/app/api/compliance/bahrain-sio/route.ts
- apps/web/src/app/api/v1/compliance/bahrain-sio/readiness/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Bahraini employee, when contributions compute, then the applicable SIO branches and rates are applied.
- [ ] Given an expat employee, when contributions compute, then the expat EOS-savings/applicable branch and rate are applied.
- [ ] Given monthly close, when the SIO submission is prepared, then it reconciles to payroll and flags variances.
- [ ] Given LMRA records, then SIO registration is cross-checked for alignment and gaps flagged.
- [ ] Given any SIO action, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run SIO processing.

## Implementation Tasks From Backlog

- [ ] Backend: `SioRegistration`, `SioContribution` schema + branch-aware engine; migration.
- [ ] Backend: SIO adapter/file generator, payroll reconciliation, and LMRA alignment check.
- [ ] Frontend: SIO monthly run + variance/alignment review screen.
- [ ] Rules/Config: SIO branches, rates by nationality, contribution-salary definition.
- [ ] Alerts/Workflow: contribution-due reminder, variance and LMRA-mismatch alerts.
- [ ] Tests: unit tests for Bahraini vs. expat branches, reconciliation, and LMRA alignment.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
