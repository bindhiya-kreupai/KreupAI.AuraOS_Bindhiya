# Gap Analysis: EPIC-33-S13 — HR forms audit checklist & risk matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers a configurable audit checklist (form existence/version currency, mandatory-field enforcement, approval completeness, write-back success, retention) and a risk matrix scoring likelihood × impact with auto red-flags (e.g. forms bypassing approval, stuck/failed write-backs, unsigned approvals, overdue form reviews) feeding a risk register.

**Covers:** 33.41, 33.43
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given the audit checklist, when run for an entity, then each item returns pass/fail with evidence (sample submissions).
- [ ] Given red-flag rules, then approval bypasses, failed write-backs, or unsigned approvals auto-raise risk entries.
- [ ] Given the risk matrix, then each risk is scored likelihood × impact and shown on a heatmap.
- [ ] Given a finding, then a corrective action with owner and due date can be tracked to closure.

## Implementation Tasks From Backlog

- [ ] Backend: `forms_audit_checklist`, `forms_risk` entities + red-flag rule engine over submission data.
- [ ] Backend: checklist evaluation + risk scoring service.
- [ ] Frontend: audit checklist runner + risk heatmap.
- [ ] Rules/Config: configurable red-flag thresholds.
- [ ] Alerts/Workflow: corrective-action assignment.
- [ ] Tests: integration (red-flag detection, scoring).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
