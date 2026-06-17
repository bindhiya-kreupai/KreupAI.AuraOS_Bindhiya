# Gap Analysis: EPIC-30-S03 — Lifecycle Record Type Coverage (Recruitment → Separation)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** every HR record category across the employee lifecycle modelled with its own retention class, sensitivity, trigger event and source linkage, **so that** recruitment, contract, immigration, payroll, WPS, social-insurance, attendance/leave, performance, training, disciplinary/grievance, medical, HSE and separation records are all governed consistently.

**Description**
Configures the full set of HR record categories so each is classified and bound to its source: recruitment records; contract records; immigration records; payroll and wage records; WPS/Mudad and wage-protection records; social-insurance and pension records; attendance and leave records; performance records; training and competency records; disciplinary and grievance records; medical and sensitive records; HSE and work-injury records; separation and final-settlement records. Each category gets its retention class, sensitivity, retention-trigger event (e.g. from termination date, from document date) and the source epic/event that creates it.

**Covers:** 30.7, 30.8, 30.9, 30.10, 30.11, 30.12, 30.13, 30.14, 30.15, 30.16, 30.17, 30.18, 30.19
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/recruitment/InterviewRecording.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given each record category, when configured, then it has a retention class, sensitivity, trigger event and source linkage.
- [ ] Given medical/sensitive and disciplinary/grievance records, then they are flagged highest-sensitivity with restricted access by default.
- [ ] Given payroll/WPS/social-insurance/immigration records, then their statutory retention drivers per country are captured.
- [ ] Given a record created by a source epic, when ingested, then it is auto-classified into the correct category and section.
- [ ] Given separation/final-settlement records, then their retention triggers from the separation date.
- [ ] Given any category configuration change, then it is versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_record_category` config for all lifecycle categories (retentionClass, sensitivity, triggerEvent, sourceRef)
- [ ] Backend: ingestion classifier auto-mapping records from source epics
- [ ] Frontend: record-category configuration matrix across the lifecycle
- [ ] Rules/Config: seed all categories (recruitment→separation) with sensitivity and triggers per country
- [ ] Tests: unit tests for category classification and trigger derivation per category

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
