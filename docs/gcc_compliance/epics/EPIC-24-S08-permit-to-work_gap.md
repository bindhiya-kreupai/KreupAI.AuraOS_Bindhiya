# Gap Analysis: EPIC-24-S08 — Permit-to-work

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**User story:** HSE Officer, **I want** an electronic permit-to-work system for high-risk activities, **so that** hot work, confined space, work at height, electrical and excavation are authorized with controls before work starts.

**Description**
Manage permit lifecycle (request → risk/control verification → issue → extend → close) for high-risk activities with mandatory pre-conditions (risk assessment present, PPE/training verified, isolations confirmed), validity windows and maker-checker authorization.

**Covers:** 24.13
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

- [ ] Given a permit request, when submitted, then permit type, location, validity window and required controls are captured.
- [ ] Given issuance, when authorized, then it enforces preconditions (linked risk assessment approved, workers' training/PPE valid) and applies maker-checker (issuer ≠ requester).
- [ ] Given an expired or revoked permit, then associated work is flagged as unauthorized and an alert is raised.
- [ ] Given concurrent conflicting permits (e.g. hot work near confined space), then a conflict is flagged for review.
- [ ] Given any permit action, then it is audit-logged with timestamps and authorizers.

## Implementation Tasks From Backlog

- [ ] Backend: `work_permit`, `permit_control`, `permit_authorization` schema with lifecycle
- [ ] Backend: precondition-validation + conflict-detection service
- [ ] Frontend: permit request/issue/close workflow screens
- [ ] Rules/Config: permit types + required controls per activity/country
- [ ] Alerts/Workflow: maker-checker; expiry/conflict alerts
- [ ] Tests: e2e (request → issue → close) + unit (precondition/conflict)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
