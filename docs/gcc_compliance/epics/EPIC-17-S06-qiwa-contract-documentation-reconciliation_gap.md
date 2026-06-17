# Gap Analysis: EPIC-17-S06 — Qiwa contract documentation reconciliation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** each counted Saudi reconciled to an authenticated Qiwa contract, **so that** only Saudis with valid, documented contracts count toward the band.

**Description**
A reconciliation engine matching counted Saudis to authenticated Qiwa contracts, validating job title, wage and status, and flagging missing, unauthenticated or mismatched contracts. Unauthenticated/missing contracts exclude the Saudi from genuine counting and feed artificial-Saudization detection.

**Covers:** 17.8
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a counted Saudi, when reconciled, then a matching authenticated Qiwa contract is required or the Saudi is flagged "no valid Qiwa contract."
- [ ] Given a Qiwa contract title/wage differing from HRMS beyond tolerance, when detected, then a mismatch flag with details is raised.
- [ ] Given a missing/unauthenticated contract, when detected, then the Saudi is excluded from genuine counting and the exception is logged.
- [ ] Given reconciliation results, then they are exportable and linked to the evidence pack and artificial-Saudization engine.
- [ ] Given config, then match tolerances are configurable.

## Implementation Tasks From Backlog

- [ ] Backend: `qiwa_contract_recon` entity (`employeeId`, `qiwaContractId`, `qiwaStatus`, `titleMatch`, `wageVariance`, `flag`).
- [ ] Backend: Qiwa contract reconciliation service (import/manual evidence based).
- [ ] Frontend: contract reconciliation grid with mismatch highlights.
- [ ] Rules/Config: configurable title/wage match tolerances.
- [ ] Tests: integration tests for missing/unauthenticated/mismatch cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
