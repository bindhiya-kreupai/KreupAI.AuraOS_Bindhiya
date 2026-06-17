# Gap Analysis: EPIC-24-S11 — Emergency preparedness & fire safety

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**User story:** HSE Officer, **I want** to manage emergency preparedness and fire safety across sites, **so that** emergency plans, drills, fire equipment and civil-defence certificates are current and evidenced.

**Description**
Manage emergency response plans (evacuation, assembly points, wardens, contacts), drills, and fire safety (extinguishers, alarms, detectors, exits, civil-defence certificate) with service/drill scheduling and certificate-expiry alerts, aligned with EPIC-23 accommodation fire safety.

**Covers:** 24.16, 24.17
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

- [ ] Given a site, when configured, then an emergency plan (evacuation routes, assembly points, wardens, emergency contacts) is recorded and gaps flagged.
- [ ] Given fire equipment, when registered, then extinguisher service, alarm/detector tests and civil-defence certificate validity are tracked with 60/30-day expiry alerts.
- [ ] Given a scheduled drill, when due, then it is created; completion is recorded and overdue drills flagged.
- [ ] Given an expired fire certificate or overdue drill, then the site is flagged high-risk and a corrective action is created.
- [ ] Given any emergency/fire record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `emergency_plan`, `fire_equipment`, `fire_certificate`, `drill` schema
- [ ] Backend: certificate-expiry + drill-due service
- [ ] Frontend: emergency plan + fire safety registers
- [ ] Rules/Config: service intervals, drill frequency, certificate types per country
- [ ] Alerts/Workflow: expiry/overdue-drill alerts; non-conformance → corrective action
- [ ] Tests: unit (expiry/overdue) + integration (EPIC-23 alignment)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
