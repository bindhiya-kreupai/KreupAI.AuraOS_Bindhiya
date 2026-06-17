# Gap Analysis: EPIC-16-S09 — UAE national onboarding controls

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
An onboarding checklist overlay for UAE nationals enforcing mandatory steps — Emirates ID/family book, GPSSA registration trigger, WPS-compliant bank account, contract on MOHRE terms, Nafis registration where applicable — and blocking "counted" status until controls pass.

**Covers:** 16.11
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

- [ ] Given a UAE-national new hire, when onboarding starts, then the Emiratisation checklist (GPSSA, WPS bank, Emirates ID, contract, Nafis) is enforced.
- [ ] Given any mandatory onboarding control is incomplete, when the national would be counted, then counting is blocked and the reason is shown.
- [ ] Given GPSSA registration is initiated, then the linkage is recorded for later reconciliation (S11).
- [ ] Given completion, then a "genuine onboarding" evidence record is created and added to the evidence pack.
- [ ] Given audit, then each control's completion is timestamped and attributed.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_onboarding_control` entity (`employeeId`, `controlType`, `status`, `evidenceRef`, `completedAt`).
- [ ] Backend: counting-gate service that blocks numerator inclusion until controls pass.
- [ ] Frontend: national onboarding checklist with blocking states.
- [ ] Rules/Config: configurable mandatory control set per country.
- [ ] Alerts/Workflow: incomplete-control reminders to HR Admin.
- [ ] Tests: e2e test that incomplete controls block counting.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
