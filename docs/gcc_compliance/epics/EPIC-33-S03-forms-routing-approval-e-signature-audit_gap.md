# Gap Analysis: EPIC-33-S03 — Forms routing, approval, e-signature & audit

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8

**Description**
Cross-cutting service used by all form-group stories: configurable multi-step routing (by role, manager hierarchy, amount thresholds, country), e-signature capture, status tracking (submitted → approved/rejected → completed), and immutable audit of every action. Without this, the group forms cannot be processed compliantly.

**Covers:** 33.3
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a form with a routing config, when submitted, then it follows the configured chain (e.g. manager → HR → Finance) with conditional steps on thresholds/country.
- [ ] Given any approval step, then the approver e-signs and their identity, decision, comments, timestamp and IP are recorded immutably.
- [ ] Given a rejection, then it returns to the initiator with reason and no downstream write-back occurs.
- [ ] Given maker-checker, then an initiator cannot approve their own submission.
- [ ] Given an auditor, then the full lifecycle of any submission (versions, routing, signatures) is reconstructable.

## Implementation Tasks From Backlog

- [ ] Backend: routing engine config + `form_approval_step` and `form_signature` entities + migration.
- [ ] Backend: e-signature adapter (typed/drawn signature, optional vendor hook) and audit writer.
- [ ] Frontend: approval inbox, submission timeline, signature capture.
- [ ] Rules/Config: routing rules by role/threshold/country; SLA per step.
- [ ] Alerts/Workflow: pending-approval and SLA-breach notifications.
- [ ] Tests: integration (conditional routing, maker-checker), e2e (submit → sign → approve).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
