# Gap Analysis: EPIC-01-S06 — Common HR challenges as a configurable compliance-risk register

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** the handbook's common GCC HR challenges and regional compliance risks captured as a configurable risk register, **so that** the organisation can track, own, and mitigate them rather than discover them in an audit.

**Description**
Turns the descriptive "common challenges" and "regional compliance risks" sections into a structured, ownable register: each risk has a category (e.g., nationalization shortfall, WPS/salary delay, visa/permit expiry, document-retention gap), likelihood, impact, owner, mitigation, and status, scopeable per country.

**Covers:** 1.3, 1.4
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the register is seeded, when viewed, then it contains the handbook's regional risk themes (nationalization, wage protection, immigration validity, social insurance, record-keeping) as starter entries.
- [ ] Given a risk, when created/edited, then likelihood × impact produces a computed risk score and rating band.
- [ ] Given a risk, then it can be scoped to specific countries/entities and assigned an owner persona.
- [ ] Given a risk marked high/critical, then an alert is raised to the Compliance Officer and Executive roles.
- [ ] Given any change to a risk entry, then it is captured in the audit trail.
- [ ] Given RBAC, then only Compliance Officer/HR Manager/System Administrator may edit; Executives may view.

## Implementation Tasks From Backlog

- [ ] Backend: `RiskRegister` (risk_id, category, description, likelihood, impact, score, rating, owner_role, country_scope, mitigation, status) schema + migration.
- [ ] Backend: scoring service and high-risk event emitter.
- [ ] Frontend: risk register list + edit screen with computed score badge.
- [ ] Rules/Config: seed regional risk themes; configurable likelihood/impact scales and rating bands.
- [ ] Alerts/Workflow: notification on high/critical risk creation or status change.
- [ ] Tests: unit tests for scoring and seed coverage of regional risk themes.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
