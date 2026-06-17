# Gap Analysis: EPIC-11-S10 — WPS penalties & business-impact tracking

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** to track WPS penalties and their business impact, **so that** the cost and consequences of non-compliance are visible and managed.

**Description**
Record WPS non-compliance events and their consequences (fines, work-permit/new-visa blocks, establishment downgrades, file-rejection counts) per country, with monetary impact, status and linkage to the originating exception/delay, to inform remediation and management reporting.

**Covers:** 11.14
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/qatar-wps/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a non-compliance event, when logged, then its penalty type, amount, authority consequence and affected establishment are recorded.
- [ ] Given a salary delay or rejection, when it leads to a penalty, then the penalty links back to the source event for traceability.
- [ ] Given the tracker, when reviewed, then cumulative penalty cost and active business impacts (e.g., blocked permits) are shown per entity/country.
- [ ] Given any entry, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `wps_penalty` schema with impact, amount and source linkage
- [ ] Frontend: penalty & business-impact tracker view
- [ ] Rules/Config: per-country penalty/consequence reference data
- [ ] Tests: unit tests for penalty-to-source linkage

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
