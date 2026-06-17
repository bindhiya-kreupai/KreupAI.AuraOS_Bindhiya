# Gap Analysis: EPIC-25-S12 — ER Audit Checklist & Risk Matrix

> **✅ SHIPPED 2026-06-17** — Theme C closure. Generic `ComplianceAuditChecklistItem` + `ComplianceRiskRegisterEntry` register with `domainCode` discriminator (ER · DISCIPLINARY · SEPARATION · EOSB · VISA_EXIT) + per-domain seeds + L × I → band auto-derivation. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers a configurable ER audit checklist (intake completeness, timeliness, confidentiality, investigation quality, retaliation controls) producing pass/fail with evidence links, plus an ER risk register/matrix (likelihood × impact) with auto-flagged red flags (SLA breaches, missing documentation, repeat respondents, anonymous-case neglect).

**Covers:** 25.24, 25.26
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

- [ ] Given the audit checklist, when run for a period/entity, then each item returns pass/fail/N-A with linked evidence and a score.
- [ ] Given the risk matrix, when populated, then risks are plotted on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered (e.g. SLA breach, missing investigation report), then items auto-raise to the risk register.
- [ ] Given a remediation owner/date, when assigned, then overdue remediation is escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `er_audit_checklist`, `er_audit_result`, `er_risk_register` entities + red-flag rule engine.
- [ ] Backend: scoring and residual-rating service.
- [ ] Frontend: checklist runner + risk-matrix heat grid.
- [ ] Rules/Config: configurable checklist items, red-flag thresholds and risk scales.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (scoring/red-flags), integration (checklist run + register linkage).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
