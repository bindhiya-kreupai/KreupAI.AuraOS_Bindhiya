# Gap Analysis: EPIC-24-S04 — Heat stress & midday-break compliance

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** to enforce heat-stress controls and the seasonal midday-break ban, **so that** outdoor work stops during prohibited hours and heat-stress measures are evidenced.

**Description**
Enforce GCC midday-break rules (e.g. UAE/Qatar/Oman/KSA prohibition of outdoor work during peak summer afternoon hours over the summer period) with scheduling/attendance integration, plus heat-stress measures (shaded rest, water/electrolytes, acclimatization, WBGT monitoring) and exemptions, producing evidence.

**Covers:** 24.9
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given the midday-break period (configurable dates and hours per country, e.g. mid-June to mid-September, 12:30–15:00), then outdoor-work scheduling/attendance during banned hours is blocked or flagged as a violation.
- [ ] Given a heat-stress plan, when configured, then shaded rest areas, water provision, WBGT thresholds and acclimatization steps are recorded per site.
- [ ] Given a WBGT/heat reading above threshold, then a work-suspension alert is raised and logged.
- [ ] Given a permitted exemption (e.g. emergency work), then it requires approval and is logged with justification.
- [ ] Given any violation/exemption, then it is audit-logged and surfaces on the dashboard for authority evidence.

## Implementation Tasks From Backlog

- [ ] Backend: `heat_stress_rule`, `heat_reading`, `midday_break_violation` schema; attendance-integration hook
- [ ] Backend: banned-hours enforcement + WBGT-threshold service
- [ ] Frontend: heat-stress plan + violation/exemption register
- [ ] Rules/Config: country midday-break dates/hours, WBGT thresholds, exemptions
- [ ] Alerts/Workflow: work-suspension alerts; exemption approval
- [ ] Tests: unit (banned-hours/threshold) + integration (attendance)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
