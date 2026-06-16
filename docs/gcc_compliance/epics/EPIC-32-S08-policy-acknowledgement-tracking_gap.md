# Gap Analysis: EPIC-32-S08 — Policy acknowledgement tracking

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** verifiable acknowledgement capture against the exact policy version, **so that** I can prove enforceability in any labour dispute or audit.

**Description**
Implements the acknowledgement workflow: read-confirm with version binding, signed evidence (e-signature/typed name + timestamp + IP), re-acknowledgement on version change, and completion dashboards by entity/department. This is the enforceability backbone of the engine.

**Covers:** 32.20
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

- [ ] Given an assigned mandatory policy, when the employee confirms, then the acknowledgement records employeeId, policyVersionId, contentHash, timestamp, channel and IP.
- [ ] Given a republished version, then prior acknowledgers are re-targeted for re-acknowledgement and shown as "stale" until they re-confirm.
- [ ] Given a non-responder past SLA, then escalation alerts go to the line manager and HR.
- [ ] Given an auditor, then acknowledgement status is queryable and exportable per employee/policy/version.
- [ ] Given RBAC, then employees can only acknowledge their own assignments and cannot back-date.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_acknowledgement` (employeeId, policyVersionId, contentHash, signedName, signedAt, channel, ipAddress) entity + migration.
- [ ] Backend: re-acknowledgement trigger on version supersede; SLA escalation service.
- [ ] Frontend: acknowledgement screen (read-confirm + e-sign) and completion dashboard.
- [ ] Rules/Config: acknowledgement SLA and escalation chain.
- [ ] Alerts/Workflow: non-responder escalation to manager/HR.
- [ ] Tests: unit (version binding), integration (re-ack on republish, SLA escalation), e2e (sign flow).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
