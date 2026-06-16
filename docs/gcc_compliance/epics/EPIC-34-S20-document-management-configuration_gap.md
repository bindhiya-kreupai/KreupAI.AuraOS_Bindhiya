# Gap Analysis: EPIC-34-S20 — Document management configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3

**Description**
Configure document taxonomy, mandatory-document matrix by employee category/country, expiry tracking, retention schedules, litigation-hold flags and disposal rules consumed by the document store.

**Covers:** 34.22
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- services/document-service/tsconfig.json
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

## Gap To Close

- add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a country/category, when configured, then the mandatory-document matrix and retention periods resolve from the rule engine.
- [ ] Given an expiring document type, when configured, then expiry-alert thresholds are set.
- [ ] Given retention, when configured, then disposal is blocked while a litigation hold is active.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `document_type`, `retention_rule`, `mandatory_doc_matrix` schemas
- [ ] Backend: retention/disposal and litigation-hold logic
- [ ] Frontend: document configuration screen
- [ ] Rules/Config: per-country retention schedules and mandatory matrix
- [ ] Tests: unit tests for retention/hold enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
