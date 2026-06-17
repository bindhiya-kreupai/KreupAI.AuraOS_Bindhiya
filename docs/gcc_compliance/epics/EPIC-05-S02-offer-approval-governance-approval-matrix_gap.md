# Gap Analysis: EPIC-05-S02 — Offer approval governance & approval matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** offers routed through a configurable approval matrix with maker-checker, **so that** every offer is authorised at the correct level before issuance.

**Description**
Implements the offer-approval matrix: approver levels determined by entity, grade, total-cost-to-company and deviation from band (links to EPIC-04 benchmark). Enforces maker-checker (preparer ≠ approver), out-of-band escalation, and final approval as the gate to issue the offer letter. Captures full decision history.

**Covers:** 5.4
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an offer, when submitted, then approvers are derived from entity, grade and CTC value with maker-checker enforced.
- [ ] Given an out-of-band salary (vs EPIC-04 benchmark), when proposed, then an extra approval level is required.
- [ ] Given an approver, when they approve/reject/return, then the decision and comments are recorded and the next step triggers.
- [ ] Given final approval, when reached, then the offer-letter issue gate opens.
- [ ] Given any approval action, when performed, then it is audit-logged with actor, level and reason.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_approval` entity + approval-routing service on workflow engine.
- [ ] Backend: matrix resolver (grade/CTC/band-deviation → approver chain).
- [ ] Frontend: approval inbox + decision actions + history.
- [ ] Rules/Config: per-entity offer approval matrix and escalation thresholds.
- [ ] Alerts/Workflow: route, escalate on SLA breach, open issue gate on approval.
- [ ] Tests: integration (maker-checker, out-of-band escalation) + e2e (full chain).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
