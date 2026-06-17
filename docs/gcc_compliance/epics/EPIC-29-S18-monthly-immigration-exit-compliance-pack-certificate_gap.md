# Gap Analysis: EPIC-29-S18 — Monthly Immigration Exit Compliance Pack & Certificate

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a one-click Monthly Immigration Exit Compliance Pack with certificate, **so that** I have a complete sign-off-ready evidence bundle of exit activity and closure each month.

**Description**
Compiles the period's exit artefacts into one downloadable pack: cancellations/transfers completed, grace-period register, open overstay risks, absconding cases, repatriation completions, PRO action register, evidence index, KPI snapshot, and a configurable Monthly Immigration Exit Compliance Certificate auto-populated from period data with e-attestation. Requires sign-off, is versioned and archived for retention.

**Covers:** 29.24
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when the pack is generated, then it includes cancellations/transfers, grace register, overstay risks, absconding cases, repatriation, PRO register, evidence index and KPI snapshot.
- [ ] Given the certificate, when generated, then it auto-populates entity, country, exit counts, overstay/absconding stats and closure %, with e-attestation (name, role, timestamp).
- [ ] Given outstanding overstay/open critical items, when generation is attempted, then they are flagged before sign-off.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata and exports to PDF/Excel.
- [ ] Given any pack/certificate action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: compliance-pack assembler + certificate template engine with period data-binding
- [ ] Backend: immutable archive + retention metadata + e-attestation capture
- [ ] Frontend: pack preview + certificate generate/attest + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack/certificate contents and flagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
