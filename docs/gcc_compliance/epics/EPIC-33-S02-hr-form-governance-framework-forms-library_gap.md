# Gap Analysis: EPIC-33-S02 — HR form governance framework & forms library

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a governed forms library with ownership, categories, version control and a publish-approval workflow, **so that** only approved, current forms are in use and obsolete forms are retired.

**Description**
Adds governance over the engine: a central forms library organised by category/lifecycle stage, with each form having an owner, approver, retention class, and publish workflow (draft → review → approved → published → retired). Provides the searchable catalogue users launch forms from and enforces that no form is usable unless published.

**Covers:** 33.3, 33.4
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a form, when it is submitted for publishing, then it routes to the designated approver and cannot be launched by users until approved (maker-checker: author ≠ approver).
- [ ] Given the library, then forms are browsable/searchable by category (Recruitment, Employment, Payroll, Leave/Attendance, Benefits, Employee Relations, Separation, Compliance) and lifecycle status.
- [ ] Given a retired form, then it is hidden from launch but its prior submissions remain accessible read-only.
- [ ] Given governance, then each form records owner, approver, version, effective date and retention class, all audited.
- [ ] Given RBAC, then form visibility/launch can be restricted by role, entity and country.

## Implementation Tasks From Backlog

- [ ] Backend: governance fields on `form_definition` + `form_category` taxonomy + publish workflow service.
- [ ] Backend: forms catalogue/search API with RBAC scoping.
- [ ] Frontend: Forms Library catalogue (employee/manager/admin views) + launch.
- [ ] Rules/Config: category taxonomy and per-form access rules.
- [ ] Alerts/Workflow: publish-approval routing.
- [ ] Tests: integration (publish gate, maker-checker, retire behaviour).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
