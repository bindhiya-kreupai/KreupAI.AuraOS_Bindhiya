# Gap Analysis: EPIC-04-S16 — Recruitment audit checklist & common-risk register

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Internal Auditor, **I want** a recruitment audit checklist and a common-risk register with red-flags, **so that** I can verify governance and capture recruitment risks and findings.

**Description**
Implements the recruitment audit checklist as a configurable digital checklist (pass/fail/N-A + evidence) and codifies the chapter's common recruitment risks (discriminatory JD, missing BGV, ineligible hire, candidate-paid agency fee, weak nationalization progress, consent/retention gaps) into an auto-run red-flag and risk register with likelihood×impact scoring and corrective-action tracking.

**Covers:** 4.20, 4.21
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md
- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit checklist, when configured, then items are grouped by control area with evidence slots.
- [ ] Given red-flag rules, when run, then exceptions (no consent, BGV skipped, ineligible offer, expired agency) are listed with drill-down.
- [ ] Given the risk register, when populated, then each common risk has likelihood, impact, score, owner and mitigation.
- [ ] Given a checklist fail or red-flag, when raised, then a finding/corrective action with owner and due date is created.
- [ ] Given audit completion, when finalised, then a signed audit pack is exported and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `recruitment_audit_checklist`, `audit_finding`, `recruitment_risk` entities + migration.
- [ ] Backend: red-flag rule engine over recruitment data.
- [ ] Frontend: checklist runner + risk register + corrective-action tracker.
- [ ] Rules/Config: checklist templates, red-flag rules and risk scoring per entity.
- [ ] Alerts/Workflow: overdue-finding alerts; audit sign-off workflow.
- [ ] Tests: unit (red-flag rules/scoring) + e2e (checklist→finding→export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
