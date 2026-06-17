# Gap Analysis: EPIC-23-S09 — Medical & emergency controls

> **✅ SHIPPED 2026-06-17** — Themes E + F + I closure. Workforce extensions: ContractorAssignment (cross-domain), EmployeeLoanSchedule (amortized), UniformPpeIssuance register, AccommodationTransportRoute / Clinic / MaintenanceTicket (SLA-tracked). BenefitCatalogue extended with EDUCATION / RELOCATION / WELLNESS_EAP. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** to manage medical and emergency controls per accommodation, **so that** first-aid provision, clinic access, emergency contacts and response readiness are evidenced.

**Description**
Track on-site medical provision (first-aid kits/rooms, trained first-aiders, nearest clinic/hospital, ambulance access), emergency contact boards and emergency response plans, aligned with EPIC-24 emergency preparedness/first aid.

**Covers:** 23.16
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given an accommodation, when configured, then required first-aid resources and trained first-aiders per occupancy are checklisted and gaps flagged.
- [ ] Given emergency information, then emergency contacts, nearest hospital and response plan are recorded and current.
- [ ] Given a first-aid kit, when expiry/restock is due, then an alert is raised.
- [ ] Given a medical/emergency deficiency, then a corrective action is created.
- [ ] Given any record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `medical_provision`, `emergency_plan`, `first_aider` link schema
- [ ] Backend: first-aider-ratio + kit-expiry service
- [ ] Frontend: medical & emergency controls screen
- [ ] Rules/Config: first-aider ratios + kit contents per country
- [ ] Alerts/Workflow: kit-expiry alerts; deficiency → corrective action
- [ ] Tests: unit (ratio/expiry)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
