# Gap Analysis: EPIC-01-S02 — GCC labour-market reference dataset

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a maintained reference dataset describing each GCC labour market, **so that** the platform and dashboards have authoritative context (currency, weekend pattern, authorities, expat-dependency profile) per country.

**Description**
Captures the descriptive market context from the handbook overview as structured, versioned reference data (not rules) so screens and reports can render country context consistently and the rule engine has a seed to extend.

**Covers:** 1.2
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given each GCC country, when reference data is loaded, then weekend pattern, statutory currency, primary labour authority, social-insurance authority, and nationalization programme name are present.
- [ ] Given a country profile, when displayed, then its expat-vs-national workforce dependency note and key market characteristics render read-only to business users.
- [ ] Given reference data changes, when saved, then a new version is stored and the previous version retained with effective dates.
- [ ] Given an unsupported country code, when referenced, then the system rejects it.
- [ ] Given any edit, then the audit trail records who changed which country attribute.

## Implementation Tasks From Backlog

- [ ] Backend: `CountryProfile` (country_id, weekend_pattern, labour_authority, social_insurance_authority, nationalization_programme, market_notes, version, effective_from) schema + migration.
- [ ] Backend: seed service populating all six GCC profiles; versioned read API.
- [ ] Frontend: read-only country-context panel reused by landscape dashboard.
- [ ] Rules/Config: seed data for MOHRE/Qiwa/GOSI/GPSSA/LMRA/SIO mapping per country.
- [ ] Tests: unit tests for versioning and seed integrity.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
