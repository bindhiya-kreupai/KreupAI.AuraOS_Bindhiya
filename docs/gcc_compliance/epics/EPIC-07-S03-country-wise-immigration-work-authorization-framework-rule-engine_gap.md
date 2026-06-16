# Gap Analysis: EPIC-07-S03 — Country-wise immigration & work authorization framework (rule engine)

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** each country's immigration and work-authorization framework configured in the rule engine, **so that** required documents, authorities and sequences differ correctly by country without code changes.

**Description**
Configure per-country frameworks: UAE (MOHRE work permit + GDRFA/ICP residence + Emirates ID), KSA (MHRSD/Qiwa work permit + Iqama via Jawazat), Bahrain (LMRA work permit + CPR), Qatar (MOI work permit + residence + QID), Oman (Ministry of Labour permit + resident card via ROP), Kuwait (PAM work permit + civil ID). Each framework defines required documents, issuing authority, valid sequence and validity periods.

**Covers:** 7.5
**Acceptance criteria count:** 6 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an employee's country, when their immigration profile is built, then the country framework determines required documents and their sequence.
- [ ] Given a UAE employee, when authorization is assembled, then MOHRE work permit, residence visa and Emirates ID are required and linked.
- [ ] Given a KSA employee, then Qiwa work permit and Iqama are required with correct authorities.
- [ ] Given a framework version change, then new profiles use the new version while existing retain their bound version.
- [ ] Given an unsupported document/authority combination for a country, then it is rejected.
- [ ] Given audit, then the applied framework version is traceable per employee.

## Implementation Tasks From Backlog

- [ ] Backend: `country_immigration_framework` config (required docs, authorities, sequence, validity).
- [ ] Backend: framework resolver + profile builder service.
- [ ] Frontend: framework configuration UI (System Admin).
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait frameworks.
- [ ] Tests: per-country resolution + sequencing tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
