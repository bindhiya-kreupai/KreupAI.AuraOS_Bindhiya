# Gap Analysis: EPIC-24-S03 — Risk assessment & hierarchy of controls

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**User story:** HSE Officer, **I want** to conduct risk assessments with likelihood×severity scoring and apply the hierarchy of controls, **so that** hazards are evaluated, controls assigned, and residual risk tracked to an acceptable level.

**Description**
A risk-assessment workflow (HIRA/JSA) for tasks/areas: identify hazards, score initial risk (likelihood × severity), apply controls down the hierarchy (elimination → substitution → engineering → administrative → PPE), compute residual risk, assign owners and review dates.

**Covers:** 24.7, 24.8
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a risk assessment, when created, then hazards are listed with likelihood×severity producing an initial risk rating per a configurable matrix.
- [ ] Given controls, when assigned, then they are classified by hierarchy level and residual risk recalculates.
- [ ] Given residual risk above tolerance, then the assessment cannot be approved until further controls are added or an exception is approved.
- [ ] Given a review date, when due, then a reassessment alert fires.
- [ ] Given any assessment/control change, then it is audit-logged with assessor and approver.

## Implementation Tasks From Backlog

- [ ] Backend: `risk_assessment`, `hazard`, `control_measure` (hierarchy_level) schema with scoring
- [ ] Backend: residual-risk engine + review-due job
- [ ] Frontend: risk-assessment builder + control register
- [ ] Rules/Config: risk matrix bands + tolerance thresholds per country
- [ ] Alerts/Workflow: approval gating + reassessment alerts
- [ ] Tests: unit (scoring/residual) + e2e (gating)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
