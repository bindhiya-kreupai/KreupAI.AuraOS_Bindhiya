# Gap Analysis: EPIC-37-S07 — Immigration checklist suite & exception register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** the full immigration checklist suite with an exception register, **so that** every visa, permit, ID, renewal, transfer and exit case is verified.

**Description**
Materialize the Appendix A5 immigration checklist suite as templates — immigration file, new-joiner, visa, work-permit, residence/national-ID, passport-validity, renewal, transfer, dependent-visa, cancellation, grace-period, repatriation/final-exit, absconding, immigration-payroll-alignment and PRO-audit checklists — with immigration red flags and an immigration exception register tracking lapses to resolution.

**Covers:** A5.4, A5.5, A5.6, A5.7, A5.8, A5.9, A5.10, A5.11, A5.12, A5.13, A5.14, A5.15, A5.16, A5.17, A5.18, A5.19
**Acceptance criteria count:** 4 · **Task count:** 6

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

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an employee/case, when the immigration checklists run, then visa/permit/ID/renewal/transfer/exit items are evaluated with red flags.
- [ ] Given a lapse (e.g., expired permit, passport < validity threshold, grace-period overrun, payroll-active-but-cancelled-visa mismatch), when detected, then an immigration exception is raised with owner and due date.
- [ ] Given open critical exceptions, when present, then the immigration certificate is blocked until closed or accepted.
- [ ] Given checklist/exception actions, when taken, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: immigration checklist templates + `immigration_exception` register linked to runs
- [ ] Backend: immigration red-flag rules (expiry, validity, grace period, payroll alignment)
- [ ] Frontend: immigration checklist suite + exception register
- [ ] Rules/Config: immigration red-flag thresholds per country
- [ ] Alerts/Workflow: exception SLA + certification gating
- [ ] Tests: integration tests for lapse detection and certification gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
