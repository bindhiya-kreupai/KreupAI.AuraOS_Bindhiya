# Gap Analysis: EPIC-32-S10 — Policy exception management

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5
**User story:** Line Manager, **I want** to request and track approved exceptions to a policy, **so that** legitimate deviations are authorised, time-bound and auditable rather than informal.

**Description**
Implements the exception workflow: a request against a specific policy/clause, maker-checker approval, validity window, conditions, and an exception register. Exceptions expire automatically and are surfaced to audit and risk.

**Covers:** 32.22
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an exception request, when submitted, then it captures policy, clause, justification, employee(s)/scope, requested validity and routes for approval.
- [ ] Given an approved exception, then it has a start/end date, auto-expires, and notifies before expiry.
- [ ] Given maker-checker, then the requester cannot approve their own exception.
- [ ] Given the exception register, then all active/expired exceptions are listed, filterable by policy/entity/risk.
- [ ] Given an expired exception, then the affected employees revert to the standard policy and the change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_exception` (policyId, clauseRef, scope, justification, validFrom, validTo, status, approverId) entity + migration.
- [ ] Backend: approval + auto-expiry service.
- [ ] Frontend: exception request form + exception register view.
- [ ] Rules/Config: approval authority by exception risk level.
- [ ] Alerts/Workflow: pre-expiry and expiry notifications.
- [ ] Tests: integration (maker-checker, auto-expiry).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
