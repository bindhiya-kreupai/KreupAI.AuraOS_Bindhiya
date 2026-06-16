# Gap Analysis: EPIC-35-S09 — Compliance calendar automation

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** end-to-end calendar automation, **so that** tasks roll forward, reassign and escalate without manual scheduling.

**Description**
Implement the AuraOS calendar automation: auto-roll recurring tasks each period, auto-assign by role/entity, auto-escalate overdue tasks up the chain, auto-close on evidence, and re-derive dates on holiday-calendar or rule changes — event-driven and configurable per entity.

**Covers:** A1.22
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/e2e/leave/leave-calendar.e2e.test.ts
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/calendar/gregorian/page.tsx
- apps/web/src/app/(modules)/leave/calendar/hijri/page.tsx
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/calendar/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a new period, when reached, then recurring tasks auto-generate and auto-assign without manual action.
- [ ] Given an overdue task, when detected, then it auto-escalates per the configured tier.
- [ ] Given a holiday-calendar or rule change, when published, then affected future task dates re-derive automatically.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: calendar orchestrator (roll-forward, assignment, escalation, auto-close) on event bus
- [ ] Backend: date re-derivation on calendar/rule change events
- [ ] Frontend: calendar automation configuration console
- [ ] Alerts/Workflow: auto-escalation notifications
- [ ] Tests: e2e test of roll-forward, escalation and date re-derivation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
