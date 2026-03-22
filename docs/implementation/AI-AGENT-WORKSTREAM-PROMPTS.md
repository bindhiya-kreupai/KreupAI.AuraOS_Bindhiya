# AuraOS AI Agent Workstream Prompts

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Engineering Team  
**Status**: Active Prompt Library

---

## Purpose

This document provides ready-to-paste prompts for assigning feature-completion work to Claude and GitHub Copilot.

Use these prompts after reading:

1. [AI-AGENT-WORKSPLIT.md](./AI-AGENT-WORKSPLIT.md)
2. [FEATURE-COMPLETION-MASTER-PLAN.md](./FEATURE-COMPLETION-MASTER-PLAN.md)
3. [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md)
4. [FEATURE-COMPLETION-API-CONTRACTS.md](./FEATURE-COMPLETION-API-CONTRACTS.md)
5. [../../CLAUDE.md](../../CLAUDE.md)
6. [../../.github/copilot-instructions.md](../../.github/copilot-instructions.md)

---

## How To Use

1. Send the Claude prompt first when the workstream still needs planning, acceptance criteria, or architecture review.
2. Send the Copilot prompt after scope, constraints, and test expectations are clear.
3. Reuse the same workstream guide in both prompts so planning and implementation stay aligned.
4. Update the tracker after each major handoff.

---

## Shared Prompt Addendum

Append this block to any prompt when needed:

```text
Important repo constraints:
- Never bypass tenant isolation.
- Never hardcode enums when values should come from configuration.
- Follow existing route wrapper patterns in surrounding code.
- Keep bilingual API errors where required.
- Keep business logic in services, not route handlers.
- Update tests and implementation docs when behavior changes.
```

---

## 1. Core Service Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Your task is to lead planning and review for the Core Service Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. A scope-confirmed implementation checklist
2. A file/module impact map
3. Acceptance criteria
4. Test strategy for backend, API, and UI touchpoints
5. Key risks and sequencing constraints
6. A handoff section for Copilot with explicit implementation boundaries

Focus on identifying remaining mock-backed core service paths and defining the minimum repo changes needed to make them production-real.
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Core Service Completion workstream using the agreed plan and repo conventions.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md

Implement:
1. Replacement of mock-backed production core service logic with real persistence and APIs
2. Minimal schema, service, route, and UI integration changes required for operational use
3. Tests covering the newly real workflows
4. Documentation updates tied directly to the implementation

Constraints:
1. Maintain tenant scoping everywhere
2. Do not introduce new mock fallbacks
3. Preserve surrounding route-wrapper conventions
4. Keep changes minimal and production-focused

Return:
1. Files changed
2. Behavior implemented
3. Tests added or run
4. Remaining risks or deferred items
```

---

## 2. Leave Engine Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Leave Engine Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Policy and ledger design review
2. Scope for accruals, carry-forward, reversals, and balance recomputation
3. Acceptance criteria
4. Test cases covering leave edge cases and country or tenant variability
5. Risks around configuration, policy ambiguity, and backfill behavior
6. Copilot handoff instructions with implementation boundaries
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Leave Engine Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md

Implement:
1. Authoritative leave ledger behavior
2. Accrual, carry-forward, and reversal processing
3. API and service updates needed for trustworthy balances
4. Tests for policy, balance, and recomputation logic

Constraints:
1. Avoid hardcoded leave enums where configuration should drive behavior
2. Preserve tenant isolation and auditability
3. Keep leave calculations reproducible from stored inputs

Return:
1. Files changed
2. Balance and accrual behavior implemented
3. Tests added or run
4. Remaining edge cases or deferred policy items
```

---

## 3. Attendance Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Attendance Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Workflow breakdown for punches, regularization, biometric ingestion, daily attendance, and shift swaps
2. Acceptance criteria
3. Test strategy for timing, conflict handling, and approval flows
4. Risks around shift modeling, roster assumptions, and data reconciliation
5. Copilot handoff with file/module boundaries
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Attendance Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

Implement:
1. Punch persistence and daily attendance processing
2. Regularization and approval flows
3. Biometric ingestion and shift-swap operational paths
4. Tests for attendance correctness and approval behavior

Constraints:
1. Use authoritative service and database-backed logic
2. Preserve auditability for critical write operations
3. Keep API contracts aligned with web and mobile consumers

Return:
1. Files changed
2. Attendance behaviors implemented
3. Tests added or run
4. Remaining known gaps or risks
```

---

## 4. Payroll Engine Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Payroll Engine Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Scope-controlled rollout plan by supported country or statutory regime
2. Acceptance criteria for payroll runs, approvals, payslips, and reconciliation
3. Test strategy for deterministic payroll calculations
4. Risks involving country rules, scope expansion, and financial correctness
5. A Copilot handoff defining which payroll behaviors must be implemented now versus deferred
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Payroll Engine Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md

Implement:
1. Operational payroll run lifecycle
2. Real payroll calculations for the approved release scope
3. Payslip, approval, and reconciliation behavior
4. Tests demonstrating reproducible payroll outputs from stored inputs

Constraints:
1. Keep scope limited to the approved rollout countries or rules
2. Avoid hidden fallback logic for financial calculations
3. Preserve audit and traceability for critical payroll actions

Return:
1. Files changed
2. Payroll behaviors implemented
3. Tests added or run
4. Remaining scope exclusions or risks
```

---

