# Gap Analysis: EPIC-24-S05 — PPE compliance enforcement

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** HSE Officer, **I want** to define and enforce PPE requirements per role/hazard and verify issuance/usage, **so that** mandatory PPE is in place and gaps are flagged.

**Description**
Define role/hazard→PPE requirement matrices (driven by risk assessments), verify issuance against the EPIC-22 PPE issuance records, and track PPE compliance (inspection, condition, replacement) and non-compliance.

**Covers:** 24.10
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a role/hazard, when PPE is defined, then the required PPE set is derived from the risk assessment and applicable standards.
- [ ] Given a worker on a hazardous task, when PPE issuance is checked against EPIC-22 records, then missing/expired PPE is flagged and may block task/permit start.
- [ ] Given a PPE inspection, when a defect is found, then a replacement/corrective action is created.
- [ ] Given any PPE requirement/compliance change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ppe_requirement` (role/hazard) schema; compliance-check service against EPIC-22
- [ ] Backend: PPE-gap + inspection service
- [ ] Frontend: PPE requirement matrix + compliance view
- [ ] Rules/Config: hazard→PPE rules per country/standard
- [ ] Alerts/Workflow: PPE-gap alerts; permit-start block
- [ ] Tests: integration (EPIC-22 link + permit gating)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
