# Gap Analysis: EPIC-06-S02 — Onboarding objectives, intro context & key takeaways content

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 2

**Description**
Embed configurable guidance content (introduction, onboarding objectives, key takeaways) as contextual help panels and an onboarding "why this matters" banner tied to GCC compliance obligations. Content is editable by System Administrator and version-controlled.

**Covers:** 6.1, 6.2, 6.23
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Implemented - pending migration/workspace integration verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616114500_add_onboarding_guidance_content/migration.sql
- apps/web/src/lib/services/onboarding-guidance.service.ts
- apps/web/src/lib/services/**tests**/onboarding-guidance.service.test.ts
- apps/web/src/app/api/v1/onboarding/guidance/route.ts
- apps/web/src/app/dashboard/onboarding/guidance/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Embed `onboardingGuidanceService.resolve(...)` into the final case workspace help drawer/banner once the full case layout is finalized.
- Run integration/E2E with seeded published guidance and role-bearing admin users.

## Acceptance Criteria To Verify

- [ ] Given the onboarding workspace, when a user opens contextual help, then introduction, objectives and key-takeaways content render per active country.
- [ ] Given a System Administrator edits content, when saved, then a new version is stored and the prior version retained.
- [ ] Given a country context, then country-relevant takeaways (e.g. WPS/social-insurance registration deadlines) are highlighted.
- [ ] Given an audit, then content version shown to each user at each stage is recoverable.

## Implementation Tasks From Backlog

- [ ] Backend: `onboarding_guidance_content` (key, country_code, body, version, status).
- [ ] Backend: content versioning service + retrieval API.
- [ ] Frontend: contextual help drawer and onboarding intro banner.
- [ ] Rules/Config: map takeaways to country obligations.
- [ ] Tests: versioning + country-resolution unit tests.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/onboarding-guidance.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after seeded published guidance and admin users are available.
