# Gap Analysis: EPIC-25-S08 — Grievance↔Disciplinary Linkage & Outcome Routing

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
Connects ER outcomes to EPIC-26: where an investigation substantiates misconduct by a respondent, AuraOS can initiate a linked disciplinary case carrying over findings/evidence, and where a complaint is unfounded/malicious, it can flag potential disciplinary action against the complainant under fairness rules.

**Covers:** 25.17
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

- [ ] Given a substantiated finding, when HR routes it, then a disciplinary case is created pre-populated with linked findings and evidence references.
- [ ] Given a malicious/vexatious complaint finding, when recorded, then the system supports (but does not auto-trigger) a separate review with mandatory senior approval.
- [ ] Given a linked disciplinary case, when viewed, then bidirectional traceability between grievance and disciplinary records is shown.
- [ ] Given evidence is shared to disciplinary, when transferred, then confidentiality/redaction rules are applied.
- [ ] Given any linkage event, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `grievance_disciplinary_link` entity + outcome-routing service emitting a disciplinary-init event.
- [ ] Backend: redaction service for cross-module evidence sharing.
- [ ] Frontend: outcome routing screen with linkage display.
- [ ] Rules/Config: routing/approval rules for substantiated vs malicious findings.
- [ ] Alerts/Workflow: notify disciplinary owner on linked case creation.
- [ ] Tests: integration (link creation + traceability), unit (redaction).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
