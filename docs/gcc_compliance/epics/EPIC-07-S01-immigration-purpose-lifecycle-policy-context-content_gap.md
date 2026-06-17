# Gap Analysis: EPIC-07-S01 — Immigration purpose, lifecycle & policy context content

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 2
**User story:** Compliance Officer, **I want** the immigration module to present its purpose, lifecycle stages and key takeaways in-product, **so that** users understand obligations and the standardised flow.

**Description**
Embed configurable guidance (introduction, purpose of immigration compliance, lifecycle overview, key takeaways) as contextual content tied to GCC authorities and document types, editable and version-controlled by System Administrator.

**Covers:** 7.1, 7.2, 7.3, 7.19
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given the immigration workspace, when help is opened, then introduction, purpose, lifecycle and key-takeaways content render per active country.
- [ ] Given a content edit, when saved, then a new version is stored and prior versions retained.
- [ ] Given a country context, then relevant authorities (MOHRE/ICP/GDRFA, MHRSD/Qiwa, LMRA, PAM, etc.) are referenced.
- [ ] Given audit, then the content version is recoverable.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_guidance_content` (key, country_code, body, version).
- [ ] Backend: versioning + retrieval API.
- [ ] Frontend: contextual help drawer + lifecycle overview panel.
- [ ] Rules/Config: map content to country authorities.
- [ ] Tests: versioning + country-resolution tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
