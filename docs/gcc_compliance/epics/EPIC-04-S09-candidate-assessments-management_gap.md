# Gap Analysis: EPIC-04-S09 — Candidate assessments management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 3
**User story:** HR Admin, **I want** to administer and record candidate assessments, **so that** validated, job-related tests support selection consistently.

**Description**
Manages assessment definitions (technical, psychometric, language, role-play), assignment to candidates, result capture and pass thresholds. Ensures assessments are job-related and applied uniformly to comparable candidates, with results feeding the selection scorecard.

**Covers:** 4.12
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

- [ ] Given an assessment type, when configured, then scoring scale, pass threshold and job-relevance are defined.
- [ ] Given a candidate, when assigned an assessment, then result and pass/fail are captured against the threshold.
- [ ] Given comparable candidates, when assessed, then the same assessment set is applied uniformly.
- [ ] Given assessment results, when available, then they feed the consolidated selection score.
- [ ] Given any assessment record, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `assessment` + `candidate_assessment` entities + migration.
- [ ] Backend: result-capture + threshold evaluation service.
- [ ] Frontend: assessment assignment and result screen.
- [ ] Rules/Config: assessment catalogue and thresholds per role family.
- [ ] Alerts/Workflow: notify on assessment completion/failure.
- [ ] Tests: unit (threshold logic) + integration (score feed).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
