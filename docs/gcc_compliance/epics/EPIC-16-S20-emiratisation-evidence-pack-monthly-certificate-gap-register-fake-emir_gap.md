# Gap Analysis: EPIC-16-S20 — Emiratisation evidence pack + monthly certificate, gap register & fake-Emiratisation risk register

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a one-click Emiratisation evidence pack containing the monthly compliance certificate, gap register and fake-Emiratisation risk register, **so that** we are inspection-ready and can certify our position.

**Description**
Assembles a period evidence pack: target calculation with denominator, per-national GPSSA/payroll/WPS evidence, onboarding controls, checkpoint snapshots, audit checklist, KPIs — plus three configurable digital artefacts that export to PDF/Excel: (1) **Monthly Emiratisation Compliance Certificate** (entity, period, denominator, target, achieved, gap, status, authorised signatory), (2) **Emiratisation Gap Register** (per role/department gap, required vs. current, planned action, owner, due date), and (3) **Fake Emiratisation Risk Register** (flagged national, signal type, GPSSA/payroll/WPS evidence, severity, disposition, owner).

**Covers:** 16.22, 16.23, 16.24, 16.25
**Acceptance criteria count:** 6 · **Task count:** 7

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when the pack is generated, then it bundles target calc, per-national evidence, checkpoint snapshots, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, target, achieved, gap, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each gap line shows required vs. current, root cause, planned action, owner and due date, and is editable as a configurable digital form.
- [ ] Given the fake-Emiratisation risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_evidence_pack`, `emiratisation_certificate`, `emiratisation_gap_register`, `fake_emiratisation_risk_register` entities.
- [ ] Backend: pack assembly service pulling target/evidence/checkpoint/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + fake-Emiratisation risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
