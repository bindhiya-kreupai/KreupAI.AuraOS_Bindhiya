# Gap Analysis: EPIC-32-S05 — Governance & compliance policy set (Data Privacy, Anti-Harassment, Disciplinary, Grievance, IT/Acceptable Use)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** the governance and conduct policies configured with their reporting and escalation hooks, **so that** the policy text matches the live grievance, disciplinary and data-privacy processes.

**Description**
Configures Data Privacy, Anti-Harassment, Disciplinary, Grievance and IT/Acceptable Use policies. Each links to its operating process: data privacy to the consent/access-control model (EPIC-08/30), anti-harassment/grievance to the intake channels (EPIC-25), disciplinary to the penalty matrix (EPIC-26), IT/AUP to access-closure (EPIC-27).

**Covers:** 32.11, 32.12, 32.13, 32.14, 32.16
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/grievance/components/Toast.tsx
- apps/web/src/app/dashboard/grievance/services.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given the Data Privacy policy, then lawful-basis, retention and data-subject-rights clauses align with the retention schedule (EPIC-30).
- [ ] Given the Anti-Harassment and Grievance policies, then they reference the confidential complaint channels and non-retaliation controls (EPIC-25).
- [ ] Given the Disciplinary policy, then it references the misconduct classification and penalty matrix (EPIC-26).
- [ ] Given the IT/Acceptable Use policy, then acceptable-use, monitoring-notice and access-revocation clauses are configurable.
- [ ] Given mandatory policies, then they are flagged "mandatory acknowledgement" so no employee can be active without an acknowledgement on record.

## Implementation Tasks From Backlog

- [ ] Backend: process-hook links (grievance intake, disciplinary matrix, retention schedule, access control).
- [ ] Backend: "mandatory" flag and enforcement check on employee activation.
- [ ] Frontend: policy templates for the five governance policies.
- [ ] Rules/Config: country data-privacy clause variants.
- [ ] Tests: integration (mandatory-ack enforcement, process-hook resolution).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
