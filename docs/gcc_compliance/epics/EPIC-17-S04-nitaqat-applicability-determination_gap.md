# Gap Analysis: EPIC-17-S04 — Nitaqat applicability determination

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
An applicability engine mapping each entity to its Nitaqat activity (economic activity code) and size category (by counted headcount), and determining whether minimum-size applicability is met, producing an effective-dated applicability record.

**Covers:** 17.6
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

- [ ] Given entity activity and headcount, when applicability runs, then activity + size category and in-scope status are determined.
- [ ] Given a headcount change crossing a size-tier boundary, when recalculated, then the size category updates and Compliance is alerted.
- [ ] Given multi-activity entities, when configured, then the governing activity is resolved per rule and recorded.
- [ ] Given any determination, then inputs, matched rule version and result are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `nitaqat_applicability` entity (`entityId`, `activity`, `sizeCategory`, `inScope`, `basis`, `ruleVersion`).
- [ ] Backend: applicability/size-tier resolution service.
- [ ] Frontend: applicability panel with activity/size and basis.
- [ ] Rules/Config: size-tier boundaries and activity mapping per country.
- [ ] Alerts/Workflow: size-tier-change alert to Compliance.
- [ ] Tests: integration tests across size-boundary and multi-activity cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
