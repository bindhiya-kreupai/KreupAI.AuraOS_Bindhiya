# Gap Analysis: EPIC-26-S06 — Suspension Pending Investigation & Salary-Deduction Legal Limits

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** suspension and salary-deduction controls enforcing GCC legal limits, **so that** the employer never applies unlawful suspension or deductions.

**Description**
Implements precautionary suspension (paid/unpaid per law, duration caps, review checkpoints) and salary-deduction guardrails enforcing statutory caps (e.g. monthly fine/deduction percentage limits and cumulative caps under UAE/KSA/Bahrain/Qatar/Oman/Kuwait law), blocking deductions that breach limits and ensuring WPS-consistent payroll instructions.

**Covers:** 26.12, 26.13
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

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a suspension, when applied, then pay treatment, start/end and review dates follow country rules, with duration-cap alerts.
- [ ] Given a proposed deduction, when it exceeds the statutory single-month or cumulative cap, then it is blocked with the legal reference.
- [ ] Given multiple penalties in a period, when aggregated, then total deductions are capped per country limit.
- [ ] Given an approved lawful deduction, when posted, then a WPS-consistent payroll instruction is emitted and reconciled.
- [ ] Given any suspension/deduction action, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_suspension`, `disciplinary_deduction` entities + statutory-cap validation in rule engine.
- [ ] Backend: cumulative-cap aggregation + payroll/WPS instruction emitter.
- [ ] Frontend: suspension and deduction screens with limit indicators.
- [ ] Rules/Config: per-country deduction caps, suspension pay rules and duration limits.
- [ ] Alerts/Workflow: suspension-review reminders; deduction-blocked alerts.
- [ ] Tests: unit (cap enforcement), integration (cumulative cap + payroll instruction).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
