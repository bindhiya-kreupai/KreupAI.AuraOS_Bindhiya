# Gap Analysis: EPIC-27-S20 — Sample Separation Request/Approval Form, Exit Clearance & Final Settlement Checklists

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers three configurable digital artefacts: a separation request/approval form (employee, type, last day, reason, approvals) that creates/updates a separation case; an exit-clearance checklist (department items, status, recoveries); and a final-settlement checklist (EOSB, leave encashment, dues, deductions, statutory limits, approval)—each filterable and exportable as branded templates.

**Covers:** 27.34, 27.35, 27.36
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/final-settlements/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/components/hr/ExitClearanceTracker.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the separation request form, when submitted, then it creates/updates a separation case with type-driven approvals.
- [ ] Given the exit-clearance checklist, when used, then it reflects live department clearance status and recoveries.
- [ ] Given the final-settlement checklist, when generated, then it lists all components with statutory-limit checks and approval sign-off.
- [ ] Given export, when requested, then branded PDF/Excel templates are produced.
- [ ] Given any artefact change, when saved, then versioning and audit apply.

## Implementation Tasks From Backlog

- [ ] Backend: form-definition entities + render/validate services linked to case/clearance/settlement.
- [ ] Frontend: form builder + request form, clearance checklist, settlement checklist renderers.
- [ ] Rules/Config: configurable fields/items per country/entity.
- [ ] Alerts/Workflow: submission/approval routing.
- [ ] Tests: unit (validation), integration (form→case/clearance/settlement + export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
