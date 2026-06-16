# Gap Analysis: EPIC-04-S05 — Nationalization compliance during recruitment

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** nationalization-first controls enforced during recruitment, **so that** GCC-national candidates are prioritised and localization targets are advanced before expatriate hires.

**Description**
Applies the entity's localization gap (from EPIC-03) to recruitment: prioritises national candidates in the pipeline, requires documented justification before progressing an expatriate for a nationalization-reserved or gap-entity role, and simulates the localization/Nitaqat-band impact of a prospective hire. Flags fake/artificial localization risk signals (e.g., national hired but not genuinely deployed) for later monitoring.

**Covers:** 4.8
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a gap entity, when expatriate candidates are advanced, then a localization justification is mandatory and recorded.
- [ ] Given national candidates in the pipeline, when present, then they are surfaced/prioritised per configured rule.
- [ ] Given a prospective hire, when evaluated, then localization % / Nitaqat band impact is simulated and shown.
- [ ] Given a UAE/KSA/BH/OM entity, when recruiting, then country-specific nationalization rules apply via the rule engine.
- [ ] Given any nationalization override, when made, then approver, reason and timestamp are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: nationalization-recruitment service reading EPIC-03 localization plan + rule engine.
- [ ] Backend: hire-impact simulation (localization %, Nitaqat band).
- [ ] Frontend: pipeline national-priority indicators + justification capture.
- [ ] Rules/Config: per-country nationalization-during-recruitment rules.
- [ ] Alerts/Workflow: justification/approval workflow for expatriate progression in gap entities.
- [ ] Tests: unit (impact sim) + integration (justification gating).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
