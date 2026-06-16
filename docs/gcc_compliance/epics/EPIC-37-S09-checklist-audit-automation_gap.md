# Gap Analysis: EPIC-37-S09 — Checklist & audit automation

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** checklist and audit automation, **so that** runs schedule, auto-evaluate, escalate and roll forward with exception-only intervention.

**Description**
Implement the AuraOS checklist/audit automation across A3–A6: on schedule (from the compliance calendar) or on trigger events, auto-instantiate runs, auto-evaluate red-flag items from live data, auto-raise exceptions/findings, escalate overdue items, and roll forward recurring runs — event-driven and configurable per entity.

**Covers:** A3.22, A4.23, A5.21, A6.26
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts
- apps/web/src/app/api/v1/compliance/audit/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a scheduled or triggered cycle, when due, then the relevant checklist/audit runs auto-instantiate and red-flag items auto-evaluate.
- [ ] Given red flags, when raised, then exceptions/findings auto-create and route to owners.
- [ ] Given overdue runs/items, when detected, then they auto-escalate per configured tier.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: checklist/audit orchestrator on the event bus consuming calendar/trigger events
- [ ] Backend: auto-evaluation + exception/finding creation pipeline
- [ ] Frontend: checklist/audit automation configuration console
- [ ] Alerts/Workflow: auto-escalation notifications
- [ ] Tests: e2e test of automated run → red-flag → finding cycle

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
