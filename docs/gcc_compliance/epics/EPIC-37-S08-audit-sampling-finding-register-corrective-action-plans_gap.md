# Gap Analysis: EPIC-37-S08 — Audit sampling, finding register & corrective-action plans

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8

**Description**
Materialize the Appendix A6 audit checklist suite (master, employee-file, recruitment, onboarding, payroll, wage-protection, social-insurance, nationalization, immigration, leave, attendance/OT, benefits, accommodation, HSE, grievance, disciplinary, separation/final-settlement, document-retention and HRMS audit checklists), the audit sampling guide (population, method, size), the audit finding register and the corrective-action plan template, with tracking to closure.

**Covers:** A6.4, A6.7, A6.8, A6.9, A6.10, A6.11, A6.12, A6.13, A6.14, A6.15, A6.16, A6.17, A6.18, A6.19, A6.20, A6.21, A6.22, A6.23, A6.24
**Acceptance criteria count:** 5 · **Task count:** 6

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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an audit checklist, when sampling is applied, then a representative sample (risk-based + random, per the sampling guide) is drawn from the population.
- [ ] Given a sampled item, when tested as non-compliant, then a finding is recorded in the finding register with severity and evidence.
- [ ] Given a finding, when raised, then a corrective-action plan with owner, action, due date and status is created and tracked to closure.
- [ ] Given an overdue corrective action, when detected, then it escalates to management.
- [ ] Given audit actions, when taken, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: audit checklist templates + `audit_sample`, `audit_finding`, `corrective_action` schemas
- [ ] Backend: sampling engine + overdue-escalation
- [ ] Frontend: audit checklist runner, finding register and corrective-action board
- [ ] Rules/Config: per-area sampling methods and severities
- [ ] Alerts/Workflow: overdue corrective-action escalation
- [ ] Tests: integration tests for sampling and finding-to-action tracking

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
