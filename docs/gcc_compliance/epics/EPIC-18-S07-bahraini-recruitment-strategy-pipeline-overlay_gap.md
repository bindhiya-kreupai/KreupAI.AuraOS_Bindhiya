# Gap Analysis: EPIC-18-S07 — Bahraini recruitment strategy & pipeline overlay

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5

**Description**
Adds Bahraini-national tagging, a dedicated Bahraini pipeline, Tamkeen/MOL/referral sourcing channels and gap-driven requisition targeting, with the ability to flag roles as Bahrainization-priority and link them to the current gap and any permit/tender requirement.

**Covers:** 18.9
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

- [ ] Given a ratio gap, when requisitions are created, then roles can be flagged Bahrainization-priority and linked to the gap.
- [ ] Given a Bahraini candidate, when sourced, then channel (Tamkeen/MOL/referral) and eligibility are tagged.
- [ ] Given the pipeline view, then Bahraini candidates by stage and projected ratio impact are shown.
- [ ] Given a Bahraini hire, then ratio/gap dashboards update on recalculation.
- [ ] Given RBAC, then recruiters see only their entity's Bahraini pipeline.

## Implementation Tasks From Backlog

- [ ] Backend: extend candidate/requisition with `isBahrainiNational`, `sourcingChannel`, `bahrainizationPriority`, `linkedGapId`.
- [ ] Backend: pipeline aggregation service vs. ratio gap.
- [ ] Frontend: Bahrainization recruitment board with ratio-impact indicator.
- [ ] Rules/Config: configurable sourcing channels (Tamkeen, MOL, referral).
- [ ] Tests: integration test linking a Bahraini hire to gap reduction.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
