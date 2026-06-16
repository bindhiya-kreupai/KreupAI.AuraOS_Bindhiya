# Gap Analysis: EPIC-25-S11 — Labour Authority Complaint Tracking

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to track external labour-authority complaints linked to internal grievances, **so that** the employer responds within authority deadlines and maintains a defensible position file.

**Description**
Records complaints escalated to or filed with labour authorities (MOHRE/labour court UAE, MHRSD/labour office KSA, LMRA/MOL Bahrain, ADLSA Qatar, Oman MOL, PAM Kuwait), tracks hearing dates, required submissions, internal linkage, response deadlines and outcomes/settlements, ensuring the internal case file supports the authority response.

**Covers:** 25.22
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

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an authority complaint, when logged, then the authority, jurisdiction, reference, filing date and linked internal grievance are captured.
- [ ] Given an authority deadline/hearing, when set, then reminders fire at configurable lead times (e.g. 7/3/1 days).
- [ ] Given a country is selected, when displayed, then the correct authority and process metadata are shown.
- [ ] Given an outcome/settlement, when recorded, then it links to final settlement/EOSB impact where relevant.
- [ ] Given any authority-case event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `authority_complaint` (authority, jurisdiction, ref, filing_date, hearings[], deadlines[], outcome) + internal linkage.
- [ ] Backend: deadline/hearing reminder scheduler.
- [ ] Frontend: authority-complaint register and case detail.
- [ ] Rules/Config: per-country authority list, process steps and reminder lead times.
- [ ] Alerts/Workflow: deadline/hearing reminders to Compliance/PRO.
- [ ] Tests: integration (reminders + linkage), unit (country metadata).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
