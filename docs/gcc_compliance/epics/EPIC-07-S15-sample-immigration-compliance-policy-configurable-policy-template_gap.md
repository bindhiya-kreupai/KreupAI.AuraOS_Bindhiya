# Gap Analysis: EPIC-07-S15 — Sample Immigration Compliance Policy (configurable policy template)

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Could · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable Immigration Compliance Policy template with versioning and acknowledgement, **so that** the organisation's immigration rules are documented, published and acknowledged.

**Description**
Provide a configurable Immigration Compliance Policy (scope, responsibilities, document obligations, renewal duties, transfer/cancellation rules, country addendums) as a versioned policy artifact that can be published, acknowledged by relevant roles, and exported as PDF.

**Covers:** 7.17
**Acceptance criteria count:** 5 · **Task count:** 5

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

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given the policy template, when edited, then sections and country addendums are configurable and versioned.
- [ ] Given publication, then the policy is issued for acknowledgement to in-scope roles and an export is produced.
- [ ] Given an acknowledgement, then version, user and timestamp are recorded.
- [ ] Given a new version, then re-acknowledgement can be requested.
- [ ] Given audit, then policy versions and acknowledgements are retrievable.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_policy` (version, sections, addendums) + acknowledgement record.
- [ ] Backend: publication + export service.
- [ ] Frontend: policy editor + acknowledgement screen.
- [ ] Rules/Config: country addendum templates.
- [ ] Tests: versioning + acknowledgement tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
