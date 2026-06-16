# Gap Analysis: EPIC-14-S13 — GPSSA Audit Checklist & Risk Matrix

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5

**Description**
Provides a configurable GPSSA audit checklist (registration timeliness, account-salary correctness, rate accuracy, submission timeliness, transfer continuity, exit de-registration, reconciliation completeness, Emiratisation linkage) and a risk matrix seeded with common GPSSA risks (non-registration of nationals, under-declaration, fake Emiratisation, late payment). System red-flags auto-populate findings; risks are tracked with owners and mitigation.

**Covers:** 14.15, 14.17
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given the checklist, when run for a period, then each item is scored Pass/Fail/NA with evidence links.
- [ ] Given system red-flags (late registration, unreconciled variance, fake-Emiratisation), when present, then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_audit_checklist_template` + `gpssa_audit_result` + `gpssa_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
