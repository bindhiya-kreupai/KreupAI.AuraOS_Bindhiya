# Gap Analysis: EPIC-33-S12 — HRMS forms automation design & module write-back framework

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** a configurable automation layer that maps approved forms to HRMS module write-backs and downstream triggers, **so that** approved forms update the right records and fire follow-on actions without manual re-keying.

**Description**
Formalises the automation design referenced across the chapter: a configurable mapping layer (form field → target entity field), event-bus triggers on approval/rejection, idempotent write-back, and rollback on failure. This is the integration backbone that makes the group forms "live" rather than just stored documents.

**Covers:** 33.40
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

- [ ] Given a form-to-entity mapping, when a form is approved, then the mapped fields write to the target module transactionally and idempotently.
- [ ] Given a write-back failure, then the form is flagged "pending integration" and retried, with no partial/duplicate updates.
- [ ] Given approval events, then configured downstream triggers fire on the event bus (e.g. joining form → onboarding tasks; resignation → clearance).
- [ ] Given the mapping config, then admins can define/adjust mappings without code, with validation against the target schema.
- [ ] Given every write-back, then the source submission and resulting record change are linked in the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: configurable mapping engine + idempotent write-back service + retry/rollback.
- [ ] Backend: event-bus publishers/consumers for form lifecycle events.
- [ ] Frontend: mapping configuration UI + integration-status monitor.
- [ ] Rules/Config: form-to-module mapping definitions.
- [ ] Alerts/Workflow: integration-failure alerts.
- [ ] Tests: integration (idempotency, rollback, trigger fan-out).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
