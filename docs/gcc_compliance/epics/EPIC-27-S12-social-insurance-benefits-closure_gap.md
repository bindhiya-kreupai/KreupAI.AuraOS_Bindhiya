# Gap Analysis: EPIC-27-S12 — Social Insurance & Benefits Closure

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5

**Description**
Orchestrates social-insurance closure (GOSI/GPSSA/SIO/PASI deregistration, final contribution, EOSB-funding alignment) and benefits closure (medical insurance termination, life/accident cover, air-ticket, housing/transport, mobile, loan settlement linkage), each tracked to confirmation and reflected in final settlement.

**Covers:** 27.21, 27.22
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation, when finalised, then a social-insurance deregistration task per country (GOSI/GPSSA/SIO) is created and tracked with final-contribution reconciliation.
- [ ] Given benefits, when closure runs, then medical insurance and other benefits are terminated effective the correct date with vendor notification.
- [ ] Given outstanding benefit-linked recoveries (e.g. loan, ticket clawback), when present, then they feed final settlement.
- [ ] Given country-specific timing, when applicable, then deregistration deadlines are enforced with alerts.
- [ ] Given any closure event, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: social-insurance + benefits closure orchestrators integrating EPIC-13/14/15 and EPIC-22.
- [ ] Backend: final-contribution reconciliation + recovery feed.
- [ ] Frontend: closure tracker (social insurance + benefits) within case.
- [ ] Rules/Config: per-country deregistration deadlines and benefit rules.
- [ ] Alerts/Workflow: vendor notifications + deadline alerts.
- [ ] Tests: integration (deregistration tracking), unit (recovery feed).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
