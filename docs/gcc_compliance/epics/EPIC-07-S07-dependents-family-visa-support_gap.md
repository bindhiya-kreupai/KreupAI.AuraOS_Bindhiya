# Gap Analysis: EPIC-07-S07 — Dependents & family visa support

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** to manage dependents and family-visa sponsorship linked to the employee, **so that** family residence, Emirates ID/Iqama and renewals are tracked and dependent on the employee's valid status.

**Description**
Register dependents (spouse, children, parents, domestic workers where applicable), capture their visas/IDs with issue/expiry, validate salary-threshold and document eligibility for family sponsorship, and link dependent validity to the sponsor's residence status (a sponsor cancellation impacts dependents). Dependents inherit the renewal/alert engine.

**Covers:** 7.9
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/app/dashboard/travel/visa-support/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given an employee, when a dependent is added, then relationship, documents and dependent visa/ID with dates are captured.
- [ ] Given family-sponsorship eligibility rules, when a dependent is sponsored, then salary threshold and required documents are validated per country.
- [ ] Given a sponsor's residence approaching expiry/cancellation, when detected, then dependent impact is surfaced and alerted.
- [ ] Given a dependent visa expiry, then 60/30/7-day alerts and renewal tasks are generated.
- [ ] Given audit, then dependent records and sponsorship changes are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `dependent` (employee_id, relationship, doc set) + `dependent_visa` with dates/status.
- [ ] Backend: eligibility (salary-threshold) validation + sponsor-link service.
- [ ] Frontend: dependents management screen + ESS dependent view.
- [ ] Rules/Config: per-country family-sponsorship eligibility rules.
- [ ] Alerts/Workflow: dependent expiry alerts + sponsor-impact alerts.
- [ ] Tests: eligibility + sponsor-link + alert tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
