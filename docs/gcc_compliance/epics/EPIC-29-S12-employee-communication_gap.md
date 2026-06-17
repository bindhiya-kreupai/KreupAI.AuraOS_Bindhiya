# Gap Analysis: EPIC-29-S12 — Employee Communication

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 3

**Description**
Drives structured, templated communication to the employee (and dependents where relevant) through the exit: cancellation/transfer status, grace-period countdown, documents needed (passport submission, NOC), repatriation/ticket details, and final-settlement dependency. Communications are configurable, bilingual, logged as evidence, and tied to the case milestones.

**Covers:** 29.16
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

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exit milestone (cancellation, grace start, document request, ticket booked), when reached, then the configured communication is sent to the employee/dependents.
- [ ] Given grace-period thresholds, when hit, then countdown reminders are sent to the employee.
- [ ] Given each communication, then it is logged against the case as evidence with timestamp.
- [ ] Given templates, when configured, then content is editable per entity and EN/AR.
- [ ] Given employee self-service, then the leaver can view their exit status and required actions.

## Implementation Tasks From Backlog

- [ ] Backend: communication templates + milestone-triggered dispatch logged to case
- [ ] Frontend: employee self-service exit-status view + HR comms log
- [ ] Rules/Config: per-entity EN/AR communication templates
- [ ] Alerts/Workflow: milestone- and grace-threshold-triggered messages
- [ ] Tests: unit tests for milestone triggers and logging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
