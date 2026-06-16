# Gap Analysis: EPIC-32-S02 — Policy version control & lifecycle

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5

**Description**
Adds immutable, numbered versioning to every policy with effective-date control, change-log/diff between versions, and a controlled supersede flow. Critical for enforceability: an acknowledgement must bind to a specific version hash.

**Covers:** 32.5
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx
- apps/web/src/app/dashboard/workflow-engine/version-control/page.tsx
- apps/web/src/**tests**/middleware/api-version.test.ts
- apps/web/src/app/api/versions/migration/route.ts
- apps/web/src/app/api/versions/route.ts
- apps/web/src/lib/middleware/api-version.ts
- apps/web/src/lib/swagger/paths/versions.ts
- apps/web/src/lib/versioning/version-manager.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an approved policy, when a new revision is published, then the prior version is retained read-only, the new version gets an incremented number and effective date, and a change summary is captured.
- [ ] Given any acknowledgement, then it stores the exact `versionId` and content hash acknowledged.
- [ ] Given two versions, when a user compares them, then a field/section-level diff is shown.
- [ ] Given a future-dated effective date, then the new version does not become the "current" published version until that date.
- [ ] Given a retired policy, then it is archived (not deleted) and excluded from active acknowledgement campaigns.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_version` (policyId, versionNo, contentHash, effectiveDate, changeSummary, status, publishedBy) entity + migration.
- [ ] Backend: supersede/rollforward service and content-hash generation.
- [ ] Backend: version diff service.
- [ ] Frontend: version history panel + side-by-side diff viewer.
- [ ] Rules/Config: effective-date activation job.
- [ ] Tests: integration (version increment, future-dated activation, hash immutability).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
