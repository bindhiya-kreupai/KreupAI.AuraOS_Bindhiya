# Gap Analysis: EPIC-13-S11 — GOSI Audit Checklist & Risk Matrix

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5

**Description**
Provides a configurable GOSI audit checklist (registration timeliness, wage-base correctness, rate accuracy, submission timeliness, exit de-registration, reconciliation completeness) and a risk matrix (likelihood × impact) seeded with common GOSI risks (under-declaration, late registration, ghost members, late payment). Red-flags from runs auto-populate findings; risks are tracked with owners and mitigation status.

**Covers:** 13.14, 13.16
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- packages/@aura/database/src/extensions/audit-log.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit checklist, when an auditor runs it for a period, then each item is scored Pass/Fail/NA with evidence links to the underlying GOSI records.
- [ ] Given system red-flags (late registration, unreconciled variance, exited-still-listed), when present, then they auto-create checklist findings.
- [ ] Given the risk matrix, when configured, then each risk has likelihood, impact, score, owner, and mitigation status with a heatmap view.
- [ ] Given a failed checklist item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit checklist templates and risk entries.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_audit_checklist_template` + `gosi_audit_result` entities
- [ ] Backend: `gosi_risk` entity (likelihood, impact, score, owner, mitigation, status)
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: audit checklist runner + risk matrix heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-finding creation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
