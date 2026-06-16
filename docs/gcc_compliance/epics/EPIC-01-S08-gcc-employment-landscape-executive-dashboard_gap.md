# Gap Analysis: EPIC-01-S08 — GCC Employment Landscape executive dashboard

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Composes S02 country context, S07 KPIs, and S06 risk register into one executive view with country switcher and entity drill-down, giving the "big picture" the handbook's introduction sets up.

**Covers:** 1.1, 1.2, 1.4
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when opened, then it shows enabled countries, headcount, national % vs. target, and the top compliance risks per country.
- [ ] Given a country/entity selector, when changed, then all widgets re-scope accordingly.
- [ ] Given a high/critical risk exists, then it is highlighted with its rating.
- [ ] Given no data for a country, then widgets degrade gracefully.
- [ ] Given RBAC, then a user only sees countries/entities within their scope.
- [ ] Given a dashboard view, then it is exportable (PDF) for board reporting.

## Implementation Tasks From Backlog

- [ ] Backend: dashboard aggregation endpoint composing KPI, risk, and country-profile data.
- [ ] Frontend: landscape dashboard page with country switcher, KPI tiles, risk panel, export.
- [ ] Rules/Config: country/entity scoping applied to all widgets.
- [ ] Alerts/Workflow: deep-link from highlighted risks to the risk register.
- [ ] Tests: e2e for scoping, drill-down, and export.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
