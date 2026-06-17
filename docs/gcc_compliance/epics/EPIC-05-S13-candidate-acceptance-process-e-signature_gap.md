# Gap Analysis: EPIC-05-S13 — Candidate acceptance process & e-signature

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** Employee (Self-Service), **I want** to review and accept my offer and contract digitally, **so that** acceptance is captured securely with a clear, time-bound audit record.

**Description**
Provides a candidate portal to review the issued offer letter/contract, accept/decline/negotiate, and e-sign within the validity window. Captures acceptance metadata (timestamp, IP, version accepted), handles expiry/withdrawal, and on acceptance advances the case to pre-employment/handover. Supports counter-offer/negotiation loops back to approval.

**Covers:** 5.14
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

- [ ] Given an issued offer, when the candidate opens the portal, then the current version is shown with accept/decline/negotiate actions.
- [ ] Given acceptance, when submitted, then e-signature, timestamp and accepted version are recorded.
- [ ] Given the validity window, when it lapses without acceptance, then the offer auto-expires and notifies HR.
- [ ] Given a negotiation request, when raised, then it routes back to offer approval (S02) with the change.
- [ ] Given any acceptance/decline action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_acceptance` entity (offerId, action, signedAt, versionAccepted, signatureRef) + migration.
- [ ] Backend: acceptance/expiry/negotiation service + e-signature integration.
- [ ] Frontend: candidate acceptance portal.
- [ ] Rules/Config: validity window and negotiation rules per entity.
- [ ] Alerts/Workflow: expiry reminders; negotiation routing; acceptance notification.
- [ ] Tests: integration (accept/expire/negotiate) + e2e (e-sign capture).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
