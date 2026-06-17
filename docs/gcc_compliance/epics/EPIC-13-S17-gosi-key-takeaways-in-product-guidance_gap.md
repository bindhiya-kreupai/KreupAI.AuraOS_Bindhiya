# Gap Analysis: EPIC-13-S17 — GOSI Key Takeaways & In-Product Guidance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Could · **Estimate:** 2

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short onboarding checklist for new GOSI module users (register on time, declare correct wage, reconcile before submit, de-register leavers). Content is editable by admins and versioned.

**Covers:** 13.22
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the GOSI module home, when opened, then a key-takeaways panel displays configurable best-practice guidance.
- [ ] Given a first-time user, when they enter the module, then a short readiness checklist of GOSI essentials is shown.
- [ ] Given guidance content, when edited by an admin, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic content.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance with EN/AR
- [ ] Tests: unit test for versioning and locale fallback

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
