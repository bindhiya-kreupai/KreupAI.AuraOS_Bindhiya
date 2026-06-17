# Gap Analysis: EPIC-23-S08 — Worker welfare facilities & transport linkage

> **✅ SHIPPED 2026-06-17** — Themes E + F + I closure. Workforce extensions: ContractorAssignment (cross-domain), EmployeeLoanSchedule (amortized), UniformPpeIssuance register, AccommodationTransportRoute / Clinic / MaintenanceTicket (SLA-tracked). BenefitCatalogue extended with EDUCATION / RELOCATION / WELLNESS_EAP. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** HR Admin, **I want** to track welfare facilities and link accommodation to transport, **so that** rest, recreation, laundry, prayer and connectivity facilities are provided and worker transport to site is recorded.

**Description**
Register welfare facilities (recreation, laundry, prayer rooms, internet, common rooms, cooling) per accommodation, and link each accommodation to its worker-transport arrangement (route, vehicle, journey duration) coordinating with EPIC-22 transport benefit.

**Covers:** 23.15, 23.17
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given an accommodation, when configured, then mandatory welfare facilities are checklisted and missing facilities flagged.
- [ ] Given a transport linkage, when recorded, then route, vehicle, pickup times and journey duration are stored and excessive travel time is flagged.
- [ ] Given a welfare-facility deficiency, then a corrective action is created.
- [ ] Given any welfare/transport record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `welfare_facility`, `accommodation_transport_link` schema
- [ ] Backend: facility-completeness + travel-time check service
- [ ] Frontend: welfare facilities checklist + transport linkage screen
- [ ] Rules/Config: mandatory facilities + max journey time per country
- [ ] Tests: unit (completeness/travel-time)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
