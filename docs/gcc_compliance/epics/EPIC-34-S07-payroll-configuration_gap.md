# Gap Analysis: EPIC-34-S07 — Payroll configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to configure pay components, calendars, proration and statutory deductions per entity, **so that** payroll runs are country-correct and controlled.

**Description**
Configure earnings/deduction components, eligibility and taxability/contribution flags, payroll calendars and cut-offs, proration methods, rounding, GL mapping and maker-checker thresholds — all bound to country rules so statutory deductions (GOSI/GPSSA/SIO) and pay structures comply per entity.

**Covers:** 34.9
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given an entity, when payroll is configured, then pay components, calendar, cut-off, proration and rounding are defined per country.
- [ ] Given a statutory component, when configured, then its base and rate derive from the country rule engine, not free entry.
- [ ] Given maker-checker config, when set, then preparer ≠ approver is enforced and lock requires all mandatory inputs.
- [ ] Given any payroll-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `pay_component`, `payroll_calendar`, `proration_rule`, `gl_mapping` schemas
- [ ] Backend: statutory-base resolution from rule engine
- [ ] Frontend: payroll configuration workspace
- [ ] Rules/Config: country statutory deduction bases and rounding rules
- [ ] Alerts/Workflow: maker-checker threshold configuration
- [ ] Tests: integration tests for statutory-base resolution and maker-checker gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
