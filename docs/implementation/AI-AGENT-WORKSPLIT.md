# AuraOS AI Agent Work Split

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Engineering Team  
**Status**: Active Collaboration Guide

---

## Purpose

This document defines how Claude AI and GitHub Copilot should split work while delivering the AuraOS feature-completion program.

The goal is to avoid duplicated effort and ensure each agent works in the area where it provides the most value.

---

## Principles

1. Claude handles planning-heavy and review-heavy work.
2. Copilot handles implementation-heavy and repo-edit-heavy work.
3. Both agents must work from the same source documents.
4. Claude should reduce ambiguity before large implementation begins.
5. Copilot should execute changes in the repository once scope is clear.

---

## Claude Responsibilities

Claude should own the following:

1. Gap analysis
2. Work breakdown and sequencing
3. Architecture validation
4. API contract review
5. Test strategy design
6. Acceptance criteria definition
7. Executive summary and leadership communication
8. Review of completed implementation work when requested

### Claude Typical Outputs

1. Implementation plans
2. Risk registers
3. Decision records
4. Review findings
5. Test plans
6. Scope clarifications

---

## Copilot Responsibilities

Copilot should own the following:

1. Code implementation
2. File creation and updates
3. Schema and service changes
4. API route implementation
5. Tests and validation
6. Local documentation updates tied directly to code delivery
7. Incremental refactors required to make features operational

### Copilot Typical Outputs

1. Working code changes
2. Tests
3. Migrations
4. Service-layer implementations
5. API integrations
6. Updated repo docs

---

## Shared Reading List

Before either agent works on the feature-completion program, read:

1. [IMPLEMENTATION-GUIDES-INDEX.md](./IMPLEMENTATION-GUIDES-INDEX.md)
2. [FEATURE-COMPLETION-MASTER-PLAN.md](./FEATURE-COMPLETION-MASTER-PLAN.md)
3. [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md)
4. [FEATURE-COMPLETION-API-CONTRACTS.md](./FEATURE-COMPLETION-API-CONTRACTS.md)
5. [../reports/feature-completion-executive-summary.md](../reports/feature-completion-executive-summary.md)
6. [../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md](../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md)
7. [../qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md](../qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md)
8. [../../.github/copilot-instructions.md](../../.github/copilot-instructions.md)
9. [../../CLAUDE.md](../../CLAUDE.md)
10. [AI-AGENT-WORKSTREAM-PROMPTS.md](./AI-AGENT-WORKSTREAM-PROMPTS.md)
11. [AI-AGENT-EXECUTION-PLAYBOOK.md](./AI-AGENT-EXECUTION-PLAYBOOK.md)

---

## Domain Guide Mapping

### Core Services

Planning and review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-CORE-SERVICE-COMPLETION.md](./GUIDE-CORE-SERVICE-COMPLETION.md)

### Leave

Planning and policy review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-LEAVE-ENGINE-COMPLETION.md](./GUIDE-LEAVE-ENGINE-COMPLETION.md)

### Attendance

Workflow and architecture review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-ATTENDANCE-COMPLETION.md](./GUIDE-ATTENDANCE-COMPLETION.md)

### Payroll

Calculation design and scope control lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-PAYROLL-ENGINE-COMPLETION.md](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)

### Recruitment

Workflow review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-RECRUITMENT-COMPLETION.md](./GUIDE-RECRUITMENT-COMPLETION.md)

### Export and Reporting

Data contract and operational review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-EXPORT-REPORTING-COMPLETION.md](./GUIDE-EXPORT-REPORTING-COMPLETION.md)

### Audit and Compliance

Security and compliance review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-AUDIT-COMPLIANCE-COMPLETION.md](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)

### Employee Lifecycle History

Schema and event model review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md](./GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md)

### Mobile Integration

Contract and release-readiness review lead: Claude  
Implementation lead: Copilot  
Guide: [GUIDE-MOBILE-INTEGRATION-COMPLETION.md](./GUIDE-MOBILE-INTEGRATION-COMPLETION.md)

---

## Handoff Model

### Claude to Copilot

When Claude finishes planning or review work, the handoff should include:

1. Scope boundary
2. Files or modules to touch
3. Acceptance criteria
4. Test expectations
5. Known risks
6. Required documents to re-read before editing

### Copilot to Claude

When Copilot completes implementation work and Claude is asked to review, the handoff should include:

1. Files changed
2. Behavioral summary
3. Tests added or run
4. Known compromises or deferred items
5. Questions needing architectural confirmation

---

## Anti-Patterns

Avoid the following:

1. Both agents editing the same scope independently without a handoff
2. Claude redoing implementation already assigned to Copilot
3. Copilot implementing large features without reading the relevant workstream guide
4. Either agent changing API contracts without updating the contracts document
5. Declaring a workstream complete without checking the release gates in the tracker

---

## Success Condition

This collaboration model is successful when:

1. Claude reduces ambiguity and catches design flaws early
2. Copilot delivers repo-ready implementation efficiently
3. The tracker and master plan stay aligned with actual delivery
4. Both agents work from the same source of truth