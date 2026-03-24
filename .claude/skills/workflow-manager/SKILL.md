---
name: workflow-manager
description: Expert domain skill for designing and implementing embedded workflow engines that orchestrate business processes (claims, approvals, HR requests, sales orders). Use when (1) Designing workflow definition JSON schemas for config-as-data workflows, (2) Implementing rule engines with submitter/payload-aware routing, (3) Building step executors for human, parallel, system, decision, timer steps, (4) Creating database schemas for workflow definitions, runtime state, and audit logs (PostgreSQL), (5) Building workflow APIs (NestJS/TypeScript backend), (6) Designing unified inbox and admin UIs (React/Next.js), (7) Implementing SLA tracking, escalations, and delegation, (8) Handling parallel approvals (any-one/all-required modes), (9) Building exception handling and retry mechanisms.
---

# Workflow Manager - Embedded Workflow Engine Skill

## Overview

Build reusable **embedded workflow engine capabilities** for enterprise applications. The engine orchestrates business processes with human approvals, automated system steps, dynamic routing, and comprehensive audit trails.

**Core Capabilities:**

- Human approvals (sequential + parallel any-one + parallel all-required)
- System-driven automated steps with retry policies
- Dynamic assignment based on submitter context and payload
- SLA tracking with escalation ladders
- Versioned workflow definitions as config-as-data (JSON)

## Quick Reference

| Task                               | Reference                                                      |
| ---------------------------------- | -------------------------------------------------------------- |
| JSON Schema Design                 | [references/json-schema.md](references/json-schema.md)         |
| Step Types (Human/System/Decision) | [references/step-types.md](references/step-types.md)           |
| Rule Engine DSL                    | [references/rule-engine.md](references/rule-engine.md)         |
| Database Schema (PostgreSQL)       | [references/database-schema.md](references/database-schema.md) |
| API Endpoints (NestJS)             | [references/api-reference.md](references/api-reference.md)     |
| Complete Examples                  | [references/examples.md](references/examples.md)               |

## Step Types Summary

| Type                          | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `SYSTEM_AUTOMATED`            | Validation, enrichment, API calls, document generation |
| `DECISION`                    | Conditional branching based on rules                   |
| `HUMAN_SINGLE`                | Single approver task                                   |
| `HUMAN_PARALLEL_ANY_ONE`      | First response wins, auto-close others                 |
| `HUMAN_PARALLEL_ALL_REQUIRED` | All must approve                                       |
| `TIMER_WAIT`                  | Pause for duration or event                            |
| `EXCEPTION_QUEUE`             | Manual intervention for failures                       |

## Assignment Modes

```
USER_LOOKUP   → org.managerOf(submitter.userId)
ROLE          → roleCode: "FINANCE_APPROVER"
ROLE_POOL     → roleCode + scope by companyId/siteId
MULTI         → Multiple targets (parallel all)
```

Always define `fallback` for user lookups.

## Parallel Approval Policies

**ANY_ONE (First Response Wins):**

```json
{
  "completion": "ANY_ONE",
  "onComplete": "AUTO_CLOSE_REMAINING",
  "mixedOutcomePolicy": "FIRST_DECISION_WINS"
}
```

**ALL_REQUIRED:**

```json
{
  "completion": "ALL_REQUIRED",
  "onReject": "REJECT_IMMEDIATELY",
  "mixedOutcomePolicy": "REJECT_DOMINATES"
}
```

## Core Workflow Structure

```json
{
  "processType": "EXPENSE_CLAIM",
  "name": "Expense Claim Approval",
  "version": 1,
  "status": "ACTIVE",
  "settings": {
    "definitionMode": "PINNED_PER_INSTANCE",
    "reEvaluateRoutingOn": ["RESUBMIT", "AMEND_KEY_FIELDS"],
    "keyFields": ["totalAmount", "claimType"],
    "snapshotFields": ["claimNumber", "totalAmount"],
    "sod": { "preventSelfApproval": true },
    "concurrency": { "actionLockMode": "INSTANCE_AND_STEP" }
  },
  "reasonCatalog": { ... },
  "steps": [ ... ],
  "transitions": [ ... ],
  "hooks": { ... },
  "notifications": { ... }
}
```

