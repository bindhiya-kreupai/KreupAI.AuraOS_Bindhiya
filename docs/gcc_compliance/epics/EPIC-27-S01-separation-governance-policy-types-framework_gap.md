# Gap Analysis: EPIC-27-S01 — Separation Governance, Policy & Types Framework

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable separation governance framework, policy and separation-type catalogue, **so that** every exit follows a documented, country-aware standard with the right approvals.

**Description**
Establishes separation objectives, governance (approval authorities by type/seniority, segregation of duties), the separation policy lifecycle (publish/version/acknowledge), and the master catalogue of separation types (resignation, employer termination, mutual, redundancy, non-renewal, probation, abandonment, death in service) each mapped to its workflow, notice rules and EOSB treatment.

**Covers:** 27.1, 27.2, 27.3, 27.4, 27.5
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

- [ ] Given governance config, when set, then approval authorities per separation type/seniority are enforced via RBAC and workflow.
- [ ] Given the separation policy, when published, then employees/managers acknowledge the version with timestamp.
- [ ] Given a new separation case, when created, then a type from the catalogue is selected, driving workflow, notice and EOSB defaults.
- [ ] Given a country, when selected, then country-specific separation rules/objectives are surfaced.
- [ ] Given any governance/policy/catalogue change, when saved, then it is versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `separation_governance`, `separation_policy`, `separation_type` (workflow_key, notice_rule, eosb_treatment) entities/migrations.
- [ ] Backend: approval-authority + segregation guard.
- [ ] Frontend: governance config + policy acknowledgement screens.
- [ ] Rules/Config: per-country separation rules and type mappings.
- [ ] Alerts/Workflow: policy re-acknowledgement notifications.
- [ ] Tests: unit (authority routing), integration (policy versioning + audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
