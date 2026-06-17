# Gap Analysis: EPIC-24-S17 — HSE audit checklist & risk matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**User story:** Internal Auditor, **I want** a configurable HSE audit checklist and risk matrix, **so that** I can verify HSE compliance, flag red flags and maintain an HSE risk register.

**Description**
Digital HSE audit checklist (valid permits, current training/PPE, drills done, certificates valid, midday-break adherence) and a configurable risk matrix/register with likelihood×severity scoring and red-flag rules from live data.

**Covers:** 24.23, 24.25
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts
- apps/web/src/app/api/v1/compliance/audit/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit checklist, when run, then items auto-evaluate against live data (e.g. "no expired fire certificate", "no overdue safety training", "no midday-break violation") and flag fails.
- [ ] Given the risk matrix, then risks are scored likelihood×severity, rated, and assigned owners/mitigations.
- [ ] Given a red-flag rule (e.g. open high-severity incident, expired permit, training gap), then a risk-register entry is auto-created.
- [ ] Given a completed audit, then it is timestamped, signed off and exportable.
- [ ] Given any checklist/risk change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `hse_audit_checklist`, `hse_risk_register` schema with scoring
- [ ] Backend: red-flag rule engine over HSE data
- [ ] Frontend: audit checklist runner + risk matrix/heatmap
- [ ] Rules/Config: checklist items, red-flag thresholds, scoring bands
- [ ] Tests: unit (auto-evaluation/scoring)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
