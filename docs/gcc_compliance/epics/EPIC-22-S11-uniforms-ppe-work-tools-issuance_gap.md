# Gap Analysis: EPIC-22-S11 — Uniforms, PPE & work tools issuance

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** HR Admin, **I want** to manage issuance of uniforms, PPE and work tools, **so that** mandatory PPE is provided per role, replacements are tracked, and items are recovered/valued on exit.

**Description**
Track PPE/uniform/tool catalogues, role-based mandatory PPE matrices, issuance with sizes/quantities, replacement cycles, and recovery on separation — linking to HSE PPE requirements (EPIC-24).

**Covers:** 22.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/app/(modules)/benefits/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a role with mandatory PPE, when the employee is onboarded, then a PPE issuance task is created and onboarding cannot complete until issued.
- [ ] Given an issuance, then item, size, quantity, condition and issue date are recorded against the employee.
- [ ] Given a replacement cycle, when due (e.g. safety boots every 12 months), then a replacement alert is raised.
- [ ] Given separation, then recoverable items are listed in exit clearance with value for non-return.
- [ ] Given any issuance/recovery, then it is audit-logged and synced with the HSE PPE register.

## Implementation Tasks From Backlog

- [ ] Backend: `ppe_item`, `ppe_role_matrix`, `ppe_issuance` schema
- [ ] Backend: mandatory-PPE onboarding trigger + replacement-cycle job
- [ ] Frontend: PPE/uniform issuance screen + employee acknowledgement
- [ ] Rules/Config: role→PPE matrix and replacement intervals
- [ ] Alerts/Workflow: issuance/replacement alerts; exit recovery
- [ ] Tests: e2e (onboarding PPE block) + unit (replacement cycle)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
