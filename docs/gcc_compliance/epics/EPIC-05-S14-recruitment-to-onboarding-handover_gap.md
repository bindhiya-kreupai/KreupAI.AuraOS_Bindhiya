# Gap Analysis: EPIC-05-S14 — Recruitment-to-onboarding handover

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** an accepted offer to hand a complete, validated package to onboarding, **so that** no data is re-keyed and onboarding starts only when all pre-employment gates are cleared.

**Description**
Assembles the full handover package (candidate data, contract, salary structure, benefits, cleared conditions, BGV/medical/document/work-permit status) and, once all mandatory gates pass, emits a `candidate.ready_to_onboard` event to EPIC-06 with the package. Provides a handover checklist confirming completeness and prevents premature handover.

**Covers:** 5.15
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

- [ ] Given an accepted offer, when handover is initiated, then all mandatory gates (conditions, BGV, medical, documents, work-permit readiness) are verified.
- [ ] Given an unmet gate, when handover is attempted, then it is blocked listing outstanding items.
- [ ] Given all gates cleared, when initiated, then a `candidate.ready_to_onboard` event with the package is published to EPIC-06.
- [ ] Given the handover, when completed, then a handover record/checklist confirms completeness.
- [ ] Given any handover action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: handover package assembler + gate-verification service.
- [ ] Backend: `candidate.ready_to_onboard` event emission to EPIC-06.
- [ ] Frontend: handover checklist/summary screen.
- [ ] Rules/Config: required-gate set per country/role for handover.
- [ ] Alerts/Workflow: handover notification to Onboarding; block on incomplete.
- [ ] Tests: integration (gate block) + e2e (accepted→event to EPIC-06).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
