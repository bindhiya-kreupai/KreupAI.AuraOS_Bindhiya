# Gap Analysis: EPIC-18-S02 — Bahrainization applicability determination

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
A rules-driven applicability engine mapping each entity to its sector and size, and selecting the applicable Bahrainization target ratio (configurable per sector/size band), producing an effective-dated applicability record.

**Covers:** 18.4
**Acceptance criteria count:** 4 · **Task count:** 6

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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given entity sector and headcount, when applicability runs, then in-scope status and applicable target ratio are determined.
- [ ] Given a sector with a specific Bahrainization percentage, when matched, then that percentage governs and the basis is recorded.
- [ ] Given a headcount/sector change, when recalculated, then applicability is re-evaluated and Compliance is alerted.
- [ ] Given any determination, then inputs, matched rule version and result are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_applicability` entity (`entityId`, `period`, `inScope`, `sector`, `targetRatio`, `basis`, `ruleVersion`).
- [ ] Backend: applicability evaluation service.
- [ ] Frontend: applicability panel with target ratio and basis.
- [ ] Rules/Config: configurable sector/size target-ratio bands per country.
- [ ] Alerts/Workflow: applicability-change alert to Compliance.
- [ ] Tests: integration tests across sector/size scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
