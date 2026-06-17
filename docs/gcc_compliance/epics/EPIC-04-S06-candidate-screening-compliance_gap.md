# Gap Analysis: EPIC-04-S06 — Candidate screening compliance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** structured, criteria-based candidate screening, **so that** shortlisting is consistent, job-related and free of prohibited criteria.

**Description**
Implements criteria-based screening against the approved JD: mandatory vs preferred requirements, knockout questions and a scored shortlist. Prohibited screening factors (age, gender, marital status, nationality unless lawful) are excluded from scoring, and rejection reasons are constrained to job-related, defensible categories.

**Covers:** 4.9
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/dashboard/recruitment/candidate-screening/page.test.tsx
- apps/web/src/app/dashboard/recruitment/candidate-screening/page.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a JD, when screening is configured, then criteria derive from JD requirements with weightings.
- [ ] Given a candidate, when screened, then a job-related score and pass/fail against knockouts are produced.
- [ ] Given a rejection, when recorded, then a reason from an approved, non-discriminatory list is mandatory.
- [ ] Given prohibited factors, when present in data, then they are excluded from scoring and flagged.
- [ ] Given any screening decision, when made, then it is audit-logged with the scoring basis.

## Implementation Tasks From Backlog

- [ ] Backend: `screening_criteria` + `candidate_screening` entities + migration.
- [ ] Backend: scoring + knockout evaluation service.
- [ ] Frontend: screening console with scored shortlist.
- [ ] Rules/Config: prohibited-factor list and approved rejection-reason catalogue.
- [ ] Alerts/Workflow: notify recruiter on shortlist completion.
- [ ] Tests: unit (scoring/knockouts) + integration (prohibited-factor exclusion).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
