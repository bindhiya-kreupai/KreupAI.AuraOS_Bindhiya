# Gap Analysis: EPIC-29-S02 — Exit Scenarios & Country-Wise Exit Rule Catalogue

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** the common immigration-exit scenarios and a per-country exit rule catalogue modelled as configurable data, **so that** each separation triggers the correct sequence of immigration steps for the right jurisdiction.

**Description**
Defines the canonical exit scenarios (normal cancellation, transfer/release to new sponsor, end of fixed-term, absconding/abandonment, repatriation/final exit, retirement, death in service) and a country exit rule catalogue describing each GCC jurisdiction's closure mechanics, authorities and statutory windows (UAE MOHRE work-permit + ICP/GDRFA residence cancellation; KSA Qiwa/MHRSD exit/transfer + Absher final-exit; Bahrain LMRA permit cancellation + NPRA; Qatar MOI/ADLSA; Oman ROP/MOL; Kuwait PAM/MOI). Each scenario maps to a task template per country, consumed by the PRO workflow.

**Covers:** 29.5, 29.6
**Acceptance criteria count:** 5 · **Task count:** 5

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
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the scenario set, when configured, then each scenario maps to a country-specific task template with authorities and statutory windows.
- [ ] Given a separation type from EPIC-27, when an exit is created, then the matching scenario is selected (or chosen) and the right country task set instantiated.
- [ ] Given the country catalogue, then each of the six GCC countries has an exit profile with authorities, document requirements and timelines.
- [ ] Given an effective-dated rule, when an exit occurs, then the rule version in force is used; a new country/rule added in config is consumed with no code change.
- [ ] Given the country-wise overview (29.6), then a six-country comparison view is available; any change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_exit_scenario` + `immig_exit_country_profile` (countryCode, authorities[], requiredDocs[], statutoryWindows, taskTemplateRef, effectiveFrom)
- [ ] Backend: scenario-to-task-template resolver by country + date
- [ ] Frontend: scenario + country-profile config screens; six-country comparison view
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait exit profiles and task templates
- [ ] Tests: unit tests for scenario/country resolution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
