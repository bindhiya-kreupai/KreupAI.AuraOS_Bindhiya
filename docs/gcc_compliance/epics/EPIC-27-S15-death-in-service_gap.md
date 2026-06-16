# Gap Analysis: EPIC-27-S15 — Death in Service

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5

**Description**
Handles death-in-service with elevated sensitivity: record event, manage beneficiary/heir identification and documentation, compute EOSB and any death-in-service insurance/benefit, process final settlement to the estate/beneficiaries per country/Sharia-estate rules where applicable, and run all statutory and access closures.

**Covers:** 27.26
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

- [ ] Given a death-in-service event, when recorded, then the case follows a restricted, compassionate workflow with required documentation (death certificate, beneficiary proof).
- [ ] Given beneficiary/heir details, when captured, then final settlement and any death-in-service insurance are computed and directed to the correct payee per country rules.
- [ ] Given EOSB on death, when computed, then the correct (often full-rate) treatment per country is applied via EPIC-28.
- [ ] Given closures, when run, then visa/dependent, social insurance, benefits and IT access closures execute appropriately.
- [ ] Given any death-in-service action, when processed, then it is audited with restricted access.

## Implementation Tasks From Backlog

- [ ] Backend: `death_in_service` (beneficiaries, documents, insurance) entity + beneficiary-settlement service.
- [ ] Backend: EOSB/insurance computation linkage + closure orchestration.
- [ ] Frontend: restricted death-in-service workspace.
- [ ] Rules/Config: per-country beneficiary/estate and death-EOSB rules.
- [ ] Alerts/Workflow: compassionate handling routing + closure tasks.
- [ ] Tests: integration (beneficiary settlement + closures), unit (EOSB-on-death rule).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
