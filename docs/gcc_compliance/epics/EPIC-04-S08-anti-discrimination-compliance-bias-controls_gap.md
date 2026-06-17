# Gap Analysis: EPIC-04-S08 — Anti-discrimination compliance & bias controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** anti-discrimination controls across the recruitment lifecycle, **so that** hiring decisions are free from prohibited bias and demonstrably fair.

**Description**
Cross-cutting anti-discrimination layer: configurable protected attributes, masking of prohibited fields during screening/interview, equal-treatment checks, and adverse-impact analytics comparing selection rates across groups. Surfaces a bias red-flag where rejection patterns correlate with protected attributes.

**Covers:** 4.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given protected attributes, when configured per country, then those fields are masked in screening/interview views.
- [ ] Given selection outcomes, when analysed, then selection rates by group are computed for adverse-impact monitoring.
- [ ] Given a rejection pattern correlated with a protected attribute, when detected, then a bias red-flag is raised.
- [ ] Given a decision, when recorded, then it must cite job-related justification, not a protected factor.
- [ ] Given any access to protected data, when it occurs, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: protected-attribute masking middleware + adverse-impact analytics service.
- [ ] Backend: bias red-flag detection rules.
- [ ] Frontend: equal-treatment indicators + adverse-impact report.
- [ ] Rules/Config: per-country protected-attribute list.
- [ ] Alerts/Workflow: bias red-flag alert to Compliance.
- [ ] Tests: unit (adverse-impact calc) + integration (masking enforcement).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
