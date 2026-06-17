# Gap Analysis: EPIC-17-S01 — Saudization overview, purpose & regulatory framework knowledge base

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** an in-product Saudization reference covering purpose, authority and platforms, **so that** HR works from one authoritative source.

**Description**
A configurable, versioned knowledge module rendering Chapter 17 intro/purpose and a registry of authorities/platforms (MHRSD, Qiwa, Nitaqat, GOSI, Mudad, Tamheer/HRDF) with each entry linked to the operationalising AuraOS feature, country-tagged to KSA.

**Covers:** 17.1, 17.2, 17.3
**Acceptance criteria count:** 4 · **Task count:** 4

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

- [ ] Given a KSA entity, when the module opens, then intro/purpose render with a version stamp.
- [ ] Given the authority registry, then MHRSD, Qiwa, Nitaqat, GOSI, Mudad and HRDF are listed with role, portal and linked feature.
- [ ] Given a non-KSA context, then Saudization content is hidden/disabled.
- [ ] Given a content edit, then prior versions are retained and changes are audited.

## Implementation Tasks From Backlog

- [ ] Backend: reuse `nationalization_reference` and `nationalization_authority` entities, country-tagged KSA.
- [ ] Frontend: Saudization reference screen with authority registry.
- [ ] Rules/Config: country scope filter (`SA`).
- [ ] Tests: unit tests for country gating and versioning.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
