# Gap Analysis: EPIC-32-S14 — HRMS policy automation design & monthly compliance pack

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** the policy automation wired end-to-end and a one-click monthly compliance pack, **so that** policy governance runs without manual chasing and produces signed monthly evidence.

**Description**
Documents and implements the automation flows (hire → ack tasks, republish → re-ack, review-due → draft, exception expiry → revert) and assembles the Monthly Policy Compliance Pack: register snapshot, acknowledgement coverage, exceptions, overdue reviews, red-flags, and a management certificate for sign-off and archival.

**Covers:** 32.27, 32.28
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given the automation flows, then onboarding, republish, review-due and exception-expiry events trigger their downstream actions without manual intervention.
- [ ] Given month-end, when the pack is generated, then it compiles register, acknowledgement coverage, exception register, overdue reviews and red-flags into one document.
- [ ] Given the pack, then a management certificate is included for e-signature and the signed pack is archived to the document store with retention.
- [ ] Given regeneration, then the pack is reproducible for any prior period with point-in-time data.

## Implementation Tasks From Backlog

- [ ] Backend: event-driven automation handlers (hire/republish/review/expiry) on the event bus.
- [ ] Backend: monthly pack assembler + PDF export.
- [ ] Frontend: pack generation screen + certificate sign-off.
- [ ] Rules/Config: pack contents and certificate template per entity.
- [ ] Alerts/Workflow: month-end pack-due reminder.
- [ ] Tests: integration (event triggers), e2e (pack generation + sign-off + archive).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
