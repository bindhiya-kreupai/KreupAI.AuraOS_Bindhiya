# Gap Analysis: EPIC-08-S01 — Records objectives, governance & key takeaways context

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 3

**Description**
Embed configurable guidance (introduction, objectives, key takeaways) and a records-governance model defining data owners, stewards, custodians, RACI and review cadence per entity/country. Content and governance config are version-controlled and editable by System Administrator.

**Covers:** 8.1, 8.2, 8.3, 8.21
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given the records workspace, when help is opened, then introduction, objectives and key-takeaways content render per country.
- [ ] Given governance config, when set, then data owners/stewards/custodians and review cadence are defined per entity.
- [ ] Given a content/governance edit, when saved, then a new version is stored and prior retained.
- [ ] Given audit, then governance assignments and content versions are recoverable.

## Implementation Tasks From Backlog

- [ ] Backend: `records_governance` (entity_id, role, assignee, raci, review_cadence) + `records_guidance_content` (versioned).
- [ ] Backend: versioning + retrieval API.
- [ ] Frontend: governance config + contextual help drawer.
- [ ] Rules/Config: default governance/RACI templates.
- [ ] Tests: versioning + governance-resolution tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
