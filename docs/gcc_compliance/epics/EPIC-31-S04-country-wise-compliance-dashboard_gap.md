# Gap Analysis: EPIC-31-S04 — Country-wise compliance dashboard

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a per-country compliance dashboard, **so that** I can manage UAE, KSA, Bahrain, Qatar, Oman and Kuwait obligations against each country's specific authorities.

**Description**
A country lens showing each GCC country's compliance posture mapped to its authorities/platforms (MOHRE/ICP, MHRSD/Qiwa/Mudad/GOSI, LMRA/SIO, etc.), with country-specific obligations and localisation/WPS status.

**Covers:** 31.7
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx
- apps/web/src/app/dashboard/analytics/report-builder/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a country is selected, when the dashboard loads, then it shows that country's domains, authorities, and RAG status only.
- [ ] Given KSA, when rendered, then Nitaqat band, GOSI, Qiwa contracts, and Mudad wage status appear; given UAE, then Emiratisation, GPSSA, MOHRE/WPS appear.
- [ ] Given a country obligation breach, when detected, then it links to the responsible legal entities driving it.
- [ ] Given multi-entity countries, when filtered, then entity-level breakdown is available within the country view.

## Implementation Tasks From Backlog

- [ ] Backend: country-dimension aggregation API keyed to authority mapping per country.
- [ ] Frontend: country selector + country dashboard with authority-grouped tiles.
- [ ] Rules/Config: country→authority→obligation mapping in the country rule engine.
- [ ] Tests: integration tests asserting correct authority/obligation set per GCC country.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
