# Gap Analysis: EPIC-27-S17 — Separation Audit Checklist & Risk Matrix

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers an audit checklist (notice correct, clearance complete, settlement within window, EOSB accurate, visa cancelled on time, social insurance/benefits closed, IT access revoked) with pass/fail and evidence links, plus a risk register/matrix auto-flagging red flags (late settlement, overstay risk, missing clearance, deduction over limit, abandonment mishandling).

**Covers:** 27.28, 27.30
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

- [ ] Given the checklist, when run for a period/entity, then each item returns pass/fail/N-A with evidence and a score.
- [ ] Given the risk matrix, when populated, then risks plot on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered (e.g. settlement beyond statutory window, visa not cancelled), then items auto-raise to the risk register.
- [ ] Given remediation owners/dates, when assigned, then overdue items are escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

## Implementation Tasks From Backlog

- [ ] Backend: `separation_audit_checklist`, `separation_audit_result`, `separation_risk_register` + red-flag engine.
- [ ] Backend: scoring/residual-rating service.
- [ ] Frontend: checklist runner + risk heat grid.
- [ ] Rules/Config: configurable items, red-flag thresholds, risk scales per country.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (red flags/scoring), integration (checklist→register).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
