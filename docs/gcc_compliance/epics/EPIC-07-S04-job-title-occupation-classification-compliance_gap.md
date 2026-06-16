# Gap Analysis: EPIC-07-S04 — Job title & occupation classification compliance

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** job titles mapped to authority occupation classifications and validated against permits, **so that** the permit profession matches the actual role and avoids misclassification penalties.

**Description**
Maintain a mapping of internal job titles to official authority occupation codes (MOHRE profession list, KSA professional classification/Qiwa, etc.). Validate that the work-permit profession aligns with the employee's position and flag mismatches (a common cause of fines and renewal rejections), including profession-localization constraints.

**Covers:** 7.6
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a position, when an immigration profile is created, then the mapped authority occupation code is proposed and required.
- [ ] Given a work permit profession different from the mapped occupation, when detected, then a mismatch flag and corrective task are raised.
- [ ] Given a country with localized/restricted professions, when an expat is assigned such a profession, then the system warns/blocks per configuration.
- [ ] Given a job-title change, then occupation re-validation runs and permit-amendment need is flagged.
- [ ] Given audit, then occupation mapping decisions are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `occupation_mapping` (job_title_id, country_code, authority_code, restricted_flag) + validation service.
- [ ] Backend: mismatch detector + corrective-task generator.
- [ ] Frontend: occupation mapping admin + per-employee classification view.
- [ ] Rules/Config: authority profession catalogues + localized-profession rules.
- [ ] Alerts/Workflow: mismatch flag + amendment task.
- [ ] Tests: mapping + mismatch + restricted-profession tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
