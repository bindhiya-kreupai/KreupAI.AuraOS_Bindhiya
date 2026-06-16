# Gap Analysis: EPIC-34-S23 — Audit trail configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5

**Description**
Configure the audit-trail framework: which entities/fields are audited, before/after values, actor, timestamp, reason, immutability/tamper-evidence, retention, and queryable audit views — applied platform-wide including config changes themselves.

**Covers:** 34.25
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/dashboard/compliance/audit-trail/page.tsx
- apps/web/src/app/dashboard/user-management/audit-trail/page.tsx
- apps/web/src/lib/services/audit/audit-trail-service.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/security/dependency-audit.test.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an audited action, when performed, then actor, timestamp, before/after values and reason are captured immutably.
- [ ] Given audit scope, when configured, then sensitive/statutory fields are always audited and cannot be excluded.
- [ ] Given an auditor, when querying, then they can filter audit records by entity, user, date and change type.
- [ ] Given configuration changes, when made, then they are themselves audited.

## Implementation Tasks From Backlog

- [ ] Backend: `audit_log` schema with before/after, actor, reason + tamper-evidence (hash chain)
- [ ] Backend: audit-scope configuration and enforcement
- [ ] Frontend: audit-trail query/viewer screen
- [ ] Rules/Config: mandatory-audit field set
- [ ] Tests: integration tests for immutability and mandatory-scope capture

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
