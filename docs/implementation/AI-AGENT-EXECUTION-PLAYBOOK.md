# AuraOS AI Agent Execution Playbook

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Engineering Team  
**Status**: Active Execution Guide

---

## Purpose

This playbook tells the team exactly which agent prompt to use, and when to use it, across the 16-week feature-completion program.

Use this document when you want execution order, not just responsibility split.

---

## Required Inputs

Before using this playbook, read:

1. [AI-AGENT-WORKSPLIT.md](./AI-AGENT-WORKSPLIT.md)
2. [AI-AGENT-WORKSTREAM-PROMPTS.md](./AI-AGENT-WORKSTREAM-PROMPTS.md)
3. [FEATURE-COMPLETION-MASTER-PLAN.md](./FEATURE-COMPLETION-MASTER-PLAN.md)
4. [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md)
5. [FEATURE-COMPLETION-API-CONTRACTS.md](./FEATURE-COMPLETION-API-CONTRACTS.md)

---

## Operating Rule

For each workstream:

1. Run the Claude prompt first if scope, architecture, risks, or acceptance criteria are still open.
2. Convert Claude output into an implementation handoff.
3. Run the matching Copilot prompt.
4. Update the tracker with progress, blockers, and remaining risks.
5. If needed, run a Claude review pass after implementation.

---

## Week-By-Week Prompt Sequence

### Week 1

Primary objective: start core-service inventory and planning.

Run in order:
1. Claude prompt: Core Service Completion
2. Copilot prompt: Core Service Completion

Expected outcome:
1. Core-service scope confirmed
2. Mock inventory burn-down started
3. First implementation tranche opened

---

### Week 2

Primary objective: stabilize shared foundations.

Run in order:
1. Claude prompt: Audit and Compliance Completion
2. Copilot prompt: Audit and Compliance Completion
3. Claude prompt: Core Service Completion, if scope changed after audit review
4. Copilot prompt: Core Service Completion, if shared foundation edits are required

Expected outcome:
1. Audit foundation work underway
2. Shared contracts and schema-impact decisions clarified
3. Core-service changes aligned with audit requirements

---

### Week 3

Primary objective: complete audit baseline and start lifecycle history.

Run in order:
1. Claude prompt: Employee Lifecycle History
2. Copilot prompt: Employee Lifecycle History
3. Claude prompt: Core Service Completion, review pass if lifecycle dependencies affect scope

Expected outcome:
1. Audit persistence baseline in place
2. Lifecycle schema and event scope locked
3. Core-service dependencies updated if required

---

### Week 4

Primary objective: finish core-service operational paths.

Run in order:
1. Copilot prompt: Core Service Completion
2. Claude review prompt: Core Service Completion
3. Copilot prompt: Employee Lifecycle History, only if backfill or retrieval gaps remain

Expected outcome:
1. Core write paths operational
2. Review findings captured
3. Core release gate status ready for tracker update

---

### Week 5

Primary objective: begin leave-engine delivery.

Run in order:
1. Claude prompt: Leave Engine Completion
2. Copilot prompt: Leave Engine Completion

Expected outcome:
1. Leave ledger behavior aligned to approved policy scope
2. Accrual and carry-forward implementation started

---

### Week 6

Primary objective: close leave processing and validate results.

Run in order:
1. Copilot prompt: Leave Engine Completion
2. Claude review prompt: Leave Engine Completion

Expected outcome:
1. Leave balances become authoritative for approved flows
2. Policy edge cases and recomputation risks documented

---

### Week 7

Primary objective: begin attendance implementation.

Run in order:
1. Claude prompt: Attendance Completion
2. Copilot prompt: Attendance Completion

Expected outcome:
1. Attendance workflow boundaries locked
2. Punch and regularization implementation underway

---

### Week 8

Primary objective: finish attendance operational behavior.

Run in order:
1. Copilot prompt: Attendance Completion
2. Claude review prompt: Attendance Completion

Expected outcome:
1. Biometric ingestion and shift-swap scope closed for release
2. Attendance release gates updated in tracker

---

### Week 9

Primary objective: begin payroll implementation with controlled scope.

Run in order:
1. Claude prompt: Payroll Engine Completion
2. Copilot prompt: Payroll Engine Completion

Expected outcome:
1. Payroll rollout scope frozen
2. Payroll run lifecycle implementation underway

---

### Week 10

Primary objective: validate payroll for first release jurisdictions.

Run in order:
1. Copilot prompt: Payroll Engine Completion
2. Claude review prompt: Payroll Engine Completion

Expected outcome:
1. First payroll validations completed
2. Reconciliation and approval behavior reviewed

---

### Week 11

Primary objective: complete payroll release scope.

Run in order:
1. Copilot prompt: Payroll Engine Completion
2. Claude review prompt: Payroll Engine Completion, final pass

Expected outcome:
1. Approved payroll scope closed
2. Financial correctness risks captured before downstream rollout

---

### Week 12

Primary objective: begin recruitment operational workflows.

Run in order:
1. Claude prompt: Recruitment Completion
2. Copilot prompt: Recruitment Completion

Expected outcome:
1. Candidate pipeline scope locked
2. Interview and offer flows underway

---

### Week 13

Primary objective: close recruitment and analytics scope.

Run in order:
1. Copilot prompt: Recruitment Completion
2. Claude review prompt: Recruitment Completion

Expected outcome:
1. Recruitment workflows operational
2. Analytics and contract risks documented

---

### Week 14

Primary objective: complete export and reporting.

Run in order:
1. Claude prompt: Export and Reporting Completion
2. Copilot prompt: Export and Reporting Completion
3. Claude review prompt: Export and Reporting Completion

Expected outcome:
1. Export pipeline operational
2. Output correctness and performance risks reviewed

---

### Week 15

Primary objective: start mobile integration on stable APIs.

Run in order:
1. Claude prompt: Mobile Integration Completion
2. Copilot prompt: Mobile Integration Completion

Expected outcome:
1. Mobile priority flow scope locked
2. Real API integrations underway for mobile screens

---

### Week 16

Primary objective: finish mobile integration and final sign-off.

Run in order:
1. Copilot prompt: Mobile Integration Completion
2. Claude review prompt: Mobile Integration Completion
3. Claude review pass: cross-workstream release readiness review

Expected outcome:
1. Mobile priority flows operational
2. Cross-workstream risks summarized
3. Final tracker and sign-off artifacts ready

---

## Phase Summary

### Phase 0: Weeks 1-2

Use prompts:
1. Core Service Completion
2. Audit and Compliance Completion

### Phase 1: Weeks 3-4

Use prompts:
1. Employee Lifecycle History
2. Core Service Completion review and closure

### Phase 2: Weeks 5-11

Use prompts:
1. Leave Engine Completion
2. Attendance Completion
3. Payroll Engine Completion

### Phase 3: Weeks 12-14

Use prompts:
1. Recruitment Completion
2. Export and Reporting Completion

### Phase 4: Weeks 15-16

Use prompts:
1. Mobile Integration Completion
2. Final Claude release-readiness review

---

## Tracker Update Rule

After each weekly prompt sequence, update [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md) with:

1. Current status
2. Health
3. Evidence
4. Risks updated
5. Decisions needed
6. Next week focus

---

## Related Guides

1. [AI Agent Work Split](./AI-AGENT-WORKSPLIT.md)
2. [AI Agent Workstream Prompts](./AI-AGENT-WORKSTREAM-PROMPTS.md)
3. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
4. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)