# Gap Analysis: EPIC-37-S03 — Red-flag rule engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a red-flag rule engine that auto-evaluates checklist items from live data, **so that** non-compliance is detected automatically rather than relying on manual review.

**Description**
Build the red-flag engine: configurable rules (condition over live AuraOS data + country-rule thresholds) bound to checklist items that auto-set an item to non-compliant and raise a severity-scored flag — e.g., visa/permit expiring < 30 days, WPS unsubmitted past window, salary delay > 15 days, GOSI wage mismatch, missing mandatory document, nationalization below target. Flags feed findings and certificate gating.

**Covers:** A3.7, A3.8, A3.9, A3.10, A3.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/dashboard/workflow-engine/audit-log/page.tsx
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a red-flag rule bound to an item, when a run executes, then the item auto-evaluates from live data and country thresholds.
- [ ] Given a breach (e.g., WPS past window, visa < 30 days, salary delay > 15 days), when detected, then a red flag is raised with severity and the item marked non-compliant.
- [ ] Given a flag, when raised, then it links to the source record and routes to the finding register.
- [ ] Given red-flag rules, when configured, then they are tenant-editable and country-aware.
- [ ] Given any flag, when raised or cleared, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `red_flag_rule`, `red_flag` schemas + evaluation engine over live data and rule engine
- [ ] Backend: severity scoring and source-record linkage
- [ ] Frontend: red-flag rule editor + flag review board
- [ ] Rules/Config: per-country red-flag thresholds
- [ ] Alerts/Workflow: critical red-flag alerts
- [ ] Tests: integration tests for threshold breaches per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
