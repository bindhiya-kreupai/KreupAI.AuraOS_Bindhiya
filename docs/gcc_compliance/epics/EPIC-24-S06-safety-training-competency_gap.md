# Gap Analysis: EPIC-24-S06 — Safety training & competency

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** HSE Officer, **I want** to manage safety training and competency records, **so that** mandatory training is completed, certifications stay valid, and untrained workers are restricted from hazardous tasks.

**Description**
Manage safety-training catalogue, role-based mandatory-training matrices, scheduling, completion, certification validity and competency verification, integrated with HR records and gating permit/task assignment.

**Covers:** 24.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a role, when mandatory training is defined, then required courses and refresh intervals are assigned per worker.
- [ ] Given a training expiry, when 30 days out, then a renewal alert fires; when expired, the worker is flagged non-compliant.
- [ ] Given a hazardous task/permit, when the worker lacks valid required training, then assignment/permit is blocked.
- [ ] Given training completion, then certificate and validity are stored against the employee record.
- [ ] Given any training/competency change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `safety_course`, `training_matrix`, `training_record` schema with validity
- [ ] Backend: expiry + competency-gating service
- [ ] Frontend: training catalogue + matrix + employee competency view
- [ ] Rules/Config: mandatory courses + refresh intervals per role/country
- [ ] Alerts/Workflow: renewal alerts; task/permit gating
- [ ] Tests: unit (expiry) + integration (permit gating)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
