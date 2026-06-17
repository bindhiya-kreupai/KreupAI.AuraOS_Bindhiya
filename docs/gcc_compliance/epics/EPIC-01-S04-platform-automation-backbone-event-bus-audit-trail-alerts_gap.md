# Gap Analysis: EPIC-01-S04 — Platform automation backbone (event bus, audit trail, alerts)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**User story:** System Administrator, **I want** a shared event bus, immutable audit trail, and alert/notification service, **so that** every compliance module automates evidence capture and expiry/deadline alerting on a common backbone rather than re-implementing it.

**Description**
Realises the handbook's digital-transformation theme as concrete platform plumbing: domain events (e.g., visa expiry, salary delay), an append-only audit log, and a configurable alerting engine supporting tiered reminders (e.g., 60/30/7 days). All later epics depend on this.

**Covers:** 1.6
**Acceptance criteria count:** 6 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/audit-trail/page.tsx
- apps/web/src/app/dashboard/user-management/audit-trail/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/services/audit/audit-trail-service.ts
- packages/@aura/events/tsconfig.json
- packages/@aura/events/tsup.config.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given any module publishes a domain event, when consumed, then delivery is at-least-once and traceable by correlation id.
- [ ] Given any create/update/delete on a compliance entity, then an immutable audit record (actor, action, entity, before/after, timestamp, tenant, entity-country) is written and cannot be edited or deleted.
- [ ] Given a configurable alert rule, when a date threshold is crossed (e.g., 60/30/7 days before an expiry), then notifications fire to the configured persona/channel exactly once per threshold.
- [ ] Given an alert rule, when an admin configures thresholds and recipients, then they are validated and country/entity-scopable.
- [ ] Given the audit log, when queried, then it is filterable by entity, actor, country, and date range and exportable.
- [ ] Given RBAC, then only Internal Auditor and System Administrator roles can read the full cross-tenant audit log.

## Implementation Tasks From Backlog

- [ ] Backend: event-bus abstraction (Kafka/RabbitMQ) with topic registry and correlation ids.
- [ ] Backend: `AuditLog` append-only table + write interceptor; `AlertRule`, `AlertInstance` schema + scheduler.
- [ ] Backend: notification dispatch service (email/in-app) with idempotent per-threshold firing.
- [ ] Frontend: alert-rule configuration screen and audit-log viewer with filters/export.
- [ ] Rules/Config: default reminder ladders (e.g., 60/30/7 days) as reusable templates.
- [ ] Alerts/Workflow: dead-letter handling and retry for failed notifications.
- [ ] Tests: integration tests for event delivery, audit immutability, and threshold-once firing.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
