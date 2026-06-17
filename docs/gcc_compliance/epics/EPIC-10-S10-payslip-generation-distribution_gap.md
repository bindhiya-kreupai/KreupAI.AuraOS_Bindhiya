# Gap Analysis: EPIC-10-S10 — Payslip generation & distribution

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5

**Description**
Generate per-employee payslips from locked results with configurable, multilingual (Arabic/English) templates, secure self-service distribution and download, and optional email/notification, with full earnings/deductions breakdown and YTD figures.

**Covers:** 10.10
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/dashboard/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll/bank-file-generation/page.tsx
- apps/web/src/app/(modules)/payroll/disbursement/sif-generation/page.tsx
- apps/web/src/app/dashboard/payroll/bank-file-generation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when payslips generate, then each employee gets a payslip with earnings, deductions, net and YTD, in the configured language(s).
- [ ] Given self-service, when an employee logs in, then they can view/download only their own payslips (RBAC-scoped).
- [ ] Given a country, when the template renders, then required statutory fields for that country are included.
- [ ] Given a re-opened/re-run period, when re-closed, then payslips are re-issued with a clear version indicator.
- [ ] Given distribution, when triggered, then access and downloads are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: payslip generation service from locked results + `payslip` store
- [ ] Backend: multilingual configurable template engine (PDF)
- [ ] Frontend: ESS payslip viewer/download with RBAC
- [ ] Rules/Config: per-country payslip required fields
- [ ] Alerts/Workflow: payslip-ready notification
- [ ] Tests: integration tests for RBAC scoping and re-issue versioning

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
