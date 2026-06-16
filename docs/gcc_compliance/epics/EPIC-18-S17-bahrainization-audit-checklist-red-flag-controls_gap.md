# Gap Analysis: EPIC-18-S17 — Bahrainization audit checklist & red-flag controls

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 3

**Description**
A digital, configurable checklist covering denominator/ratio accuracy, counting-eligibility, SIO/payroll evidence completeness, onboarding controls and artificial-Bahrainization flags, with auto-evaluated and manual sign-off items.

**Covers:** 18.19
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

- [ ] Given an audit cycle, when the checklist runs, then auto-evaluated items (e.g., "every counted Bahraini has SIO + payroll evidence") return pass/fail with drill-down.
- [ ] Given a failed control, when raised, then a corrective action is created and tracked.
- [ ] Given manual items, then auditors record outcome, comments and evidence.
- [ ] Given completion, then a signed checklist is archived in the evidence pack.
- [ ] Given config, then items/thresholds are editable per country.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_audit_checklist` + `checklist_item` entities with auto/manual flags.
- [ ] Backend: auto-evaluation service binding to live signals.
- [ ] Frontend: checklist runner with pass/fail and sign-off.
- [ ] Alerts/Workflow: corrective-action creation on failure.
- [ ] Tests: integration tests for auto-evaluated items.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
