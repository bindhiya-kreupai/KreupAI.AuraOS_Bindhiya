# Gap Analysis: EPIC-16-S02 — Emiratisation applicability determination

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
A rules-driven applicability engine evaluating entity attributes (sector, private/semi-government, total headcount, skilled-worker count) against configurable MOHRE applicability bands (e.g., private firms with 50+ employees subject to annual skilled-Emiratisation growth; smaller-firm targeted-sector rules). Output is an effective-dated applicability record per entity per period.

**Covers:** 16.4
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given an entity with ≥50 skilled employees, when applicability runs, then it is flagged in-scope with the applicable annual growth target band.
- [ ] Given a sub-threshold entity in a targeted sector, when applicability runs, then the targeted-sector rule is applied and the basis is recorded.
- [ ] Given a headcount change crossing the threshold mid-year, when recalculated, then applicability is re-evaluated and an alert is raised to Compliance.
- [ ] Given any determination, then inputs, matched rule version and result are stored for audit.
- [ ] Given RBAC, then only Compliance/HR Manager roles can override an applicability result, with reason captured.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_applicability` entity (`entityId`, `period`, `inScope`, `thresholdBand`, `basis`, `ruleVersion`, `overrideReason`).
- [ ] Backend: applicability evaluation service consuming headcount/skilled-worker counts.
- [ ] Frontend: applicability panel with in-scope flag, basis and override action.
- [ ] Rules/Config: configurable applicability bands (headcount thresholds, sector lists) per country.
- [ ] Alerts/Workflow: threshold-crossing alert to Compliance.
- [ ] Tests: integration tests across threshold and targeted-sector scenarios.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
