# Gap Analysis: EPIC-24-S19 — Monthly HSE compliance pack, certificate & corrective action register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to generate a monthly HSE compliance pack with a sign-off certificate and corrective action register, **so that** management can certify HSE compliance and auditors/authorities have dated evidence.

**Description**
Auto-compile a monthly HSE pack (incidents, injuries, training, permits, drills, certificates, corrective actions, KPIs) with the Sample HSE Monthly Compliance Certificate and the Sample Corrective Action Register, plus a key-takeaways summary, with management certification.

**Covers:** 24.28, 24.29, 24.31, 24.32
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given month-end, when the pack is generated, then it includes incidents, injury stats, training/PPE compliance, permits, drills, certificate status and open corrective actions per site/entity.
- [ ] Given the compliance certificate, when signed, then it captures certifying officer, period, scope and is locked/audit-logged.
- [ ] Given the Corrective Action Register, then each action records source (incident/inspection/audit), owner, due date, severity, status and closure evidence.
- [ ] Given an unresolved high-severity action or open reportable incident, then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.

## Implementation Tasks From Backlog

- [ ] Backend: `hse_compliance_pack`, `hse_compliance_certificate` schema; corrective-action aggregation
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer, certificate sign-off, Corrective Action Register export
- [ ] Rules/Config: certification gating rules; action severities
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
