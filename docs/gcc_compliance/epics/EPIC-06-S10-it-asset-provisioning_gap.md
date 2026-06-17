# Gap Analysis: EPIC-06-S10 — IT & asset provisioning

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**User story:** Line Manager, **I want** IT accounts and physical assets provisioned and acknowledged during onboarding, **so that** the new hire is productive on day one and asset accountability is recorded.

**Description**
Provision IT accounts (email, systems access by role) and issue assets (laptop, SIM, access card, PPE where applicable) via a provisioning checklist integrated with IT/asset systems. Each asset issue is acknowledged by the employee and recorded for later separation recovery.

**Covers:** 6.12
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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an activated employee, when provisioning starts, then role-based IT access and asset items are instantiated.
- [ ] Given an asset issued, when the employee acknowledges, then a signed/e-signed asset issue record is stored.
- [ ] Given pending provisioning at join date, then a flag and reminder are raised to IT/manager.
- [ ] Given RBAC, then only IT/admin roles can mark IT access granted.
- [ ] Given any issue/return action, then it is audit-logged and available to the separation module.

## Implementation Tasks From Backlog

- [ ] Backend: `asset_issue` (employee_id, asset_type, serial, issued_at, acknowledged, returned_at) + IT-access task entity.
- [ ] Backend: provisioning checklist service + integration hooks.
- [ ] Frontend: provisioning screen + employee asset-acknowledgement (ESS).
- [ ] Rules/Config: role-based access & asset bundles.
- [ ] Alerts/Workflow: provisioning reminders.
- [ ] Tests: acknowledgement + audit tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
