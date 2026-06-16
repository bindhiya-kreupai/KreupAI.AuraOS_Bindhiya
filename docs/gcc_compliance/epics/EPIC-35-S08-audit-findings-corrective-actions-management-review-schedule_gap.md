# Gap Analysis: EPIC-35-S08 — Audit findings, corrective actions & management review schedule

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** findings, corrective-action tracking and a management-review schedule, **so that** audit issues are remediated and reviewed by leadership on cadence.

**Description**
Capture audit findings from testing, raise corrective actions with owner/due date/severity, track them to closure, and schedule recurring management reviews of compliance status and open actions, with escalation for overdue items.

**Covers:** A1.20, A1.21
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601000000_add_mfa_audit_actions/migration.sql
- packages/@aura/scheduler/tsconfig.json
- packages/@aura/scheduler/tsup.config.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a failed test, when raised, then a finding and corrective action are created with owner, due date and severity.
- [ ] Given an open corrective action, when overdue, then it escalates to management.
- [ ] Given the management-review schedule, when due, then a review task with the open-actions pack is generated.
- [ ] Given finding/action updates, when made, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `audit_finding`, `corrective_action`, `management_review` schemas
- [ ] Backend: overdue-escalation and review-scheduling service
- [ ] Frontend: findings & corrective-action register + management-review board
- [ ] Alerts/Workflow: overdue-action and review-due alerts
- [ ] Tests: integration tests for escalation and review generation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
