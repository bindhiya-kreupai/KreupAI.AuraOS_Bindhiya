# Gap Analysis: EPIC-16-S15 — Emiratisation audit checklist & red-flag controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 3

**Description**
A digital, configurable checklist covering target accuracy, denominator correctness, GPSSA/WPS/payroll evidence completeness, onboarding controls and fake-Emiratisation flags, with auto-evaluated items pulling live data and manual sign-off items.

**Covers:** 16.17
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/compliance/nitaqat/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an audit cycle, when the checklist runs, then auto-evaluated items (e.g., "every counted national has GPSSA + WPS evidence") return pass/fail with drill-down.
- [ ] Given a failed control, when raised, then a corrective action is created and tracked to closure.
- [ ] Given manual items, then auditors record outcome, comments and evidence.
- [ ] Given completion, then a signed checklist is archived in the evidence pack.
- [ ] Given config, then checklist items and thresholds are editable per country.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_audit_checklist` + `checklist_item` entities with auto/manual evaluation flags.
- [ ] Backend: auto-evaluation service binding items to live data signals.
- [ ] Frontend: checklist runner with pass/fail and sign-off.
- [ ] Alerts/Workflow: corrective-action creation on failure.
- [ ] Tests: integration tests for auto-evaluated items.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
