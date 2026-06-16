# Gap Analysis: EPIC-32-S01 — Policy engine foundation, governance & structure template

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a governed policy document model built on a standard structure template with an approval framework, **so that** every HR policy is authored consistently and only takes effect after the right owners approve it.

**Description**
Establishes the core `Policy` and `PolicySection` domain backing the AuraOS Policy Engine, the RACI-style governance framework (owner, approver, reviewer), and a standard structure template (purpose, scope, definitions, policy statements, roles, related policies, effective date). This is the foundation all later stories build on, and it encodes the objectives and governance principles of the chapter.

**Covers:** 32.1, 32.2, 32.3, 32.4
**Acceptance criteria count:** 5 · **Task count:** 7

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a new policy, when the author selects the structure template, then mandatory sections (Purpose, Scope, Definitions, Policy Statement, Roles & Responsibilities, Effective Date, Owner) are pre-populated and cannot be removed.
- [ ] Given a policy in draft, when it is submitted, then it routes through the configured governance chain (Policy Owner → HR Head → Legal/Compliance) and cannot be published until all required approvals are captured.
- [ ] Given an approval, when an approver acts, then their identity, decision, comments and timestamp are written to the audit trail and the preparer cannot also be the approver (maker-checker).
- [ ] Given RBAC, then only Policy Authors can edit drafts, only Approvers can approve, and Employees have read-only access to published policies.
- [ ] Given the objectives configuration, then each policy records its compliance objective and governing GCC authority reference (MOHRE/MHRSD/LMRA/etc.) for traceability.

## Implementation Tasks From Backlog

- [ ] Backend: `policy` (policyCode, title, module, ownerId, approverChain, governingAuthority, status, currentVersionId) and `policy_section` (policyId, sectionType, sequence, bodyRichText) entities + migration.
- [ ] Backend: structure-template service that seeds mandatory sections and validates completeness before submit.
- [ ] Backend: governance/approval service integrating the workflow engine with maker-checker enforcement.
- [ ] Frontend: Policy authoring workspace (admin portal) with section editor and template guardrails.
- [ ] Rules/Config: configurable approval chains per policy type and per legal entity.
- [ ] Alerts/Workflow: approval routing + pending-approval notifications.
- [ ] Tests: unit (template completeness, maker-checker), integration (approval routing → publish gate).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
