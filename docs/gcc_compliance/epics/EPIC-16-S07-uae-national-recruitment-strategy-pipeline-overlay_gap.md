# Gap Analysis: EPIC-16-S07 — UAE national recruitment strategy & pipeline overlay

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Adds UAE-national tagging, a dedicated national-candidate pipeline, Nafis/Tawteen sourcing channels, and gap-driven requisition targeting to the recruitment flow. Open requisitions can be flagged "Emiratisation priority" and linked to the current gap.

**Covers:** 16.9
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/recruitment/CandidatePipeline.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an open gap, when requisitions are created, then HR can flag roles as Emiratisation-priority and link them to the gap target.
- [ ] Given a national candidate, when sourced, then channel (Nafis/Tawteen/referral) and eligibility are tagged for later evidence.
- [ ] Given the pipeline view, then national candidates by stage and the projected impact on the gap are shown.
- [ ] Given a national hire, then the gap and target dashboards update on the next recalculation.
- [ ] Given RBAC, then recruiters see only their entity's national pipeline.

## Implementation Tasks From Backlog

- [ ] Backend: extend candidate/requisition with `isUaeNational`, `sourcingChannel`, `emiratisationPriority`, `linkedGapTargetId`.
- [ ] Backend: pipeline aggregation service for national candidates vs. gap.
- [ ] Frontend: Emiratisation recruitment board with gap-impact indicator.
- [ ] Rules/Config: configurable sourcing channel list (Nafis, Tawteen, referral).
- [ ] Tests: integration test linking a national hire to gap reduction.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
