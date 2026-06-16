# Gap Analysis: EPIC-32-S13 — Policy KPIs & dashboard

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3

**Description**
Surfaces policy KPIs — acknowledgement coverage %, mandatory-policy completion, policies overdue for review, active exceptions, average time-to-acknowledge — to the AuraOS analytics dashboard (EPIC-31), sliceable by entity, country and department.

**Covers:** 32.25
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

- [ ] Given the dashboard, then acknowledgement coverage % is shown overall and by entity/country/department.
- [ ] Given mandatory policies, then a completion KPI shows % of active employees with current acknowledgements.
- [ ] Given review currency, then count/% of policies overdue for review is displayed.
- [ ] Given drill-down, then clicking a KPI lists the underlying non-compliant employees/policies.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation queries/materialized views.
- [ ] Backend: dashboard API feeding EPIC-31.
- [ ] Frontend: policy KPI widgets with drill-down.
- [ ] Rules/Config: KPI thresholds (e.g. coverage target ≥95%).
- [ ] Tests: integration (KPI accuracy vs source data).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
