# Gap Analysis: EPIC-30-S14 — HR Audit KPIs & HR Document Dashboard

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers HR-audit/document KPIs (file completeness %, mandatory-document coverage, records under retention vs overdue-for-disposal, expiry backlog, litigation holds active, disposals completed/pending approval, access-violation count, audit findings open/closed, corrective-action ageing) and a role-based HR document dashboard with trend charts and drill-down, filterable by entity, record category and period.

**Covers:** 30.30, 30.33
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given document/audit data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, category, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. file completeness, overdue disposal), then it is red with drill-down to records/findings.
- [ ] Given RBAC, Executives see summary tiles; Compliance/Audit see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views over records/retention/holds/disposal/findings
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: HR document dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
