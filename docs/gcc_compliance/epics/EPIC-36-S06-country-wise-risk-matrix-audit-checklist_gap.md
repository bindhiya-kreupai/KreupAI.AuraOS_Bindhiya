# Gap Analysis: EPIC-36-S06 — Country-wise risk matrix & audit checklist

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Parent epic: EPIC-36: GCC Country Compliance Library & Rule Config
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3

**Description**
Provide a configurable country-wise compliance risk matrix (per-country risks such as WPS delay, GOSI underpayment, Nitaqat/Emiratisation shortfall, visa lapse) scored by likelihood × impact, and a country-wise audit checklist that tests each country's key obligations, with remediation tracking.

**Covers:** A2.14, A2.15
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a country, when the risk matrix is configured, then its risks carry likelihood, impact, score, owner and linked control.
- [ ] Given the audit checklist, when run per country, then it flags red-flag conditions against that country's obligations.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given risk/checklist items, when configured, then they are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: `country_risk_register` + country audit-rule engine
- [ ] Frontend: country risk heatmap + audit-checklist runner
- [ ] Rules/Config: per-country risk and red-flag definitions
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
