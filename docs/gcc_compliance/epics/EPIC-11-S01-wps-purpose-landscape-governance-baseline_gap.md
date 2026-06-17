# Gap Analysis: EPIC-11-S01 — WPS purpose, landscape & governance baseline

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable WPS landscape and governance model across the GCC, **so that** each legal entity's WPS obligations and controls are clearly defined.

**Description**
Establish the WPS foundation: per-country WPS scheme metadata (authority, channel, mandatory scope, statutory window), establishment-level WPS registration data, and governance roles/control points that the file-generation and submission stories build on, capturing the handbook's purpose and landscape content.

**Covers:** 11.1, 11.2, 11.3
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given the GCC landscape, when configured, then each country's WPS scheme (UAE WPS/MOHRE, Saudi Mudad/MHRSD, Qatar WPS, Bahrain LMRA, Oman, Kuwait) is represented with its channel and statutory window.
- [ ] Given a legal entity, when registered, then its WPS establishment/employer IDs and bank-agent details are captured and validated.
- [ ] Given WPS governance, when set, then control points (generate → validate → submit → reconcile → certify) are mandatory.
- [ ] Given any config change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `wps_scheme` and `wps_establishment` schemas (country, authority, channel, statutory_window_days, employer_id)
- [ ] Backend: governance control-point service
- [ ] Frontend: WPS scheme & establishment configuration screen
- [ ] Rules/Config: per-country WPS scheme metadata
- [ ] Tests: unit tests for establishment-ID validation per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
