# Gap Analysis: EPIC-04-S14 — Candidate data privacy, consent & retention

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** candidate personal data governed by consent, access control, retention and deletion rules, **so that** recruitment complies with GCC data-privacy laws.

**Description**
Implements candidate-data-privacy controls across the lifecycle: lawful-basis/consent capture at application, purpose limitation, role-based access to candidate PII and sensitive data, configurable retention (e.g., purge unsuccessful candidates after a defined period), candidate data-subject requests (access/erasure) and a processing log. Anchors the consent referenced by screening, BGV and eligibility stories.

**Covers:** 4.17
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a candidate application, when received, then consent and lawful basis are captured before processing.
- [ ] Given candidate PII/sensitive data, when accessed, then RBAC restricts visibility and access is logged.
- [ ] Given a retention rule, when an unsuccessful candidate exceeds the period, then their data is purged/anonymised automatically.
- [ ] Given a data-subject request, when raised, then access/erasure is fulfilled and recorded within the configured window.
- [ ] Given any consent/retention/erasure action, when performed, then it is audit-logged in the processing register.

## Implementation Tasks From Backlog

- [ ] Backend: `candidate_consent` + `data_retention_rule` + `dsr_request` entities + migration.
- [ ] Backend: retention/purge scheduler + DSR fulfilment service.
- [ ] Frontend: consent capture, privacy-access controls, DSR handling screen.
- [ ] Rules/Config: per-country retention periods and lawful-basis options.
- [ ] Alerts/Workflow: retention-due jobs; DSR SLA alerts.
- [ ] Tests: unit (retention scheduler) + integration (RBAC, DSR erasure).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
