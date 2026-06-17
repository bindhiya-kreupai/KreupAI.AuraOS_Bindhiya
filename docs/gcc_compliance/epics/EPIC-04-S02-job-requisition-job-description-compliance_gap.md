# Gap Analysis: EPIC-04-S02 — Job requisition & job description compliance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** recruitment requisitions and JDs validated for compliance, **so that** only approved, funded, non-discriminatory roles are advertised.

**Description**
Links the recruitment requisition to the approved EPIC-03 manpower requisition and enforces JD compliance: mandatory fields (duties, grade, qualifications, localization flag), non-discriminatory language screening (no age/gender/nationality bias unless a lawful occupational requirement), and reusable JD templates with version control and approval before posting.

**Covers:** 4.4, 4.5
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/dashboard/recruitment/job-requisition/page.test.tsx
- apps/web/src/app/dashboard/recruitment/job-requisition/page.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a recruitment requisition, when created, then it must reference an approved EPIC-03 requisition or be blocked.
- [ ] Given a JD, when saved, then mandatory fields are validated and biased phrases (age limit, gender, nationality preference) are flagged unless justified as a bona fide requirement.
- [ ] Given a JD, when approved, then it is version-locked and only the approved version can be posted.
- [ ] Given a nationalization-reserved role, when the JD is built, then localization preference is reflected per country rules.
- [ ] Given any JD edit/approval, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `job_description` entity (caseId, duties, qualifications, gradeId, localizationFlag, version, status) + migration.
- [ ] Backend: JD compliance/bias-language validation service.
- [ ] Frontend: JD builder with template library and inline compliance flags.
- [ ] Rules/Config: biased-phrase dictionary and bona-fide exceptions per country.
- [ ] Alerts/Workflow: JD approval routing (preparer ≠ approver).
- [ ] Tests: unit (bias detection) + integration (requisition link enforcement).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
