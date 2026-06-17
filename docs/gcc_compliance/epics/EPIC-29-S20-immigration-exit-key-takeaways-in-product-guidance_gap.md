# Gap Analysis: EPIC-29-S20 — Immigration Exit Key Takeaways & In-Product Guidance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Could · **Estimate:** 2
**User story:** PRO / Immigration Officer, **I want** immigration-exit key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid overstay, missed cancellation and absconding-reporting errors.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for exit users (choose cancellation vs transfer correctly, cancel dependents in sequence, track the grace period, complete repatriation, report absconding only after the waiting period, capture authority evidence, close payroll/benefits/SI). Content is admin-editable, versioned and EN/AR.

**Covers:** 29.28
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given the exit module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of exit essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_exit_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
