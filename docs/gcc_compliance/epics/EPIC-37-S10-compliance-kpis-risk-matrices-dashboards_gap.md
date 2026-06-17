# Gap Analysis: EPIC-37-S10 — Compliance KPIs, risk matrices & dashboards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Build the payroll, immigration and audit compliance KPIs and risk matrices (e.g., checklist completion %, red-flag count by severity, open findings/exceptions aging, corrective-action closure rate, sample coverage) with a domain risk matrix scored by likelihood × impact, surfaced on dashboards with RBAC and drill-down.

**Covers:** A4.24, A4.25, A5.22, A5.23, A6.27, A6.28
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts
- apps/web/src/app/api/v1/compliance/audit/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the dashboards, when loaded, then completion %, red-flag/finding counts, exception aging and closure rates show per domain/entity/country.
- [ ] Given a risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given RBAC, when a user views, then only in-scope data is visible.
- [ ] Given KPI/risk items, when configured, then thresholds are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation + `compliance_risk_register` (payroll/immigration/audit)
- [ ] Frontend: checklist/audit KPI dashboards + risk heatmaps with drill-down
- [ ] Rules/Config: KPI definitions/thresholds and risk scoring
- [ ] Tests: integration tests for KPI computation and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
