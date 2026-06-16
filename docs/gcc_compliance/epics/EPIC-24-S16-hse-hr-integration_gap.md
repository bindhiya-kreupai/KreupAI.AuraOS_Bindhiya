# Gap Analysis: EPIC-24-S16 — HSE & HR integration

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** HSE to integrate with HR data and downstream modules, **so that** training, PPE, injuries, competencies and roles stay synchronized across the platform.

**Description**
Provide the integration layer connecting HSE to HR records (employee/role/site), payroll (injury leave), social insurance (GOSI claims), separation/EOSB (injury/death) and benefits (PPE), via the event bus, ensuring single-source-of-truth and consistent audit.

**Covers:** 24.22
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given an HR event (hire/transfer/role change/separation), then HSE re-evaluates required training/PPE/roles for the worker.
- [ ] Given a work-injury leave, then it posts to payroll/leave with correct treatment.
- [ ] Given an HSE competency/PPE gap, then it is visible on the employee HR record.
- [ ] Given a separation due to injury/death, then HSE data flows to EOSB/final settlement.
- [ ] Given any integration event, then it is audit-logged and reconcilable.

## Implementation Tasks From Backlog

- [ ] Backend: HSE integration service + event handlers on the bus
- [ ] Backend: employee-record HSE-status projection
- [ ] Frontend: HSE summary on employee profile
- [ ] Rules/Config: event→HSE-action mappings
- [ ] Tests: integration (HR/payroll/GOSI/EOSB events)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
