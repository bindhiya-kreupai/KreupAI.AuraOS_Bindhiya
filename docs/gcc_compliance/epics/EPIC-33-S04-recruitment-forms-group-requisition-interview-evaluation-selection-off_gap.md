# Gap Analysis: EPIC-33-S04 — Recruitment forms group (requisition, interview evaluation, selection/offer approval)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**User story:** Line Manager, **I want** digital recruitment forms for manpower requisition, interview evaluation and candidate selection/offer approval, **so that** hiring decisions are captured, scored and approved with full traceability and nationalization checks.

**Description**
Delivers the recruitment form group as configurable forms feeding the recruitment module (EPIC-03/04/05): Manpower Requisition (with headcount/budget and localization fields), Interview Evaluation (competency scoring), and Candidate Selection & Offer Approval (with approval thresholds). Includes anti-discrimination and nationalization flags at capture.

**Covers:** 33.5, 33.6, 33.7, 33.8
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the Manpower Requisition form, when submitted, then it validates against headcount budget and captures localization/nationalization target, routing for budget approval.
- [ ] Given the Interview Evaluation form, then competency scores aggregate to a recommendation and panel members each submit independently.
- [ ] Given the Selection & Offer Approval form, then it enforces approval authority by grade/salary band and links the selected candidate to the requisition.
- [ ] Given GCC rules, then nationalization-eligibility and anti-discrimination prompts appear where applicable.
- [ ] Given approval, then approved requisition/selection data writes back to the recruitment module and is audited.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + write-back mappers to recruitment entities.
- [ ] Backend: budget/headcount validation hook; score-aggregation service for evaluations.
- [ ] Frontend: requisition, interview evaluation, selection/offer approval forms.
- [ ] Rules/Config: approval authority by grade/band; nationalization flags per country.
- [ ] Alerts/Workflow: budget and offer-approval routing.
- [ ] Tests: integration (budget validation, score aggregation, write-back).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
