# Gap Analysis: EPIC-02-S02 — Rule change governance (maker-checker & versioning)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5

**Description**
Wraps the rule engine in a governed change workflow: a preparer drafts a rule change, a different approver authorises it, and only then does it become effective. Every change is versioned with rationale and source reference (e.g., decree number).

**Covers:** 2.1
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/versioning/version-manager.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a rule draft, when submitted, then it requires approval by a different user (preparer ≠ approver).
- [ ] Given a pending change, when approved, then it activates on its effective date and supersedes the prior version.
- [ ] Given a change, when created, then a rationale and legal source reference (e.g., decree/circular number) are mandatory.
- [ ] Given an approved change, when needed, then it can be rolled back to the previous version with audit capture.
- [ ] Given any submit/approve/reject/rollback, then the audit trail records actor, timestamp, and before/after.
- [ ] Given RBAC, then approval rights are limited to senior Compliance roles.

## Implementation Tasks From Backlog

- [ ] Backend: `RuleChangeRequest` (draft, status, preparer, approver, rationale, source_ref) schema + migration.
- [ ] Backend: maker-checker workflow service integrating with the rule engine; rollback support.
- [ ] Frontend: change-request inbox, diff view, approve/reject screen.
- [ ] Rules/Config: enforce preparer ≠ approver and mandatory source reference.
- [ ] Alerts/Workflow: notify approvers on submission; notify preparer on decision.
- [ ] Tests: e2e for maker-checker, rejection, rollback, and audit capture.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
