# Gap Analysis: EPIC-24-S07 — Toolbox talks

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**User story:** Line Manager, **I want** to record toolbox talks with attendance, **so that** daily/weekly safety briefings are evidenced and topic coverage is tracked.

**Description**
Capture toolbox-talk sessions (topic, presenter, date, site, attendance with worker acknowledgement) and track frequency/coverage against requirements, with reminders.

**Covers:** 24.12
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

- [ ] Given a toolbox talk, when logged, then topic, presenter, site, date and attendee list (with acknowledgement) are captured.
- [ ] Given a required frequency (e.g. daily pre-task / weekly), when not met for a site, then a gap is flagged.
- [ ] Given attendance, then it links to worker records and missing-worker coverage is reportable.
- [ ] Given any toolbox-talk record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `toolbox_talk`, `toolbox_attendance` schema
- [ ] Backend: frequency-coverage service
- [ ] Frontend: toolbox-talk capture (mobile) + attendance
- [ ] Rules/Config: required frequency per site/activity
- [ ] Alerts/Workflow: missed-talk reminders
- [ ] Tests: unit (coverage)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
