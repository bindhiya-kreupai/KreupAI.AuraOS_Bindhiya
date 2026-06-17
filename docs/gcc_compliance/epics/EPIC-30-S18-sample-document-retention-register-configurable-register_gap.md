# Gap Analysis: EPIC-30-S18 — Sample Document Retention Register (Configurable Register)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable Document Retention Register listing every record class with its retention, status, expiry and disposal state, **so that** retention compliance is visible, evidenced and exportable.

**Description**
Provides a digital Document Retention Register fed from the retention engine: each record/class with category, country, retention period, trigger event, retain-until date, current status (active/retention-due/held/disposed), and disposal reference. Supports filtering, ageing and export, and feeds the monthly pack and audit. Doubles as the evidence artefact in an authority inspection.

**Covers:** 30.36
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

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given records under retention, when generated, then each appears with category, country, retention period, trigger, retain-until and status.
- [ ] Given a held or disposed record, then its hold/disposal reference and date are shown.
- [ ] Given filters (category, country, status, retain-until window, entity), then the register updates and exports to Excel/PDF.
- [ ] Given retention-due records, then they are highlighted for action.
- [ ] Given any register view/export, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_retention_register` view over records + retention/hold/disposal state
- [ ] Backend: ageing/retention-due highlighting + export
- [ ] Frontend: register grid with filters, status indicators, export
- [ ] Rules/Config: register columns per entity
- [ ] Tests: unit tests for status derivation and export

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
