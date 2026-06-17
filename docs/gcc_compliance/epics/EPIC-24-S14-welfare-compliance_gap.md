# Gap Analysis: EPIC-24-S14 — Welfare compliance

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** to track worker welfare compliance, **so that** rest, hydration, sanitation, breaks and wellbeing provisions on worksites are evidenced beyond accommodation.

**Description**
Track worksite welfare provisions (drinking water, shaded rest, sanitation, rest breaks, prayer facilities, worker wellbeing) with checklists and verification, complementing EPIC-23 accommodation welfare.

**Covers:** 24.20
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a worksite, when assessed, then mandatory welfare provisions are checklisted and deficiencies flagged.
- [ ] Given a welfare deficiency, then a corrective action is created.
- [ ] Given a verification, then it is recorded with date and verifier.
- [ ] Given any welfare record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `welfare_provision`, `welfare_check` schema
- [ ] Backend: completeness service
- [ ] Frontend: welfare compliance checklist
- [ ] Rules/Config: mandatory worksite welfare provisions per country
- [ ] Alerts/Workflow: deficiency → corrective action
- [ ] Tests: unit (completeness)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
