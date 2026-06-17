# Gap Analysis: EPIC-34-S22 — Alerts & notifications configuration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** to configure compliance alerts and notification channels, **so that** statutory deadlines and breaches are surfaced proactively.

**Description**
Configure alert rules (trigger condition, threshold, recipients, channel, frequency) for compliance events — visa/permit expiry (60/30/7 days), WPS/payroll deadlines, salary delay > window, contribution-filing due, nationalization at-risk — with escalation tiers and digest options.

**Covers:** 34.24
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an alert rule, when configured, then trigger condition, threshold, recipients and channel are defined.
- [ ] Given expiry alerts, when configured, then tiered thresholds (e.g., 60/30/7 days) fire to the right roles.
- [ ] Given a breach, when detected, then escalation to management occurs per configured tier.
- [ ] Given any alert-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `alert_rule`, `notification_channel` schemas + dispatch service
- [ ] Backend: tiered-threshold and escalation engine
- [ ] Frontend: alerts/notifications configuration screen
- [ ] Rules/Config: default compliance alert thresholds
- [ ] Tests: integration tests for tiered firing and escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
