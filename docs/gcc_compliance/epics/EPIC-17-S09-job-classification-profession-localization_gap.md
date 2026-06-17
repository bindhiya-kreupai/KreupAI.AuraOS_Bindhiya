# Gap Analysis: EPIC-17-S09 — Job classification & profession localization

> **✅ SHIPPED 2026-06-17** — Theme B closure. Shared `nationalisation-overlay` registry: requisition tags (TA pipeline), job/position tags, retention ledger with early-attrition flag, L&D plan tracker, artificial-risk detection (9 signals, banded LOW/MEDIUM/HIGH/CRITICAL), Saudi profession-localisation codes. Consumed by emiratisation-, nitaqat-, bahrainization-compliance services. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Maintains a configurable register of localized/reserved professions (per MHRSD decisions), maps positions and job titles to them, and flags reserved roles occupied by expatriates or below the required localization percentage for a profession.

**Covers:** 17.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/india-statutory/professional-tax/page.tsx
- apps/web/src/app/api/compliance/india-professional-tax/route.ts
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- apps/web/src/lib/services/compliance/**tests**/india-professional-tax.service.test.ts
- apps/web/src/lib/services/compliance/india-professional-tax.service.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the localized-profession register, when a position is mapped to a reserved profession, then a Saudi-only or minimum-localization rule is applied.
- [ ] Given a reserved role occupied by an expatriate, when detected, then a localization-breach flag is raised.
- [ ] Given a profession with a required localization %, when below target, then the shortfall is shown.
- [ ] Given a recruitment requisition for a reserved profession, when created, then a Saudi-priority/Saudi-only control is enforced.
- [ ] Given config, then the reserved-profession list and percentages are editable and versioned.

## Implementation Tasks From Backlog

- [ ] Backend: `localized_profession` entity (`professionCode`, `localizationPct`, `saudiOnly`, `effectiveFrom`) and position mapping.
- [ ] Backend: profession-localization evaluation service.
- [ ] Frontend: profession-localization register and breach view.
- [ ] Rules/Config: editable reserved-profession list and required percentages.
- [ ] Alerts/Workflow: breach alerts and recruitment-control enforcement.
- [ ] Tests: integration tests for breach detection and recruitment control.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
