# Gap Analysis: EPIC-29-S19 — Sample Immigration Exit Checklist (Configurable Form)

> **✅ SHIPPED 2026-06-17** — Theme D closure. Default form template added to `hr-forms-compliance` DEFAULT_TEMPLATES with writeback target. Surfaced via existing forms registry, routing, e-signature, and writeback infrastructure. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 3
**User story:** PRO / Immigration Officer, **I want** a configurable Immigration Exit Checklist auto-driven from the case, **so that** every mandatory exit step is tracked, signed off and evidenced per country.

**Description**
Provides a digital, template-driven Immigration Exit Checklist generated from the scenario/country profile: cancellation/transfer steps, passport handling, grace period, dependent closures, repatriation, payroll/benefits/SI closure, and evidence items — each as a checklist line with status, owner, date and evidence link. Configurable per entity/country, bilingual, exports to PDF and attaches to the case and monthly pack.

**Covers:** 29.25
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

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exit case, when generated, then the checklist auto-populates the mandatory steps for that scenario/country with owner and status.
- [ ] Given each item, when completed, then status, date and evidence link are captured and reflected in the completeness score.
- [ ] Given the template, when configured, then items, header/footer and EN/AR layout are editable per entity without code.
- [ ] Given the checklist, then it exports to PDF and attaches to the case and pack.
- [ ] Given any checklist action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: exit-checklist template engine bound to case/scenario/country
- [ ] Backend: PDF export + attachment links + completeness contribution
- [ ] Frontend: checklist runner + template editor (EN/AR)
- [ ] Rules/Config: per-country mandatory checklist items
- [ ] Tests: unit test for auto-population and completeness

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
