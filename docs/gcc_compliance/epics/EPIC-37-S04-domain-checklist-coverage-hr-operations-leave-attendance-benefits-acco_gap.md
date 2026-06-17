# Gap Analysis: EPIC-37-S04 — Domain checklist coverage: HR operations (leave, attendance, benefits, accommodation, HSE)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** the engine seeded for HR-operations domains, **so that** leave, attendance/overtime, benefits, accommodation and HSE checklists run with their red flags.

**Description**
Materialize the HR-operations compliance checklists as templates with domain-specific red flags (e.g., leave below statutory minimum, OT beyond cap, missing mandatory medical insurance, accommodation over-occupancy, missing HSE training/heat-stress controls), proving the engine generalizes beyond the core domains.

**Covers:** A3.12, A3.13, A3.14, A3.15, A3.16
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/e2e/attendance/shift-management.e2e.test.ts
- apps/web/src/**tests**/services/attendance-roster-dashboard.service.test.ts
- apps/web/src/**tests**/services/attendance-shift-swap-dashboard.service.test.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given leave/attendance/benefits/accommodation/HSE templates, when run, then their items evaluate with domain red flags.
- [ ] Given a domain breach (e.g., OT over cap, over-occupancy, expired HSE training), when detected, then a red flag is raised.
- [ ] Given each template, when scoped, then it applies per entity/country correctly.
- [ ] Given runs, when completed, then results feed the dashboards and certificates.

## Implementation Tasks From Backlog

- [ ] Backend: domain red-flag rule sets for leave/attendance/benefits/accommodation/HSE
- [ ] Frontend: domain checklist run views (reusing the run engine)
- [ ] Rules/Config: domain red-flag thresholds per country
- [ ] Tests: integration tests for domain red-flag detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