## 5. Recruitment Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Recruitment Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Workflow review for pipeline, interviews, offers, and analytics
2. Acceptance criteria
3. Test strategy for candidate state transitions and role-based permissions
4. Risks related to contract instability and workflow gaps
5. Copilot handoff with explicit implementation boundaries
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Recruitment Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md

Implement:
1. Candidate pipeline operational behavior
2. Interview and offer workflows
3. Analytics paths that depend on authoritative recruitment data
4. Tests for state transitions, permissions, and critical workflow outcomes

Constraints:
1. Preserve tenant and permission boundaries
2. Keep changes consistent with existing service and route patterns
3. Update contracts or docs if API behavior changes

Return:
1. Files changed
2. Recruitment workflows implemented
3. Tests added or run
4. Remaining gaps or deferred items
```

---

## 6. Export and Reporting Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Export and Reporting Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Review of export pipeline scope and authoritative data dependencies
2. Acceptance criteria for export generation, delivery, and report correctness
3. Test strategy covering async jobs and report validation
4. Risks around performance, storage, and contract drift
5. Copilot handoff with the approved implementation scope
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Export and Reporting Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md

Implement:
1. Query-backed export and reporting behavior using authoritative data
2. Async job handling and delivery flow
3. Tests for output correctness and core performance expectations
4. Documentation updates for any changed operational behavior

Constraints:
1. Avoid mock or placeholder export generation in production paths
2. Keep report inputs auditable and tenant-scoped
3. Surface performance risks if query or storage behavior becomes a blocker

Return:
1. Files changed
2. Export and reporting behaviors implemented
3. Tests added or run
4. Performance or scope risks still open
```

---

## 7. Audit and Compliance Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Audit and Compliance Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Review of critical write paths that must emit durable audit events
2. Acceptance criteria for persistence, retrieval, and compliance reporting
3. Test strategy for coverage across sensitive workflows
4. Risks involving incomplete event coverage, retention, and queryability
5. Copilot handoff with clear implementation priorities
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Audit and Compliance Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md

Implement:
1. Durable audit persistence for critical write flows
2. Retrieval and reporting support for audit and compliance use cases
3. Tests for event coverage and access behavior
4. Documentation updates for event expectations and release gates

Constraints:
1. Critical writes must be auditable
2. Keep audit data tenant-safe and permission-aware
3. Avoid partial coverage that falsely suggests completion

Return:
1. Files changed
2. Audit and compliance behavior implemented
3. Tests added or run
4. Remaining coverage gaps or follow-up risks
```

---

## 8. Employee Lifecycle History

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Employee Lifecycle History workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Review of the event model and schema change scope
2. Acceptance criteria for lifecycle capture, retrieval, and backfill
3. Test strategy covering event correctness and historical ordering
4. Risks related to legacy data quality and event completeness
5. Copilot handoff with implementation boundaries
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Employee Lifecycle History workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md

Implement:
1. Lifecycle event persistence and timeline retrieval
2. Required schema and service-layer changes
3. Backfill support where defined in the approved scope
4. Tests for event ordering, retrieval, and correctness

Constraints:
1. Keep lifecycle records tenant-scoped and auditable
2. Avoid broad schema churn outside the approved event model
3. Preserve compatibility with existing employee flows where possible

Return:
1. Files changed
2. Lifecycle history behavior implemented
3. Tests added or run
4. Backfill limitations or data-quality risks still open
```

---

## 9. Mobile Integration Completion

### Claude Prompt

```text
You are Claude working on the AuraOS feature-completion program.

Lead planning and review for the Mobile Integration Completion workstream.

Read these documents first:
1. docs/implementation/AI-AGENT-WORKSPLIT.md
2. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
3. docs/implementation/FEATURE-COMPLETION-TRACKER.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md
6. docs/hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md
7. docs/qa-reports/GAP-ANALYSIS-AND-REMEDIATION-PLAN.md
8. .github/copilot-instructions.md
9. CLAUDE.md

Produce:
1. Review of mobile priority flows and API dependency readiness
2. Acceptance criteria for paystubs, directory, approvals, and session stability
3. Test strategy for contract compatibility and release readiness
4. Risks involving API instability, auth/session behavior, and mobile-web contract drift
5. Copilot handoff with exact implementation boundaries
```

### Copilot Prompt

```text
You are GitHub Copilot working on the AuraOS feature-completion program.

Implement the Mobile Integration Completion workstream.

Read these documents first:
1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/AI-AGENT-WORKSPLIT.md
4. docs/implementation/FEATURE-COMPLETION-MASTER-PLAN.md
5. docs/implementation/FEATURE-COMPLETION-TRACKER.md
6. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
7. docs/implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md

Implement:
1. Replacement of mock-backed mobile priority screens with real API-backed behavior
2. Integration fixes needed for stable session and contract handling
3. Tests or validation steps proving mobile flows match the approved contracts
4. Documentation updates for any mobile integration constraints

Constraints:
1. Do not patch around unstable contracts without documenting them
2. Keep API alignment with the shared contracts document
3. Preserve tenant-safe and auth-safe behavior in mobile flows

Return:
1. Files changed
2. Mobile behaviors implemented
3. Tests added or run
4. Remaining contract or release-readiness risks
```

---

## Recommended Operating Sequence

1. Use the Claude prompt for the workstream.
2. Convert the output into a scoped implementation handoff.
3. Use the matching Copilot prompt.
4. Update [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md) with status and risks.
5. If needed, ask Claude to review Copilot's completed implementation against the handoff.

---

## Related Guides

1. [AI Agent Work Split](./AI-AGENT-WORKSPLIT.md)
2. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
3. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
4. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)