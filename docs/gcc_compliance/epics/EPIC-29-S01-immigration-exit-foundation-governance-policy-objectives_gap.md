# Gap Analysis: EPIC-29-S01 — Immigration Exit Foundation, Governance, Policy & Objectives

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** the immigration-exit domain, governance framework, policy and objectives modelled as configurable reference data, **so that** AuraOS applies one consistent, governed exit-compliance framework across all GCC entities.

**Description**
Establishes the immigration-exit module: objectives, the governance framework (PRO/HR/Compliance roles, approval authority, segregation of duties), and a configurable Immigration Exit Policy (timelines, mandatory steps, country addendums, escalation). Provides inline guidance and anchors all scenario and PRO-workflow stories.

**Covers:** 29.1, 29.2, 29.3, 29.4
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

- [ ] Given the module, when opened, then objectives, governance roles and authority matrix are configurable and shown inline.
- [ ] Given the exit policy, when configured, then mandatory steps, timelines, country addendums and escalation rules are captured and versioned.
- [ ] Given governance roles, when set, then PRO/HR/Compliance responsibilities and SoD are enforceable downstream.
- [ ] Given guidance content (29.1–29.4), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/policy change, then it is versioned with effective date and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_exit_governance` + `immig_exit_policy` entities (mandatorySteps, timelines, countryAddendums, escalation)
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: governance + policy configuration screens
- [ ] Rules/Config: seed exit policy and governance roles
- [ ] Tests: unit tests for policy versioning and SoD evaluation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
