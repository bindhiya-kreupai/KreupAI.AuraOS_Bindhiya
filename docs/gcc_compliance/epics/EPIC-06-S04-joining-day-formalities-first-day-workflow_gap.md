# Gap Analysis: EPIC-06-S04 — Joining day formalities & first-day workflow

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Joining-day stage covers original-document verification, signed employment contract receipt, ID/biometric capture, induction attendance, workspace handover and reporting-manager confirmation. Completion stamps the actual join date, which becomes the service-period anchor for EOSB.

**Covers:** 6.6
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given joining day, when HR verifies originals against pre-joining copies, then each item is marked verified/discrepant with notes.
- [ ] Given the contract is signed, when uploaded and confirmed, then the signed contract is linked to the employee file as a mandatory record.
- [ ] Given completion of all formalities, when HR confirms, then the actual join date is recorded and locked (editable only via maker-checker correction).
- [ ] Given the Line Manager, then a "reported on date" confirmation is captured.
- [ ] Given any discrepancy (e.g. visa/Iqama mismatch), then the case is flagged and master-data activation is blocked.
- [ ] Given all actions, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `joining_day_record` (case_id, actual_join_date, contract_doc_id, biometric_status, induction_status, manager_confirmed).
- [ ] Backend: verification + join-date locking service.
- [ ] Frontend: joining-day formalities screen with verify/flag actions.
- [ ] Rules/Config: per-entity required joining-day items.
- [ ] Alerts/Workflow: manager confirmation request.
- [ ] Tests: join-date lock + discrepancy gating tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
