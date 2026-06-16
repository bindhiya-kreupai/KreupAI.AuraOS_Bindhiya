# Gap Analysis: EPIC-05-S08 — Work-permit readiness verification

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** work-permit readiness verified before joining, **so that** quota, entry-permit, attestation and sponsorship prerequisites are confirmed for the target country.

**Description**
Confirms readiness to obtain a work permit/visa: available quota (MOHRE/Qiwa/LMRA), required document attestations, entry-permit prerequisites, profession/occupation match and NOC/transfer needs (building on EPIC-04 eligibility). Tracks readiness status as a joining gate and prepares the data PRO needs for filing in EPIC-07.

**Covers:** 5.9
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

- [ ] Given a candidate and country, when readiness is checked, then quota availability, required attestations and profession match are validated.
- [ ] Given an in-country transfer case, when detected, then NOC/transfer steps are listed.
- [ ] Given missing readiness items, when joining is attempted, then it is blocked with the outstanding list.
- [ ] Given readiness Cleared, when complete, then data is staged for EPIC-07 work-permit filing.
- [ ] Given any readiness change, when made, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `work_permit_readiness` entity (countryCode, quotaStatus, attestationsRequired, nocRequired, status) + migration.
- [ ] Backend: readiness rule service + joining-gate integration.
- [ ] Frontend: work-permit readiness checklist screen.
- [ ] Rules/Config: per-country quota/attestation/profession rules.
- [ ] Alerts/Workflow: block joining when not ready; PRO handoff notification.
- [ ] Tests: unit (rule eval) + integration (gate, EPIC-07 staging).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
