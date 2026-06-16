# Gap Analysis: EPIC-16-S18 — HRMS Emiratisation automation design (rule engine & events)

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** Emiratisation rules, schedules and cross-checks wired into the country rule engine and event bus, **so that** targets, checkpoints and detection run automatically and are fully configurable per country.

**Description**
The automation backbone: event-driven recalculation on hires/exits/payroll close/WPS submission/GPSSA updates, scheduled checkpoint and detection jobs, and all thresholds (targets, fines, tolerances, alert tiers) exposed in the country rule engine with effective dating and versioning. This makes targets/bands configurable per country (UAE here, extensible to others).

**Covers:** 16.20
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a hire/exit/payroll-close/WPS/GPSSA event, when published, then the relevant Emiratisation recalculation is triggered and audited.
- [ ] Given scheduled jobs, then checkpoint evaluation and fake-Emiratisation detection run on cadence with run logs.
- [ ] Given the rule engine, then targets, fine rates, tolerances and alert tiers are configurable per country and effective-dated.
- [ ] Given a config change, then it versions, is audited, and applies from its effective date without code change.
- [ ] Given a failed job, then it alerts System Admin and is retryable idempotently.

## Implementation Tasks From Backlog

- [ ] Backend: event consumers for hire/exit/payroll/WPS/GPSSA topics.
- [ ] Backend: scheduled job runners for checkpoints and detection with run-log table.
- [ ] Backend: rule-engine schema for Emiratisation parameters (effective-dated, versioned).
- [ ] Frontend: admin config UI for country Emiratisation parameters.
- [ ] Rules/Config: per-country parameter sets with validation.
- [ ] Tests: integration tests for event-driven recalculation and idempotent retries.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
