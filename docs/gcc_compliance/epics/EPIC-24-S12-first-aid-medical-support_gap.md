# Gap Analysis: EPIC-24-S12 — First aid & medical support

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**User story:** HSE Officer, **I want** to manage first-aid and medical support provision, **so that** trained first-aiders, kits and clinic/ambulance access meet requirements per site.

**Description**
Track first-aid provision (trained first-aiders per ratio, first-aid kits/rooms, nearest clinic/hospital, ambulance arrangements) with expiry/restock alerts, aligned with EPIC-23 medical controls.

**Covers:** 24.18
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

- [ ] Given a site, when configured, then required first-aiders per occupancy and first-aid resources are checklisted and gaps flagged.
- [ ] Given a first-aid kit, when restock/expiry is due, then an alert is raised.
- [ ] Given a first-aider certification expiry, then a renewal alert fires.
- [ ] Given any first-aid record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `first_aid_provision`, `first_aider_cert`, `first_aid_kit` schema
- [ ] Backend: ratio-gap + expiry service
- [ ] Frontend: first-aid & medical support screen
- [ ] Rules/Config: first-aider ratios + kit contents per country
- [ ] Alerts/Workflow: expiry/restock alerts
- [ ] Tests: unit (ratio/expiry)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
