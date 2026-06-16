# Gap Analysis: EPIC-24-S10 — Work injury handling & GOSI/social-insurance linkage

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** to handle work injuries end-to-end including authority/GOSI occupational-injury linkage, **so that** medical treatment, sick leave, compensation and claims are managed and evidenced.

**Description**
Manage work-injury cases from an incident: medical treatment, work-injury sick leave, fitness-to-return, disability assessment, and linkage to GOSI occupational-hazard branch / authority injury reporting and to separation/EOSB for death or permanent disability.

**Covers:** 24.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/gosi.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx
- apps/web/src/app/api/compliance/gosi/route.ts
- apps/web/src/app/api/v1/compliance/gosi/calculate/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a work injury, when opened from an incident, then medical records, injury leave and treatment are tracked with confidentiality.
- [ ] Given an occupational injury in KSA, then a GOSI occupational-hazard claim record is created and notification timeline enforced.
- [ ] Given a return-to-work, when fitness is assessed, then restrictions/modified duties are recorded.
- [ ] Given death in service or permanent disability, then it links to EPIC-27/EPIC-28 for settlement and to life/GPA claims.
- [ ] Given any injury record/action, then it is audit-logged with sensitive medical data masked.

## Implementation Tasks From Backlog

- [ ] Backend: `work_injury`, `injury_leave`, `gosi_injury_claim` schema
- [ ] Backend: claim/notification + return-to-work service; separation/EOSB feed
- [ ] Frontend: work-injury case management screen
- [ ] Rules/Config: occupational-injury notification rules per country (GOSI etc.)
- [ ] Alerts/Workflow: claim-timeline alerts; settlement linkage
- [ ] Tests: integration (GOSI/EOSB feed) + unit (timeline)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
