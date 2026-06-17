# Gap Analysis: EPIC-17-S11 — Saudi national recruitment strategy & pipeline overlay

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Adds Saudi-national tagging, a dedicated Saudi pipeline, HRDF/Tamheer/Qiwa sourcing channels and band-gap-driven requisition targeting, with reserved-profession requisitions enforced as Saudi-priority.

**Covers:** 17.13
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

- [ ] Given a band gap, when requisitions are created, then roles can be flagged Saudization-priority and linked to the gap.
- [ ] Given a Saudi candidate, when sourced, then channel (HRDF/Tamheer/Qiwa/referral) and eligibility are tagged.
- [ ] Given the pipeline view, then Saudi candidates by stage and projected band impact are shown.
- [ ] Given a Saudi hire, then ratio/band dashboards update on recalculation.
- [ ] Given a reserved-profession requisition, then a Saudi-priority control is enforced.

## Implementation Tasks From Backlog

- [ ] Backend: extend candidate/requisition with `isSaudiNational`, `sourcingChannel`, `saudizationPriority`, `linkedBandGapId`.
- [ ] Backend: pipeline aggregation service vs. band gap.
- [ ] Frontend: Saudization recruitment board with band-impact indicator.
- [ ] Rules/Config: configurable sourcing channels (HRDF, Tamheer, Qiwa).
- [ ] Tests: integration test linking a Saudi hire to band-gap reduction.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
