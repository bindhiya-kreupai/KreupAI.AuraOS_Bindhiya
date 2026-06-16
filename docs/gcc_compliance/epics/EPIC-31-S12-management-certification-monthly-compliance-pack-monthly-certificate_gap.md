# Gap Analysis: EPIC-31-S12 — Management certification, monthly compliance pack & monthly certificate

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8

**Description**
Period-end certification: management attests to the compliance posture, with a configurable Monthly HR Compliance Certificate and an auto-assembled Monthly HR Compliance Pack (scorecard, domain summaries, heatmap, open corrective actions). E-sign routing and immutable archival.

**Covers:** 31.22, 31.27, 31.30
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx
- apps/web/src/app/dashboard/analytics/report-builder/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when certification is initiated, then the system assembles the pack (scorecard, heatmap, domain dashboards, open actions) for that period and entity.
- [ ] Given a certifier, when they review and sign, then the certificate captures signatory, role, date, and a content hash, and is locked.
- [ ] Given unresolved Red items, when certifying, then the certifier must explicitly acknowledge them with comments.
- [ ] Given a generated certificate/pack, when exported, then it matches the sample layouts and is stored immutably with audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `ComplianceCertification` and `CompliancePack` schema (period, entity, contents, signatory, hash, lockedAt).
- [ ] Backend: pack-assembly service and certificate generation from configurable templates.
- [ ] Frontend: certification workflow screen with pack preview and acknowledgements.
- [ ] Alerts/Workflow: e-sign routing and certification-due reminders.
- [ ] Tests: integration test for pack assembly; e2e for sign-and-lock with content hash.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
