# Gap Analysis: EPIC-30-S04 — Document Retention Schedule Engine

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a configurable retention schedule that sets retention period, trigger and disposal action per record type and country, **so that** every record's retain-until date and disposal eligibility are computed automatically.

**Description**
The core retention engine: a schedule defining, per record category and country, the retention period (e.g. payroll/wage records N years from period end; contract records N years from termination; medical records per privacy law), the trigger event from which retention runs, the resulting retain-until date, and the disposal action on expiry (review/dispose/anonymise). The engine stamps every record with its retain-until date and computes disposal eligibility, feeding expiry management and disposal.

**Covers:** 30.20
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/dashboard/workflow-engine/audit-log/page.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the schedule, when configured, then each record category/country has a retention period, trigger event and disposal action, effective-dated.
- [ ] Given a record, when ingested or its trigger occurs, then its retain-until date is computed and stamped.
- [ ] Given different countries, when their retention periods differ for the same category, then the correct country period applies.
- [ ] Given the longest-applicable-period rule, when a record is subject to multiple drivers, then the longest retention wins.
- [ ] Given a new country/period in config, then the engine applies it with no code change; any schedule change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_retention_schedule` (recordCategory, countryCode, retentionPeriod, triggerEvent, disposalAction, effectiveFrom)
- [ ] Backend: retain-until computation service stamping records; longest-period resolution
- [ ] Frontend: retention-schedule configuration grid (category × country)
- [ ] Rules/Config: seed GCC statutory retention periods per category/country
- [ ] Tests: unit tests for retain-until computation, country variance, longest-period

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
