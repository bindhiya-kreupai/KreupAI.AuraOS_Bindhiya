# Gap Analysis: EPIC-06-S06 — Country-specific onboarding requirements (rule-engine driven)

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** onboarding steps to adapt to each GCC country's authority requirements via the rule engine, **so that** UAE, KSA, Bahrain, Qatar, Oman and Kuwait hires meet local obligations without code changes.

**Description**
Configure country onboarding rule sets: UAE (MOHRE work permit activation, Emirates ID/ICP linkage, medical, Tawjeeh/Emiratisation tagging), KSA (Qiwa contract authentication, Iqama linkage, GOSI registration, Saudization classification), Bahrain (LMRA permit, CPR, SIO), Qatar (QID, WPS enrolment), Oman (PASI/PASS, resident card), Kuwait (PAM/PIFSS). Rules drive required tasks, document items and downstream triggers.

**Covers:** 6.8
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Implemented - pending migration/operational verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616103000_add_country_onboarding_rules/migration.sql
- apps/web/src/lib/services/country-onboarding-rule.service.ts
- apps/web/src/lib/services/**tests**/country-onboarding-rule.service.test.ts
- apps/web/src/app/api/v1/onboarding/country-rules/route.ts
- apps/web/src/app/api/v1/onboarding/country-rules/[id]/activation-gate/route.ts
- apps/web/src/app/dashboard/onboarding/country-rules/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Decide whether to keep the seeded GCC rule JSON managed through the new rule API/page for MVP or add a richer admin editor with field-level rule validation.
- Wire `getActivationGate(...)` into the final employee activation transition once that transition endpoint is selected.

## Acceptance Criteria To Verify

- [ ] Given a case country, when onboarding starts, then the country-specific task set and document requirements are instantiated from the rule engine.
- [ ] Given a KSA hire, when contract data is ready, then a Qiwa contract-authentication task and GOSI registration trigger are required before activation.
- [ ] Given a UAE hire, when activated, then MOHRE work-permit linkage and Emiratisation classification (national/expat) are captured.
- [ ] Given configuration change to a country rule, when saved, then new cases use the new rule version while in-flight cases retain their bound version.
- [ ] Given missing country-mandatory items, then activation/enrolment stages are blocked.
- [ ] Given audit, then the applied rule version per case is traceable.

## Implementation Tasks From Backlog

- [ ] Backend: `country_onboarding_rule` config + rule resolver service.
- [ ] Backend: task/document instantiation keyed by country + employment type + nationality.
- [ ] Frontend: country-rule configuration UI (System Admin) and per-case country task panel.
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait rule sets with authority references.
- [ ] Tests: rule-resolution + version-binding tests per country.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/country-onboarding-rule.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after a seeded tenant has onboarding instances and employee compliance details for each GCC country.
