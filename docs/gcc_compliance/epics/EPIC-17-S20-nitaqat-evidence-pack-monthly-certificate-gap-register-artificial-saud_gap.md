# Gap Analysis: EPIC-17-S20 — Nitaqat evidence pack + monthly certificate, gap register & artificial-Saudization risk register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a one-click Nitaqat evidence pack containing the monthly compliance certificate, Saudization gap register and artificial-Saudization risk register, **so that** we are inspection-ready and can certify our band.

**Description**
Assembles a period evidence pack: ratio/band calculation with denominator, per-Saudi Qiwa/GOSI/Mudad/payroll evidence, profession-localization status, certificate, audit checklist and KPIs — plus three configurable digital artefacts exporting to PDF/Excel: (1) **Monthly Nitaqat Compliance Certificate** (entity, activity/size, period, denominator, numerator, ratio, band, distance-to-next-band, status, authorised signatory), (2) **Saudization Gap Register** (per department/profession gap, required vs. current Saudis, root cause, planned action, owner, due date), and (3) **Artificial Saudization Risk Register** (flagged Saudi, signal type, Qiwa/GOSI/Mudad/payroll evidence, severity, disposition, owner).

**Covers:** 17.22, 17.23, 17.24, 17.25
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

- [ ] Given a closed period, when the pack is generated, then it bundles ratio/band calc, per-Saudi evidence, profession-localization, certificate, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, numerator, ratio, band, next-band distance, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each line shows required vs. current Saudis, root cause, planned action, owner and due date, editable as a configurable digital form.
- [ ] Given the artificial-Saudization risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

## Implementation Tasks From Backlog

- [ ] Backend: `nitaqat_evidence_pack`, `nitaqat_certificate_doc`, `saudization_gap_register`, `artificial_saudization_risk_register` entities.
- [ ] Backend: pack assembly service pulling ratio/band/evidence/certificate/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + artificial-Saudization risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
