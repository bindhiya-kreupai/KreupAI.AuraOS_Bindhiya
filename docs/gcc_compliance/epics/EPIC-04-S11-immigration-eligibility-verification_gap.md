# Gap Analysis: EPIC-04-S11 — Immigration eligibility verification

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** candidate work-eligibility verified before offer, **so that** only candidates eligible for a work permit/visa in the target country are progressed.

**Description**
Verifies immigration eligibility per country: nationality/quota eligibility, age and qualification attestation requirements, prior labour bans, profession/occupation availability and existing-sponsorship/NOC needs. Produces an eligibility decision that gates offer issuance and pre-populates downstream work-permit readiness (EPIC-05/EPIC-07).

**Covers:** 4.14
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/background-verification/page.tsx
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a candidate and target country, when eligibility is checked, then nationality/quota, age, qualification-attestation and ban-status rules are evaluated via the rule engine.
- [ ] Given an existing in-country sponsorship, when detected, then NOC/transfer requirements are flagged.
- [ ] Given a profession not open to the candidate's nationality, when evaluated, then progression is blocked with reason.
- [ ] Given an eligibility result, when Cleared, then it gates offer and feeds work-permit-readiness data.
- [ ] Given any eligibility decision, when made, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_eligibility` entity (countryCode, nationality, profession, banStatus, nocRequired, status) + migration.
- [ ] Backend: eligibility rule service (quota/age/qualification/ban/profession).
- [ ] Frontend: eligibility verification screen with decision and evidence.
- [ ] Rules/Config: per-country immigration eligibility rules (MOHRE/Qiwa/LMRA/etc.).
- [ ] Alerts/Workflow: block offer when not Cleared; PRO notification.
- [ ] Tests: unit (rule eval) + integration (offer gating, NOC flag).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
