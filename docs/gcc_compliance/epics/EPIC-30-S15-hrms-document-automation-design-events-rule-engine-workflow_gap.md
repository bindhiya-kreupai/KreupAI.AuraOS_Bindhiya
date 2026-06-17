# Gap Analysis: EPIC-30-S15 — HRMS Document Automation Design (Events, Rule Engine, Workflow)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the document-retention and audit module wired into the event bus, rule engine and workflow engine, **so that** record ingestion, retention, expiry, hold, disposal and audit run straight-through and are fully configurable.

**Description**
Makes the integration backbone explicit: record-creation/separation/expiry events trigger classification, retention-stamping, expiry tracking and disposal queuing; the rule engine holds all parameters (classification, retention schedule, access matrix, privacy rules, disposal actions) configurable per country with effective-dating; the workflow engine drives disposal maker-checker, hold authorisation and audit CAPs; and a standardised audit envelope plus notifications apply throughout.

**Covers:** 30.32
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/audit-log/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/(modules)/workflow-engine/ai-path-prediction/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the rule engine, when a retention/classification/access parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`record.created`, `employee.separated`, `record.retentionDue`, `litigationHold.placed`), then document handlers react idempotently.
- [ ] Given the workflow engine, then disposal maker-checker, hold authorisation and audit CAP paths are reusable and configurable.
- [ ] Given an unclassifiable record or missing retention rule, when ingested, then it is quarantined/flagged rather than mis-retained.
- [ ] Given all document/audit actions, then a standardised audit envelope is recorded.

## Implementation Tasks From Backlog

- [ ] Backend: document event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `doc.*` with effective-dated parameter store
- [ ] Backend: workflow templates for disposal, hold and audit CAPs
- [ ] Backend: quarantine for unclassifiable/missing-rule records
- [ ] Rules/Config: parameterise classification, retention, access, privacy, disposal per country
- [ ] Tests: integration tests for idempotency and quarantine

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
