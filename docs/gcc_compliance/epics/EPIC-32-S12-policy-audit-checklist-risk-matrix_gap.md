# Gap Analysis: EPIC-32-S12 — Policy audit checklist & risk matrix

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers a configurable audit checklist (existence, approval, version currency, acknowledgement coverage, addendum completeness) and a risk matrix scoring likelihood × impact with auto red-flags (e.g. mandatory policy unacknowledged, overdue review, missing country addendum) feeding a risk register.

**Covers:** 32.24, 32.26
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given the audit checklist, when an auditor runs it for an entity, then each item returns pass/fail with evidence links.
- [ ] Given red-flag rules, then an unacknowledged mandatory policy, overdue review, or missing required country addendum auto-raises a risk entry.
- [ ] Given the risk matrix, then each risk is scored likelihood × impact and placed in a heatmap.
- [ ] Given a finding, then a corrective action with owner and due date can be raised and tracked.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_audit_checklist`, `policy_risk` entities + red-flag rule engine.
- [ ] Backend: checklist evaluation service + risk scoring.
- [ ] Frontend: audit checklist runner + risk heatmap.
- [ ] Rules/Config: configurable red-flag thresholds.
- [ ] Alerts/Workflow: corrective-action assignment.
- [ ] Tests: integration (red-flag generation, scoring).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
