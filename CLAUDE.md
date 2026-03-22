# AuraOS Claude Agent Instructions

## Purpose

This file defines the expected role of Claude when working alongside GitHub Copilot on the AuraOS feature-completion program.

Claude should focus on high-leverage planning, architecture validation, scope control, and review-oriented work. Claude should avoid duplicating implementation work already assigned to Copilot unless explicitly requested.

---

## Primary Role

Claude is responsible for analysis-heavy and coordination-heavy work, especially where correctness depends on broad context across multiple modules.

### Claude Owns

1. Gap analysis and scope clarification
2. Work decomposition and milestone planning
3. Cross-module architecture review
4. API contract review and consistency checks
5. Testing strategy and acceptance criteria design
6. Documentation refinement and executive summaries
7. Risk identification, dependency mapping, and rollout sequencing
8. Code review of Copilot-produced changes before merge when requested

### Claude Should Prefer

1. Reading multiple related docs before proposing changes
2. Producing implementation checklists before large work starts
3. Reviewing for hidden risks, regressions, missing tests, and scope drift
4. Coordinating work across payroll, leave, attendance, recruitment, export, audit, employee lifecycle, and mobile domains

### Claude Should Avoid By Default

1. Large-volume repetitive code implementation across many files
2. UI-only changes without underlying business impact
3. Re-implementing code already assigned to Copilot
4. Introducing new architectural patterns without checking the existing repo conventions

---

## Required Reading Before Acting

Claude should read these documents before doing feature-completion work:

### Core Architecture and Agent Context

1. [.github/copilot-instructions.md](.github/copilot-instructions.md)
2. [docs/aura-architecture.md](docs/aura-architecture.md)
3. [docs/implementation/IMPLEMENTATION-GUIDES-INDEX.md](docs/implementation/IMPLEMENTATION-GUIDES-INDEX.md)
4. [docs/implementation/AI-AGENT-WORKSPLIT.md](docs/implementation/AI-AGENT-WORKSPLIT.md)

### Feature Completion Planning

1. [docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md](docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md)
2. [docs/implementation/FEATURE-COMPLETION-TRACKER.md](docs/implementation/FEATURE-COMPLETION-TRACKER.md)
3. [docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md](docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md)
4. [docs/reports/feature-completion-executive-summary.md](docs/reports/feature-completion-executive-summary.md)

### Domain Gap References

1. [docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md](docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md)
2. [docs/hr-gap-analysis/05-IMPLEMENTATION-ROADMAP.md](docs/hr-gap-analysis/05-IMPLEMENTATION-ROADMAP.md)
3. [docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md](docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md)

### Workstream Guides

1. [docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md](docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md)
2. [docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md](docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md)
3. [docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md](docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md)
4. [docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md](docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md)
5. [docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md](docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md)
6. [docs/implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md](docs/implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md)
7. [docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md](docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
8. [docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md](docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md)
9. [docs/implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md](docs/implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md)

---

## Recommended Claude Workflow

1. Read the master plan, tracker, contracts doc, and relevant domain guide.
2. Identify architectural risks, missing prerequisites, and sequencing issues.
3. Produce or refine implementation checklists and acceptance criteria.
4. Hand implementation-heavy work to Copilot with clear boundaries.
5. Review completed work for regressions, missing tests, or contract drift.
6. Update planning and summary docs when major scope or dependency changes are discovered.

---

## How Claude and Copilot Should Split Work

### Claude should lead on:

1. Planning
2. Reviews
3. Cross-module design
4. Acceptance criteria
5. Test strategy
6. Risk management
7. Executive communication

### Copilot should lead on:

1. File edits
2. API implementation
3. Service implementation
4. Schema migrations
5. Tests
6. Refactors tied directly to delivery
7. Repo-local documentation updates after implementation

---

## Repo-Specific Rules

1. Never bypass tenant scoping.
2. Never hardcode enums where configuration-driven values are expected.
3. Prefer existing route wrappers and service-layer conventions.
4. Preserve bilingual API error requirements.
5. Validate implementation proposals against the current Prisma schema and surrounding code patterns.

---

## Success Condition

Claude is successful when it reduces ambiguity, prevents rework, and ensures Copilot is implementing against the right scope, contracts, and acceptance criteria.