# Gap Analysis: EPIC-16-S21 — Emiratisation key takeaways & guidance summary

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Could · **Estimate:** 1

**Description**
A concise, versioned summary page distilling Chapter 16 takeaways (genuine employment, evidence-first, checkpoint discipline, fake-Emiratisation avoidance) with links to the relevant AuraOS features and dashboards.

**Covers:** 16.26
**Acceptance criteria count:** 3 · **Task count:** 3

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

- [ ] Given the module, when a user opens key takeaways, then a summary with deep links to target, evidence, detection and dashboard features renders.
- [ ] Given a content update, then it is versioned and audited.
- [ ] Given country scope, then it shows only for UAE entities.

## Implementation Tasks From Backlog

- [ ] Backend: reuse `nationalization_reference` for takeaways content.
- [ ] Frontend: key-takeaways page with feature deep links.
- [ ] Tests: smoke test for rendering and links.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
