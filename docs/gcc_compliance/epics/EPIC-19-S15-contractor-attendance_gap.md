# Gap Analysis: EPIC-19-S15 — Contractor attendance

> **✅ SHIPPED 2026-06-17** — Themes E + F + I closure. Workforce extensions: ContractorAssignment (cross-domain), EmployeeLoanSchedule (amortized), UniformPpeIssuance register, AccommodationTransportRoute / Clinic / MaintenanceTicket (SLA-tracked). BenefitCatalogue extended with EDUCATION / RELOCATION / WELLNESS_EAP. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Capture contractor attendance via assigned capture methods, link to the vendor/contract and site, segregate from employee payroll, and provide reconciliation data for contractor billing and site-access compliance.

**Covers:** 19.18
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a contractor, when registered, then they link to a vendor/contract and site without an employee payroll record.
- [ ] Given contractor punches, when captured, then they are stored and reportable per vendor/site.
- [ ] Given contractor attendance, when aggregated, then it produces vendor-billing/reconciliation data, not employee LOP.
- [ ] Given site-access rules, when a contractor lacks valid status, then attendance is flagged.

## Implementation Tasks From Backlog

- [ ] Backend: `contractor`, `contractor_attendance` schemas (vendor_id, contract_id, site_id)
- [ ] Backend: contractor punch ingestion + vendor reconciliation report service
- [ ] Frontend: contractor register + attendance report screen
- [ ] Rules/Config: site-access validity rules
- [ ] Tests: integration tests for contractor capture and reconciliation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
