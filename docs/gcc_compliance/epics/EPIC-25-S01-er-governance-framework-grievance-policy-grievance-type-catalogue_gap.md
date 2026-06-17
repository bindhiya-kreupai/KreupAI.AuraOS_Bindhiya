# Gap Analysis: EPIC-25-S01 — ER Governance Framework, Grievance Policy & Grievance Type Catalogue

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable ER governance framework with a published grievance policy and a catalogue of grievance types, **so that** every complaint is handled under a documented, country-aware standard that reflects GCC labour-complaint context.

**Description**
Establishes the foundation: roles/responsibilities (ER committee, HR Manager, investigator), the grievance policy lifecycle (publish, version, acknowledge), and a master catalogue of grievance types (pay/EOSB, working conditions, harassment, bullying, discrimination, retaliation, contract/visa, accommodation, manager conduct). Captures GCC labour-complaint context per country so the framework explains where employees can escalate (MOHRE, MHRSD/Qiwa, LMRA, PAM, ADLSA, Oman MOL).

**Covers:** 25.1, 25.2, 25.3, 25.4, 25.5, 25.6
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/grievance/types.ts
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/dashboard/core-hr/employee-database/types.ts
- apps/web/src/lib/services/employee/types.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a Compliance Officer configures the framework, when they define ER roles, then RBAC scopes for intake, triage, investigation and approval are created and enforced.
- [ ] Given a grievance policy is published, when an employee logs in, then they must acknowledge the current policy version and the acknowledgement is timestamped to the audit trail.
- [ ] Given the grievance type catalogue, when a new case is created, then the user must select a type and sub-type that drives default risk weighting and routing.
- [ ] Given a country is selected, when context is displayed, then the relevant external authority/escalation path (e.g. MOHRE for UAE, MHRSD for KSA, LMRA for Bahrain) is shown.
- [ ] Given any framework change, when saved, then a versioned audit record (who/what/when/before-after) is written.

## Implementation Tasks From Backlog

- [ ] Backend: `er_governance_config`, `grievance_policy` (version, status, effective_date), `grievance_type` (code, label, default_risk_weight, default_path) entities + migrations.
- [ ] Backend: policy acknowledgement service + RBAC scope registration for ER roles.
- [ ] Frontend: ER admin config screen + employee policy-acknowledgement screen.
- [ ] Rules/Config: per-country authority/escalation reference data for UAE/KSA/Bahrain/Qatar/Oman/Kuwait.
- [ ] Alerts/Workflow: notify employees on new/changed policy version requiring re-acknowledgement.
- [ ] Tests: unit (catalogue validation), integration (policy versioning + acknowledgement audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
