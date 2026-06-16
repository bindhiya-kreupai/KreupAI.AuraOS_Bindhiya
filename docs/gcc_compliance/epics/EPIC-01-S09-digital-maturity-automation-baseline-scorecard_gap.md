# Gap Analysis: EPIC-01-S09 — Digital maturity & automation baseline scorecard

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a digital-maturity scorecard tracking how much of HR compliance is automated vs.

**Description**
Captures the "future of HR compliance" and "digital transformation" themes as a measurable baseline: per compliance domain (payroll, WPS, social insurance, nationalization, immigration, records), record automation level and target, producing an overall maturity index.

**Covers:** 1.5, 1.6
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the scorecard, when configured, then each compliance domain has a current automation level and target.
- [ ] Given levels are set, then an overall maturity index and per-domain gap are computed.
- [ ] Given a domain below target, then it is flagged as an improvement priority.
- [ ] Given periodic updates, then prior scores are retained to show progress over time.
- [ ] Given RBAC, then Compliance Officer/Executive can view; only Compliance Officer/System Administrator can edit.
- [ ] Given any edit, then it is recorded in the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `DigitalMaturity` (domain, current_level, target_level, period, index) schema + migration.
- [ ] Backend: index/gap computation service with historical snapshots.
- [ ] Frontend: maturity scorecard screen with per-domain bars and trend.
- [ ] Rules/Config: configurable domains and maturity scale.
- [ ] Tests: unit tests for index/gap computation and history retention.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
