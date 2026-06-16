# Gap Analysis: EPIC-33-S14 — HR forms KPIs & dashboard

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3

**Description**
Surfaces forms KPIs to the analytics dashboard (EPIC-31): submission volume by form/group, average approval cycle time, SLA-breach rate, rejection rate, and write-back success rate, sliceable by entity/country/department.

**Covers:** 33.42
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, then submission volume and average cycle time per form group are shown.
- [ ] Given SLAs, then SLA-breach and rejection rates are displayed with drill-down to offending submissions.
- [ ] Given integrations, then write-back success rate is shown and failures are listed.
- [ ] Given filters, then KPIs slice by entity, country and department.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation queries/materialized views over submissions.
- [ ] Backend: dashboard API feeding EPIC-31.
- [ ] Frontend: forms KPI widgets with drill-down.
- [ ] Rules/Config: SLA targets per form group.
- [ ] Tests: integration (KPI accuracy vs source).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
