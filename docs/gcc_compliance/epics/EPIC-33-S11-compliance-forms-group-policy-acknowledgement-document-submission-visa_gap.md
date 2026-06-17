# Gap Analysis: EPIC-33-S11 — Compliance forms group (policy acknowledgement, document submission, visa/work-permit renewal)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** digital compliance forms for policy acknowledgement, document submission and visa/work-permit renewal, **so that** acknowledgements, document collection and renewal actions are captured with expiry-driven prompts.

**Description**
Delivers the compliance form group: Policy Acknowledgement Form (exposing EPIC-32's acknowledgement capture), Document Submission Form (request/collect employee documents with expiry tracking), and Visa/Work-Permit Renewal Form (PRO-driven, expiry-aware, feeding immigration EPIC-07/29).

**Covers:** 33.36, 33.37, 33.38, 33.39
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/[id]/transition/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/route.ts
- apps/web/src/app/api/v1/compliance/wps/submissions/route.ts
- apps/web/src/lib/services/**tests**/labour-ministry-submission.service.test.ts
- apps/web/src/lib/services/labour-ministry-submission.service.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the Policy Acknowledgement form, then it binds to the exact policy version and records signed acknowledgement (reusing EPIC-32 logic).
- [ ] Given the Document Submission form, then requested documents are uploaded, validated for type/expiry, and stored to the employee file.
- [ ] Given the Visa/Work-Permit Renewal form, then renewals are initiated with PRO routing and expiry alerts at 60/30/7 days before expiry.
- [ ] Given approval/completion, then immigration/document records update and the actions are audited.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + integration to EPIC-32 acknowledgement and immigration/document registers.
- [ ] Backend: expiry-tracking + alert scheduler (60/30/7 days).
- [ ] Frontend: policy acknowledgement, document submission, visa renewal forms.
- [ ] Rules/Config: document matrix and renewal lead times per country.
- [ ] Alerts/Workflow: expiry alerts; PRO renewal routing.
- [ ] Tests: integration (version-bound ack, expiry alerts, immigration write-back).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
