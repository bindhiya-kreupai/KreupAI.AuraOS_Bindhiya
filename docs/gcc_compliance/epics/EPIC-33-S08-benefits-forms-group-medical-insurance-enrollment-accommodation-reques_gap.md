# Gap Analysis: EPIC-33-S08 — Benefits forms group (medical insurance enrollment, accommodation request, asset issue)

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers the benefits form group feeding EPIC-22/23: Medical Insurance Enrollment (employee + dependents), Accommodation Request (eligibility-based), and Asset Issue Form (asset handover with employee acknowledgement and return obligation).

**Covers:** 33.22, 33.23, 33.24, 33.25
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/app/api/benefits/enrollments/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/decline/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/elect/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/[id]/premium/route.ts
- apps/web/src/app/api/v1/benefits/cobra/enrollments/route.ts
- apps/web/src/app/api/v1/benefits/enrollment/[id]/route.ts
- apps/web/src/app/api/v1/benefits/enrollment/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given the Medical Insurance Enrollment form, then employee and dependent details are captured with mandatory documents, validated against eligibility, and routed to the benefits team/vendor.
- [ ] Given the Accommodation Request form, then eligibility (grade/category) is checked and the request routes to the welfare/accommodation team.
- [ ] Given the Asset Issue form, then issued assets are recorded against the employee and acknowledged via e-signature, creating a return obligation at separation.
- [ ] Given approval, then enrollment/accommodation/asset data writes back to the relevant module and is audited.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + write-back to benefits/accommodation/asset registers.
- [ ] Backend: eligibility validation hooks.
- [ ] Frontend: medical enrollment, accommodation request, asset issue forms.
- [ ] Rules/Config: eligibility rules by grade/category/country.
- [ ] Alerts/Workflow: routing to benefits/welfare teams; return-obligation linkage.
- [ ] Tests: integration (eligibility, write-back, asset-return linkage).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
