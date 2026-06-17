# Gap Analysis: EPIC-05-S11 — Medical fitness requirements management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** medical-fitness testing tracked as a pre-employment gate, **so that** mandatory GCC medical/visa fitness results are obtained and cleared before joining.

**Description**
Manages the mandatory medical-fitness process required for visas/work permits in GCC (e.g., DHA/MOH/visa medical screening): test type, centre, appointment, result (fit/unfit/conditional) and validity. Result gates joining and feeds the conditional offer (S05) and work-permit readiness (S08). Handles "unfit" outcomes with offer-impact workflow.

**Covers:** 5.12
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

- [ ] Given a country, when the case opens, then the required medical-fitness test(s) and centre options are listed per rule.
- [ ] Given a result, when recorded, then fit/unfit/conditional status and validity date are captured with evidence.
- [ ] Given an "unfit" result, when confirmed, then a configurable offer-impact workflow (withdraw/escalate) is triggered.
- [ ] Given a "fit" result, when recorded, then the related offer condition and work-permit readiness are updated.
- [ ] Given any medical record, when stored, then it is access-restricted (sensitive data) and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `medical_fitness` entity (testType, centre, result, validTo, evidenceDocId, status) + migration.
- [ ] Backend: result-gate + offer-impact workflow service.
- [ ] Frontend: medical-fitness tracker with sensitive-data access control.
- [ ] Rules/Config: per-country mandatory medical tests and validity.
- [ ] Alerts/Workflow: unfit-result escalation; appointment reminders.
- [ ] Tests: unit (status/validity) + integration (joining gate, condition update).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
