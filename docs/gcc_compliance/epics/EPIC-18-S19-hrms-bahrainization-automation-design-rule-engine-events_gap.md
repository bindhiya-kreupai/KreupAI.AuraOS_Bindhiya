# Gap Analysis: EPIC-18-S19 — HRMS Bahrainization automation design (rule engine & events)

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** Bahrainization rules, schedules and cross-checks wired into the country rule engine and event bus, **so that** ratio, permit linkage and detection run automatically and are configurable per country.

**Description**
The automation backbone: event-driven recalculation on hires/exits/payroll close/SIO updates/permit requests, scheduled detection and certificate-expiry jobs, and all parameters (targets, denominator rules, counting-eligibility thresholds, tolerances, permit-quota rules, alert tiers) exposed in the country rule engine with effective dating and versioning, making targets/ratios configurable per country.

**Covers:** 18.22
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

- [ ] Given a hire/exit/payroll-close/SIO/permit event, when published, then the relevant Bahrainization recalculation triggers and is audited.
- [ ] Given scheduled jobs, then artificial-Bahrainization detection and certificate-expiry checks run on cadence with run logs.
- [ ] Given the rule engine, then targets, denominator/eligibility rules, tolerances, permit-quota rules and alert tiers are configurable per country and effective-dated.
- [ ] Given a config change, then it versions, is audited and applies from its effective date without code change.
- [ ] Given a failed job, then it alerts System Admin and is retryable idempotently.

## Implementation Tasks From Backlog

- [ ] Backend: event consumers for hire/exit/payroll/SIO/permit topics.
- [ ] Backend: scheduled job runners for detection and certificate expiry with run-log table.
- [ ] Backend: rule-engine schema for Bahrainization parameters (effective-dated, versioned).
- [ ] Frontend: admin config UI for country Bahrainization parameters.
- [ ] Rules/Config: per-country parameter sets with validation.
- [ ] Tests: integration tests for event-driven recalculation and idempotent retries.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
