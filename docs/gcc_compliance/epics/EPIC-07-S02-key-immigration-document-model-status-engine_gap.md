# Gap Analysis: EPIC-07-S02 — Key immigration document model & status engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**User story:** PRO / Immigration Officer, **I want** every key immigration document modelled with dates, references and lifecycle status, **so that** each employee's authorization validity is always known and traceable.

**Description**
Model document types — entry/employment entry permit, work permit/labour card, residence visa, Emirates ID, Iqama, CPR, QID, medical, e-visa, sponsorship/establishment card — with issue date, expiry date, authority, reference number, place of issue, and status (Draft/Applied/Issued/Active/Expiring/Expired/Cancelled). A status engine derives Expiring/Expired from configurable thresholds and drives alerts and dashboards.

**Covers:** 7.4
**Acceptance criteria count:** 6 · **Task count:** 6

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

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a document, when created/updated, then type, authority, reference, issue/expiry dates are validated and stored with the employee link.
- [ ] Given expiry thresholds, when an expiry date nears, then status transitions to Expiring at the configured offset and Expired after the date.
- [ ] Given a country, then only document types valid for that country are selectable (e.g. Iqama for KSA, Emirates ID for UAE, CPR for Bahrain, QID for Qatar).
- [ ] Given a document supersession (e.g. renewal), then the prior document is versioned and history retained.
- [ ] Given RBAC, then only PRO/immigration roles can edit immigration documents.
- [ ] Given any change, then it is audit-logged with before/after values.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_document` (employee_id, doc_type, authority, reference_no, issue_date, expiry_date, status, country_code, version) + history table; migration.
- [ ] Backend: status-derivation service + scheduled re-evaluation job.
- [ ] Frontend: document detail/edit screens per type.
- [ ] Rules/Config: country-valid document-type catalogue + thresholds.
- [ ] Alerts/Workflow: status-change events to alerting.
- [ ] Tests: status transition + country-validity + history tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
