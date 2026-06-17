# Gap Analysis: EPIC-24-S09 — Incident reporting & incident register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**User story:** HSE Officer, **I want** to report and investigate incidents/near-misses, **so that** events are captured, classified, investigated and corrective actions tracked.

**Description**
Capture incidents/near-misses/unsafe acts with classification (severity, type), investigation (root cause, e.g. 5-why), corrective/preventive actions, and authority-notification flags where required, producing the incident register.

**Covers:** 24.14, 24.30
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an incident, when reported, then type, severity, location, persons involved, immediate action and witnesses are captured (mobile-friendly).
- [ ] Given a reportable incident (e.g. lost-time injury, fatality), then an authority/GOSI-notification flag and statutory timeline alert are raised.
- [ ] Given an investigation, when conducted, then root cause and corrective/preventive actions with owners and due dates are recorded.
- [ ] Given the Incident Register, then it exports incident, date, type, severity, status and corrective-action status.
- [ ] Given any incident/investigation/action, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `incident`, `incident_investigation`, `corrective_action` schema with classification
- [ ] Backend: reportability + statutory-timeline service
- [ ] Frontend: incident reporting (mobile) + Incident Register export
- [ ] Rules/Config: reportability thresholds + notification timelines per country
- [ ] Alerts/Workflow: authority-notification + corrective-action escalation
- [ ] Tests: e2e (report → investigate → close) + unit (reportability)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
