# Gap Analysis: EPIC-06-S03 — Pre-joining checklist & document collection

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
A country/entity/employment-type-driven pre-joining checklist (passport, photo, educational certificates with attestation, prior visa/cancellation, NOC, bank details, dependents, etc.). Candidate completes a self-service pre-boarding portal; HR validates and signs off. Checklist completeness gates the Joining-Day stage.

**Covers:** 6.5
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a case country/type, when the pre-joining stage opens, then the correct checklist items (mandatory/optional) are instantiated from the template.
- [ ] Given the new hire uploads a document, when validation runs, then file type, expiry date and required attestation are checked and invalid items rejected with reason.
- [ ] Given a UAE/KSA hire, when prior employment exists, then cancellation/visa-transfer evidence (or NOC where applicable) is required before sign-off.
- [ ] Given all mandatory items complete & validated, then HR can sign off and the case may advance; otherwise advancement is blocked.
- [ ] Given any upload/validation/sign-off, then the action is audit-logged with actor and timestamp.
- [ ] Given RBAC, then only HR Admin/Manager can override a missing optional item with a recorded justification.

## Implementation Tasks From Backlog

- [ ] Backend: `onboarding_checklist_item` (case_id, code, category, mandatory, status, document_id, expiry_date, validated_by).
- [ ] Backend: checklist instantiation + validation service (expiry, attestation flags).
- [ ] Frontend: candidate pre-boarding portal + HR validation screen.
- [ ] Rules/Config: country/entity/type checklist templates incl. attestation requirements.
- [ ] Alerts/Workflow: reminders to candidate for pending items; HR sign-off workflow.
- [ ] Tests: template resolution, validation, gating integration tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
