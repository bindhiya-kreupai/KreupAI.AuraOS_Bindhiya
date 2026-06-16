# Gap Analysis: EPIC-01: Chapter 1: GCC Employment Landscape

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 9
- Missing: 7
- Minimal Evidence: 1
- Partial: 1

## Epic Goal

Establish the AuraOS platform foundation that makes every downstream compliance module GCC-aware: a multi-country, multi-entity tenancy model; a unified workforce data model that distinguishes expatriate vs. national employees per country; a digital-transformation/automation baseline (event bus, audit trail, alerts) that compliance modules plug into; and a compliance-risk and KPI baseline that turns the handbook's market context and risk themes into configurable, measurable platform behaviour. This epic does not implement labour-law rules itself — it creates the structures, reference data, and analytics scaffolding the rule engine (EPIC-02) populates.

## Storywise Gaps

### EPIC-01-S01 — Multi-country, multi-entity tenancy model

**Status:** Missing
**Covers:** 1.1, 1.2
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S02 — GCC labour-market reference dataset

**Status:** Missing
**Covers:** 1.2
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S03 — National vs. expatriate workforce data model

**Status:** Minimal Evidence
**Covers:** 1.2, 1.3
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/workforce-planning/data.ts
- apps/web/src/app/dashboard/workforce-planning/scenario-modeling/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S04 — Platform automation backbone (event bus, audit trail, alerts)

**Status:** Partial
**Covers:** 1.6
**Acceptance criteria count:** 6 · **Task count:** 7

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/audit-trail/page.tsx
- apps/web/src/app/dashboard/user-management/audit-trail/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/services/audit/audit-trail-service.ts
- packages/@aura/events/tsconfig.json
- packages/@aura/events/tsup.config.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S05 — RBAC role model for GCC HR personas

**Status:** Missing
**Covers:** 1.3
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S06 — Common HR challenges as a configurable compliance-risk register

**Status:** Missing
**Covers:** 1.3, 1.4
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S07 — Workforce localization & KPI baseline

**Status:** Missing
**Covers:** 1.2, 1.3
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S08 — GCC Employment Landscape executive dashboard

**Status:** Missing
**Covers:** 1.1, 1.2, 1.4
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-01-S09 — Digital maturity & automation baseline scorecard

**Status:** Missing
**Covers:** 1.5, 1.6
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
