# Gap Analysis: EPIC-08-S06 — Data privacy, confidentiality & sensitivity classification

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** records classified by sensitivity with privacy controls and consent handling, **so that** personal and sensitive data are protected per GCC PDPL/data-protection laws.

**Description**
Classify fields/documents by sensitivity (public/internal/confidential/restricted; special categories like medical, disciplinary). Enforce masking, purpose-limited access, consent capture for processing, data-subject request support (access/correction) and breach-relevant logging. Special-category records (medical, grievance) get elevated protection.

**Covers:** 8.9
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useToast.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a field/document, when classified, then sensitivity drives masking and access eligibility.
- [ ] Given a non-privileged viewer, when accessing a restricted field, then it is masked/blocked and the attempt is logged.
- [ ] Given consent-required processing, when consent is absent, then the processing/visibility is restricted.
- [ ] Given a data-subject access/correction request, when raised, then a workflow gathers the data and tracks fulfilment within the configured window.
- [ ] Given special-category records, then elevated access rules apply.
- [ ] Given audit, then all sensitive-data access is logged with actor, field and purpose.

## Implementation Tasks From Backlog

- [ ] Backend: sensitivity classification on fields/docs + masking service; consent + DSAR entities.
- [ ] Backend: purpose-limited access enforcement + access logging.
- [ ] Frontend: masked views + DSAR workflow screen.
- [ ] Rules/Config: PDPL-aligned classification + consent rules per country.
- [ ] Alerts/Workflow: DSAR SLA tracking; restricted-access alerts.
- [ ] Tests: masking, consent-gate, DSAR, access-log tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
