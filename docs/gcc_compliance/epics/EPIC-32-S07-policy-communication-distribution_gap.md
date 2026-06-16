# Gap Analysis: EPIC-32-S07 — Policy communication & distribution

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5

**Description**
Builds the communication layer that fires on publish: targeted notifications, a self-service "Policies" hub showing assigned/current policies and read status, and a reminder cadence for unread items. Supports translation versions and read-tracking distinct from formal acknowledgement.

**Covers:** 32.19
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

- [ ] Given a publish, when the campaign starts, then in-scope employees receive a notification with a deep link to the policy.
- [ ] Given the self-service hub, then an employee sees their assigned policies grouped by Read / Acknowledged / Overdue.
- [ ] Given an unread policy, then reminders are sent on a configurable cadence (e.g. day 0, 7, 14).
- [ ] Given a translated policy, then the employee is shown the version in their preferred language.
- [ ] Given communication events, then each send/open is logged to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_communication` campaign + recipient tracking entities.
- [ ] Backend: multi-channel dispatch service (in-app, email, SMS adapter).
- [ ] Frontend: employee self-service Policies hub.
- [ ] Rules/Config: reminder cadence and channel config per policy.
- [ ] Alerts/Workflow: reminder scheduler.
- [ ] Tests: integration (targeted dispatch, reminder cadence).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
