# Gap Analysis: EPIC-26-S03 — Pre-Action Investigation & Evidence Standards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8

**Description**
Requires a documented investigation before any penalty, capturing allegations, evidence (with source, reliability, chain-of-custody, integrity hash), the standard of proof (balance of probabilities), and a finding per allegation. Consumes EPIC-25 investigation findings where the case originated from a grievance, avoiding duplication.

**Covers:** 26.8, 26.9
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

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a disciplinary case, when a penalty above a configured threshold is attempted, then it is blocked unless a completed investigation with findings exists.
- [ ] Given evidence, when logged, then source/reliability/custody/hash are captured and tamper-evident.
- [ ] Given a grievance-origin case, when linked, then EPIC-25 findings/evidence are imported (redacted as needed) rather than re-entered.
- [ ] Given findings, when recorded, then each allegation has a finding and the standard of proof applied.
- [ ] Given any investigation step, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_investigation`, `disciplinary_evidence`, `disciplinary_finding` entities + evidence-hashing service.
- [ ] Backend: penalty-gate guard requiring investigation; EPIC-25 import adapter.
- [ ] Frontend: investigation/evidence/findings workspace.
- [ ] Rules/Config: penalty thresholds requiring investigation; standard-of-proof per country.
- [ ] Alerts/Workflow: investigation SLA reminders.
- [ ] Tests: integration (penalty gate + grievance import), unit (evidence integrity).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
