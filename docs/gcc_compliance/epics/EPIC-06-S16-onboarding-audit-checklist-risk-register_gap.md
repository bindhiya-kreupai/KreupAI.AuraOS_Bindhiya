# Gap Analysis: EPIC-06-S16 — Onboarding audit checklist & risk register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5

**Description**
Provide a configurable audit checklist (e.g. signed contract on file, master-data maker-checker evidence, social-insurance registered on time, mandatory medical cover, policy acknowledgements) and a risk register seeded with common onboarding risks (late registration, missing/expired documents, duplicate employees, first-pay errors, ghost activations) with likelihood/impact scoring and corrective actions.

**Covers:** 6.19, 6.20
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

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

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a sample of cases, when the audit checklist runs, then each control is auto-evaluated where data exists and flagged where evidence is missing.
- [ ] Given a detected red flag (e.g. activation without checker, registration past deadline), then a risk-register entry is created with severity.
- [ ] Given a risk entry, when a corrective action is assigned, then owner, due date and status are tracked to closure.
- [ ] Given the risk matrix, then likelihood × impact yields a rating and heat-map position.
- [ ] Given audit export, then checklist results and the risk register export for review.

## Implementation Tasks From Backlog

- [ ] Backend: `onboarding_audit_check` + `onboarding_risk_register` (risk, likelihood, impact, rating, action, status).
- [ ] Backend: auto-evaluation rules + red-flag detectors.
- [ ] Frontend: audit checklist runner + risk register/heat-map.
- [ ] Rules/Config: configurable controls + seeded common risks.
- [ ] Tests: red-flag detection + scoring tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
