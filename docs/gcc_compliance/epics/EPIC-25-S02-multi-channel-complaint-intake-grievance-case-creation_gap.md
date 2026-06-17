# Gap Analysis: EPIC-25-S02 — Multi-Channel Complaint Intake & Grievance Case Creation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8

**Description**
Implements complaint channels (employee/manager portal, mobile app, email-to-case, anonymous hotline/web form) and a standardised intake process that creates a grievance case with a unique reference, captures the complainant, respondent(s), category, narrative, desired outcome and supporting attachments, and acknowledges receipt automatically.

**Covers:** 25.7, 25.8
**Acceptance criteria count:** 6 · **Task count:** 6

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

- [ ] Given an employee submits via any channel, when the case is created, then a unique reference (e.g. `GRV-{country}-{YYYY}-{seq}`) is generated and an acknowledgement is sent within the configured SLA.
- [ ] Given an anonymous submission, when created, then complainant identity is masked/omitted while the case remains actionable, with anonymity flagged on the record.
- [ ] Given an email-to-case, when received at the ER inbox, then a case is auto-created with the email body/attachments captured.
- [ ] Given a manager logs a grievance on behalf of an employee, when saved, then both the source manager and the affected employee are recorded.
- [ ] Given mandatory intake fields are missing, when submitting, then validation blocks submission with field-level errors.
- [ ] Given any intake event, when stored, then it is written to the audit trail with channel and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `grievance_case` (ref, channel, complainant_id nullable, anonymous_flag, respondent_ids, category, narrative, desired_outcome, status) + `grievance_attachment` entities/migrations.
- [ ] Backend: intake service with reference generator + email-to-case ingestion consumer on event bus.
- [ ] Frontend: employee/manager intake form, mobile-responsive, plus public anonymous web form.
- [ ] Rules/Config: per-country reference format and acknowledgement-SLA configuration.
- [ ] Alerts/Workflow: auto-acknowledgement notification + route to ER queue.
- [ ] Tests: integration (all channels create valid case), e2e (anonymous + email-to-case).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
