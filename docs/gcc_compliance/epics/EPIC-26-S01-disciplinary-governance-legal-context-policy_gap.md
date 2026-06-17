# Gap Analysis: EPIC-26-S01 — Disciplinary Governance, Legal Context & Policy

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable disciplinary governance framework with country legal context and a published disciplinary policy, **so that** all disciplinary action follows lawful, documented authority structures.

**Description**
Establishes governance (decision authorities by penalty level, segregation of investigator vs decision-maker), encodes GCC legal context (UAE Labour Law, KSA Labour Law/MHRSD, Bahrain, Qatar, Oman, Kuwait limits on penalties, deductions and dismissal grounds), and manages the disciplinary policy lifecycle (publish, version, acknowledge).

**Covers:** 26.1, 26.2, 26.3, 26.4, 26.5
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

- [ ] Given governance config, when set, then authority-to-issue thresholds per penalty type are enforced via RBAC.
- [ ] Given country legal-context data, when a case is in a country, then applicable statutory limits/grounds are surfaced to the decision-maker.
- [ ] Given a disciplinary policy is published, when employees log in, then they acknowledge the version with timestamp.
- [ ] Given the investigator equals the proposed decision-maker, when validated, then the system warns/blocks per segregation rule.
- [ ] Given any governance/policy change, when saved, then it is versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_governance`, `disciplinary_policy`, `country_legal_context` entities/migrations.
- [ ] Backend: authority-threshold + segregation-of-duties guard.
- [ ] Frontend: governance config + policy acknowledgement screens.
- [ ] Rules/Config: per-country statutory limits/grounds reference data.
- [ ] Alerts/Workflow: policy re-acknowledgement notifications.
- [ ] Tests: unit (authority thresholds), integration (policy versioning + audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
