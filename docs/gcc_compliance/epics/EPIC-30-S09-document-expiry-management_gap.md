# Gap Analysis: EPIC-30-S09 — Document Expiry Management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5

**Description**
Tracks two kinds of expiry: document validity expiry (e.g. a record that must be refreshed) and retention expiry (retain-until reached). Drives tiered alerts (e.g. 60/30/7 days before document validity expiry; and at retention-due) to the responsible role, surfaces an expiry worklist, and hands retention-due records to the disposal workflow. Distinguishes from active operational visa/permit expiry (owned by EPIC-07) by focusing on record-lifecycle expiry.

**Covers:** 30.25
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/master-data/document-types/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a document with a validity-expiry date, when within 60/30/7 days, then alerts fire to the responsible role and it appears on the expiry worklist.
- [ ] Given a record reaching its retain-until date, when due, then it is flagged retention-due and handed to the disposal workflow.
- [ ] Given an expiry worklist, then it filters by type, category, entity and due window.
- [ ] Given an actioned expiry (renewed/refiled/queued for disposal), then status updates and the alert clears.
- [ ] Given any expiry action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: expiry tracker over validity-expiry and retain-until; tiered alert scheduler
- [ ] Backend: retention-due → disposal-queue hand-off
- [ ] Frontend: expiry worklist with filters
- [ ] Rules/Config: alert-offset configuration (60/30/7) per document type
- [ ] Alerts/Workflow: tiered expiry alerts + retention-due flag
- [ ] Tests: unit tests for alert offsets and retention-due hand-off

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
