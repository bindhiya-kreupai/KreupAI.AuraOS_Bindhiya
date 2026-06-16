# Gap Analysis: EPIC-03-S08 — Workforce risk management & risk register

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a workforce risk register with scoring, **so that** localization, attrition, visa-expiry concentration and key-person risks are tracked and mitigated.

**Description**
Provides a configurable workforce-risk register capturing risk type, likelihood, impact, owner, mitigation and status, with auto-generated risks fed from other modules (nationalization gap, succession gap, high attrition, expiring-permit concentration). Renders a risk matrix and drives mitigation tracking.

**Covers:** 3.10
**Acceptance criteria count:** 5 · **Task count:** 6

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

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a workforce risk, when logged, then type, likelihood, impact, score, owner and mitigation are captured.
- [ ] Given source signals (gap/attrition/expiry), when thresholds are crossed, then risks are auto-raised into the register.
- [ ] Given a risk score, when computed, then it maps to a configurable likelihood×impact matrix band.
- [ ] Given a mitigation, when overdue, then an alert is sent to the risk owner.
- [ ] Given any risk change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `workforce_risk` entity (type, likelihood, impact, score, owner, mitigation, status) + migration.
- [ ] Backend: auto-risk generation service from module signals.
- [ ] Frontend: risk register + likelihood×impact heat matrix.
- [ ] Rules/Config: scoring bands and auto-raise thresholds per entity.
- [ ] Alerts/Workflow: overdue-mitigation alerts to owners.
- [ ] Tests: unit (scoring/banding) + integration (auto-raise from signals).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
