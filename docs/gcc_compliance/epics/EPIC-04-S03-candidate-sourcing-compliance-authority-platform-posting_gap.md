# Gap Analysis: EPIC-04-S03 — Candidate sourcing compliance & authority-platform posting

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** sourcing channels and authority-platform postings managed compliantly, **so that** mandatory local job-portal advertising and approved channels are used before external hiring.

**Description**
Manages sourcing channels (internal, referral, portals, agencies) and enforces country-specific mandatory advertising — e.g., posting on the national jobs platform / labour portal before/while sourcing expatriates — with proof-of-posting capture. Tracks candidate source for KPI and nationalization analysis.

**Covers:** 4.6
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

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a vacancy, when sourcing starts, then required authority-platform/local-portal posting is created and proof captured.
- [ ] Given an expatriate-targeted role, when posted, then the system verifies mandatory local advertising occurred first per country rule.
- [ ] Given a candidate, when added, then source channel is mandatory and stored for analytics.
- [ ] Given an internal/referral candidate, when sourced, then the relevant policy controls (e.g., referral eligibility) apply.
- [ ] Given any sourcing action, when performed, then it is audit-logged with the posting evidence link.

## Implementation Tasks From Backlog

- [ ] Backend: `sourcing_channel` + `job_posting` entities (caseId, channel, platform, postedAt, proofDocId) + migration.
- [ ] Backend: mandatory-posting rule check per country.
- [ ] Frontend: sourcing/posting management screen with proof upload.
- [ ] Rules/Config: country mandatory-advertising rules and channel catalogue.
- [ ] Alerts/Workflow: alert if external sourcing precedes mandatory local posting.
- [ ] Tests: unit (rule check) + integration (proof capture).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
