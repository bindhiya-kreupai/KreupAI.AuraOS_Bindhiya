# Gap Analysis: EPIC-14-S09 — Employee Transfers & GPSSA Continuity

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
Handles transfer scenarios: between group legal entities (establishments) and transfers in/out from other employers. AuraOS ensures the GPSSA registration moves to the new establishment, service continuity is preserved, the prior establishment de-registers and the new one registers without a contribution gap or overlap, and GCC unified-extension transfers are supported.

**Covers:** 14.11
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an inter-establishment transfer, when processed, then the member is de-registered from the source and registered to the target establishment with continuous service dates.
- [ ] Given a transfer, when monthly runs execute, then there is no double contribution or gap for the transfer month (per configurable rule).
- [ ] Given a transfer in from another employer, when recorded, then prior GPSSA service can be captured for continuity.
- [ ] Given a GCC national transfer under the unified extension, then home-country handling rules apply per configuration.
- [ ] Given any transfer, then source/target establishment, dates, and actor are audited.

## Implementation Tasks From Backlog

- [ ] Backend: transfer service handling de-register/register across establishments with continuity
- [ ] Backend: gap/overlap guard in monthly snapshot for transfer month
- [ ] Frontend: GPSSA transfer panel in mobility/transfer flow
- [ ] Rules/Config: transfer-month contribution rule + GCC unified-extension handling
- [ ] Tests: unit tests for continuity, no double/gap, GCC transfer

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
