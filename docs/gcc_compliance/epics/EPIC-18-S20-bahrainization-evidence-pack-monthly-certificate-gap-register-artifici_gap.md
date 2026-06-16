# Gap Analysis: EPIC-18-S20 — Bahrainization evidence pack + monthly certificate, gap register & artificial-Bahrainization risk register

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a one-click Bahrainization evidence pack containing the monthly compliance certificate, gap register and artificial-Bahrainization risk register, **so that** we are inspection-ready and can certify our ratio.

**Description**
Assembles a period evidence pack: ratio calculation with denominator, per-Bahraini SIO/payroll evidence, counting-eligibility, onboarding controls, certificate, permit/tender eligibility, audit checklist and KPIs — plus three configurable digital artefacts exporting to PDF/Excel: (1) **Monthly Bahrainization Compliance Certificate** (entity, sector, period, denominator, numerator, ratio, target, gap, status, authorised signatory), (2) **Bahrainization Gap Register** (per department/role gap, required vs. current Bahrainis, root cause, planned action, owner, due date), and (3) **Artificial Bahrainization Risk Register** (flagged Bahraini, signal type, SIO/payroll/attendance evidence, severity, disposition, owner).

**Covers:** 18.24, 18.25, 18.26, 18.27
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

- [ ] Given a closed period, when the pack is generated, then it bundles ratio calc, per-Bahraini evidence, counting-eligibility, certificate, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, numerator, ratio, target, gap, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each line shows required vs. current Bahrainis, root cause, planned action, owner and due date, editable as a configurable digital form.
- [ ] Given the artificial-Bahrainization risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_evidence_pack`, `bahrainization_certificate_doc`, `bahrainization_gap_register`, `artificial_bahrainization_risk_register` entities.
- [ ] Backend: pack assembly service pulling ratio/evidence/certificate/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + artificial-Bahrainization risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
