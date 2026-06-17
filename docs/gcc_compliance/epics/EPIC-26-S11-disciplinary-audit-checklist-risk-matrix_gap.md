# Gap Analysis: EPIC-26-S11 — Disciplinary Audit Checklist & Risk Matrix

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers an audit checklist (investigation present, hearing held, evidence standard met, penalty within legal limit, consistency checked, documentation complete) with pass/fail and evidence links, plus a risk register/matrix (likelihood × impact) auto-flagging red flags (penalty without hearing, deduction over cap, disparate treatment, time-bar breach, dismissal without grounds).

**Covers:** 26.20, 26.22
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the checklist, when run for a period/entity, then each item returns pass/fail/N-A with evidence and a score.
- [ ] Given the risk matrix, when populated, then risks plot on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered, then items auto-raise to the risk register.
- [ ] Given remediation owners/dates, when assigned, then overdue items are escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_audit_checklist`, `disciplinary_audit_result`, `disciplinary_risk_register` + red-flag engine.
- [ ] Backend: scoring/residual-rating service.
- [ ] Frontend: checklist runner + risk heat grid.
- [ ] Rules/Config: configurable items, red-flag thresholds, risk scales.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (red flags/scoring), integration (checklist→register).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
