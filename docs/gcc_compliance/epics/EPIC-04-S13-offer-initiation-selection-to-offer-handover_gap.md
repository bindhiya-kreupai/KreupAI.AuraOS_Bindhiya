# Gap Analysis: EPIC-04-S13 — Offer initiation & selection-to-offer handover

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Manager, **I want** to initiate an offer from a cleared, selected candidate, **so that** the recruitment record hands a complete, verified candidate package to Offer Management.

**Description**
Consolidates selection outcome, benchmark, BGV and immigration-eligibility status into a selection-and-offer-approval record, validates all gates are cleared, and emits a `candidate.selected` event with the package to EPIC-05 Offer Management. This is the recruitment-side boundary of offer handling (full offer governance lives in EPIC-05).

**Covers:** 4.16
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

- [ ] Given a selected candidate, when offer initiation starts, then BGV-cleared, eligibility-cleared and benchmark-completed gates are verified.
- [ ] Given an unmet gate, when offer initiation is attempted, then it is blocked listing the missing controls.
- [ ] Given a nationalization-reserved role, when offered to a non-national, then the recorded justification accompanies the package.
- [ ] Given gates cleared, when initiated, then a `candidate.selected` event with the package is published to EPIC-05.
- [ ] Given any offer initiation, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_initiation` record + package assembler service.
- [ ] Backend: gate-verification + event emission (`candidate.selected`).
- [ ] Frontend: selection-and-offer-approval summary screen.
- [ ] Rules/Config: required-gate set per country/role.
- [ ] Alerts/Workflow: handover notification to Offer Management.
- [ ] Tests: integration (gate block) + e2e (selected→event to EPIC-05).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