## Rule Engine Operators

**Comparison:** `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE`
**Null/Empty:** `IS_NULL`, `NOT_NULL`, `IS_EMPTY`, `NOT_EMPTY`
**String:** `CONTAINS`, `STARTS_WITH`, `IN`, `NOT_IN`
**Boolean:** `AND`, `OR`, `NOT`

**Operand Types:**

- `{"var": "totalAmount"}` - Workflow variable
- `{"const": 1000}` - Constant value
- `{"ctx": "submitter.departmentId"}` - Context value
- `{"lookup": "org.managerOf", "args": [...]}` - Dynamic lookup

## System Step Failure Policies

```json
{
  "retry": { "maxAttempts": 3, "backoffSeconds": 10 },
  "onFailure": {
    "policy": "ROUTE_TO_EXCEPTION_STEP",
    "exceptionStepId": "S90_EXCEPTION"
  }
}
```

**Policies:** `STOP_WORKFLOW`, `ROUTE_TO_EXCEPTION_STEP`, `COMPENSATE`

## SLA & Escalation

```json
{
  "slaDefaults": {
    "businessCalendar": "DEFAULT_UAE",
    "reminders": [
      { "whenPercentElapsed": 70, "notify": ["ASSIGNEE"] },
      { "whenPercentElapsed": 90, "notify": ["ASSIGNEE", "ASSIGNEE_MANAGER"] }
    ],
    "escalations": [
      { "afterHoursOverdue": 2, "action": "NOTIFY", "targets": ["ASSIGNEE_MANAGER"] },
      { "afterHoursOverdue": 6, "action": "REASSIGN", "toRole": "ESCALATION_APPROVER" }
    ]
  }
}
```

## Required APIs

| Endpoint            | Purpose                      |
| ------------------- | ---------------------------- |
| `startWorkflow()`   | Initiate new instance        |
| `getInbox()`        | User's pending tasks         |
| `getInstance()`     | Full instance details        |
| `actOnTask()`       | Approve/Reject/SendBack/Hold |
| `delegateTask()`    | Time-bound delegation        |
| `escalateTask()`    | Manual escalation            |
| `retrySystemStep()` | Admin retry failed step      |

## Database Tables (Core)

```
workflow_definitions    → Versioned process definitions (JSON)
workflow_instances      → Runtime instances with state
workflow_steps          → Step execution records
workflow_tasks          → Human task assignments
workflow_audit_logs     → Immutable action history
workflow_delegations    → Active delegations
```

## Implementation Checklist

1. [ ] Workflow definition parser and validator
2. [ ] Rule engine with lookup providers
3. [ ] Step executor framework (Human/System/Decision/Timer)
4. [ ] Parallel task coordinator with concurrency locks
5. [ ] Assignment engine with fallback handling
6. [ ] SLA scheduler and escalation jobs
7. [ ] Unified inbox API
8. [ ] Notification service integration
9. [ ] Audit logging (append-only)
10. [ ] Admin configuration UI

## Critical Safety Requirements

- **State machine enforcement**: No invalid transitions
- **Optimistic locking**: Prevent double decisions on parallel tasks
- **Idempotency keys**: System steps must not duplicate transactions
- **Version pinning**: Instance uses definition version at start time
- **Audit immutability**: Logs are append-only, never modified

## Acceptance Test Scenarios

1. System steps run sequentially before human tasks
2. Parallel ANY_ONE: First approval closes step, others auto-close
3. Parallel ALL: All must approve, rejection policy applied
4. Submitter-based routing: Different submitters → different approvers
5. Send back: Requester edits, rules re-evaluate if key fields changed
6. SLA breach triggers escalation notifications
7. Delegation time-bound with auto-return
8. Email approval only with verified sender + valid token
