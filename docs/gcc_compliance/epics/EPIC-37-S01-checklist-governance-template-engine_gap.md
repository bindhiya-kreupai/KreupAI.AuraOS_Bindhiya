# Gap Analysis: EPIC-37-S01 — Checklist governance & template engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a configurable checklist-template engine with governance, **so that** every HR/payroll/immigration/audit checklist is a versioned, scoped template rather than a hard-coded form.

**Description**
Build the core engine: checklist templates with items (text, control objective, evidence requirement, weighting, mandatory flag, red-flag rule binding), scope (entity/country/employee category), versioning, and the governance model (template owner, approver, review cadence) shared by all A3–A6 checklists and master checklists. Covers the introductions, governance and master checklist heads of all four appendices.

**Covers:** A3.1, A3.2, A3.3, A4.1, A4.2, A4.3, A5.1, A5.2, A5.3, A6.1, A6.2, A6.3
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/dashboard/workflow-engine/audit-log/page.tsx
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a checklist template, when created, then items carry control objective, evidence requirement, weighting, mandatory flag and optional red-flag binding.
- [ ] Given a template, when scoped, then it applies to the correct entity/country/employee category.
- [ ] Given governance, when configured, then owner, approver and review cadence are enforced before a template can be activated.
- [ ] Given a template, when published, then it is versioned and prior versions remain for historical runs.
- [ ] Given any template change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `checklist_template`, `checklist_item`, `checklist_scope` schemas with versioning
- [ ] Backend: template governance/approval service
- [ ] Frontend: checklist template builder with item editor and scope
- [ ] Rules/Config: weighting and mandatory-item rules
- [ ] Tests: unit tests for scoping and version retention

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
