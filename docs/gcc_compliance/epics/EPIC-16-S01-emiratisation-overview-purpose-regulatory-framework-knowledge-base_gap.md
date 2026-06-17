# Gap Analysis: EPIC-16-S01 — Emiratisation overview, purpose & regulatory framework knowledge base

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** an in-product Emiratisation reference covering its purpose, governing authority and key platforms, **so that** HR teams act on a single authoritative source instead of scattered circulars.

**Description**
A configurable, versioned knowledge module rendering Chapter 16 intro/purpose content and a registry of authorities and platforms (MOHRE, Tawteen Gate / Tawteen Partners Club, Nafis, GPSSA, WPS). Each entry links to the AuraOS feature that operationalises it and is country-tagged so non-UAE entities are filtered out.

**Covers:** 16.1, 16.2, 16.3
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a UAE legal entity, when a user opens the Emiratisation module, then intro and purpose content render with a "last reviewed" version stamp.
- [ ] Given the authority registry, when displayed, then MOHRE, Tawteen, Nafis, GPSSA and WPS are listed with role, platform URL and the linked AuraOS feature.
- [ ] Given a non-UAE entity context, when the module loads, then Emiratisation content is hidden/disabled per country scope.
- [ ] Given a content edit, when saved, then the prior version is retained and the change is written to the audit trail with editor and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `nationalization_reference` entity (`countryCode`, `section`, `title`, `body`, `version`, `lastReviewedAt`, `authorityRefs[]`).
- [ ] Backend: `nationalization_authority` entity (`code`, `name`, `role`, `portalUrl`, `linkedFeature`, `countryCode`).
- [ ] Frontend: Emiratisation reference screen with authority registry cards and version badge.
- [ ] Rules/Config: country scope filter (`UAE`) gating module visibility.
- [ ] Tests: unit tests for country gating and version retention.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
