# Step Types Reference

## Step Type Overview

| Type               | Code                          | Human Task | Parallel | Auto-Progress |
| ------------------ | ----------------------------- | ---------- | -------- | ------------- |
| System Automated   | `SYSTEM_AUTOMATED`            | No         | No       | Yes           |
| Decision Branch    | `DECISION`                    | No         | No       | Yes           |
| Human Single       | `HUMAN_SINGLE`                | Yes        | No       | No            |
| Human Parallel Any | `HUMAN_PARALLEL_ANY_ONE`      | Yes        | Yes      | No            |
| Human Parallel All | `HUMAN_PARALLEL_ALL_REQUIRED` | Yes        | Yes      | No            |
| Timer Wait         | `TIMER_WAIT`                  | No         | No       | Scheduled     |
| Exception Queue    | `EXCEPTION_QUEUE`             | Yes        | No       | No            |

---

## SYSTEM_AUTOMATED

Automated steps executed by the system without human intervention.

```json
{
  "stepId": "S10_VALIDATE",
  "type": "SYSTEM_AUTOMATED",
  "name": "Validate Claim",
  "system": {
    "actions": [
      {
        "actionId": "VAL1",
        "kind": "INTERNAL_FUNCTION",
        "target": "claims.validate",
        "idempotencyKey": "instanceId+stepId",
        "retry": { "maxAttempts": 3, "backoffSeconds": 10 },
        "onFailure": {
          "policy": "ROUTE_TO_EXCEPTION_STEP",
          "exceptionStepId": "S90_EXCEPTION"
        }
      }
    ]
  },
  "transitions": [{ "to": "S20_ENRICH" }]
}
```

### System Action Kinds

| Kind                | Description            | Example Target                             |
| ------------------- | ---------------------- | ------------------------------------------ |
| `INTERNAL_FUNCTION` | Call internal service  | `claims.validate`, `credit.enrichExposure` |
| `STORED_PROCEDURE`  | Execute DB procedure   | `sp_calculate_budget`                      |
| `EXTERNAL_API`      | Call external webhook  | `https://api.vendor.com/verify`            |
| `GENERATE_DOCUMENT` | Create PDF/reference   | `documents.generatePDF`                    |
| `POST_ACCOUNTING`   | Create journal entries | `accounting.postEntry`                     |
| `EMIT_EVENT`        | Publish to message bus | `claims.validated`                         |

### Failure Policies

```json
{
  "onFailure": {
    "policy": "ROUTE_TO_EXCEPTION_STEP",
    "exceptionStepId": "S90_EXCEPTION"
  }
}
```

| Policy                    | Behavior                     |
| ------------------------- | ---------------------------- |
| `STOP_WORKFLOW`           | Mark instance as failed      |
| `ROUTE_TO_EXCEPTION_STEP` | Route to exception queue     |
| `COMPENSATE`              | Execute rollback function    |
| `CONTINUE`                | Log error and proceed (rare) |

---

## DECISION

Conditional branching based on rule evaluation.

```json
{
  "stepId": "S30_ROUTE_DECISION",
  "type": "DECISION",
  "name": "Route Based on Amount",
  "decision": {
    "cases": [
      {
        "when": { "op": "LT", "left": { "var": "totalAmount" }, "right": { "const": 2000 } },
        "goTo": "S40_MANAGER_APPROVAL"
      },
      {
        "when": { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 2000 } },
        "goTo": "S50_FINANCE_APPROVAL"
      },
      {
        "when": {
          "op": "AND",
          "args": [
            { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 10000 } },
            { "op": "EQ", "left": { "var": "claimType" }, "right": { "const": "TRAVEL" } }
          ]
        },
        "goTo": "S60_CFO_APPROVAL"
      }
    ],
    "defaultGoTo": "S40_MANAGER_APPROVAL"
  }
}
```

**Rules evaluated top-to-bottom, first match wins.**

---

## HUMAN_SINGLE

Single approver task with configurable actions.

```json
{
  "stepId": "S40_MANAGER_APPROVAL",
  "type": "HUMAN_SINGLE",
  "name": "Manager Approval",
  "assignment": {
    "mode": "USER_LOOKUP",
    "assignees": [{ "lookup": "org.managerOf", "args": [{ "ctx": "submitter.userId" }] }],
    "fallback": { "mode": "ROLE", "roleCode": "HR_ADMIN" }
  },
  "actions": [
    { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
    {
      "code": "REJECT",
      "requiresReason": true,
      "reasonSet": "rejectReasons",
      "requiresComment": true
    },
    { "code": "SEND_BACK", "requiresComment": true },
    { "code": "HOLD", "requiresReason": true, "reasonSet": "holdReasons" },
    { "code": "DELEGATE", "policy": "ALLOW_WITHIN_SAME_DEPT" }
  ],
  "sla": { "dueIn": { "hours": 24 }, "pauseOnHold": true }
}
```

### Assignment Modes

| Mode          | Configuration                                                       |
| ------------- | ------------------------------------------------------------------- |
| `USER`        | `{"userId": "U123"}`                                                |
| `USER_LOOKUP` | `{"lookup": "org.managerOf", "args": [...]}`                        |
| `ROLE`        | `{"roleCode": "FINANCE_APPROVER"}`                                  |
| `ROLE_POOL`   | `{"roleCode": "...", "scope": {"by": "companyId", "value": {...}}}` |

### Action Codes

| Code           | Description                           |
| -------------- | ------------------------------------- |
| `APPROVE`      | Approve and proceed                   |
| `REJECT`       | Reject and terminate                  |
| `SEND_BACK`    | Return to requester                   |
| `HOLD`         | Pause task (SLA paused if configured) |
| `RESUME`       | Resume held task                      |
| `DELEGATE`     | Transfer to another user              |
| `REASSIGN`     | Admin reassignment                    |
| `ESCALATE`     | Manual escalation                     |
| `REQUEST_INFO` | Request additional information        |

---

## HUMAN_PARALLEL_ANY_ONE

Multiple assignees, first response wins.

```json
{
  "stepId": "S60_CREDIT_CONTROLLER",
  "type": "HUMAN_PARALLEL_ANY_ONE",
  "name": "Credit Controller (Any One)",
  "assignment": {
    "mode": "ROLE_POOL",
    "roleCode": "CREDIT_CONTROLLER",
    "scope": { "by": "companyId", "value": { "var": "companyId" } }
  },
  "parallelPolicy": {
    "completion": "ANY_ONE",
    "onComplete": "AUTO_CLOSE_REMAINING",
    "mixedOutcomePolicy": "FIRST_DECISION_WINS"
  },
  "actions": [
    { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
    {
      "code": "REJECT",
      "requiresReason": true,
      "reasonSet": "rejectReasons",
      "requiresComment": true
    }
  ],
  "sla": { "dueIn": { "hours": 8 } }
}
```

**Concurrency Handling:**

- Use distributed locks to prevent race conditions
- First valid decision wins
- Other tasks marked as "Not required (resolved by X)"

---

## HUMAN_PARALLEL_ALL_REQUIRED

All assignees must respond.

```json
{
  "stepId": "S70_FINANCE_AND_COMPLIANCE",
  "type": "HUMAN_PARALLEL_ALL_REQUIRED",
  "name": "Finance + Compliance (All Must Approve)",
  "assignment": {
    "mode": "MULTI",
    "targets": [
      { "mode": "ROLE", "roleCode": "FINANCE_APPROVER" },
      { "mode": "ROLE", "roleCode": "COMPLIANCE_APPROVER" }
    ]
  },
  "parallelPolicy": {
    "completion": "ALL_REQUIRED",
    "onReject": "REJECT_IMMEDIATELY",
    "mixedOutcomePolicy": "REJECT_DOMINATES"
  },
  "actions": [
    { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
    {
      "code": "REJECT",
      "requiresReason": true,
      "reasonSet": "rejectReasons",
      "requiresComment": true
    }
  ],
  "sla": { "dueIn": { "hours": 48 } }
}
```

### Mixed Outcome Policies

| Policy                 | Behavior                             |
| ---------------------- | ------------------------------------ |
| `REJECT_DOMINATES`     | Any rejection fails the step         |
| `WEIGHTED_DECISION`    | Majority vote (configurable weights) |
| `ESCALATE_ON_CONFLICT` | Route to higher authority            |
| `COLLECT_ALL`          | Wait for all responses, then decide  |

---

## TIMER_WAIT

Pause execution for a duration or until an event.

```json
{
  "stepId": "S55_WAIT_FOR_DOCS",
  "type": "TIMER_WAIT",
  "name": "Wait for Documents",
  "timer": {
    "waitFor": { "hours": 24 },
    "wakeUpPolicy": "AUTO_TRANSITION",
    "onTimeoutGoTo": "S90_EXCEPTION",
    "onEventGoTo": "S60_CONTINUE"
  }
}
```

### Wake-Up Triggers

| Trigger           | Description            |
| ----------------- | ---------------------- |
| `AUTO_TRANSITION` | Proceed after duration |
| `EVENT`           | Wake on specific event |
| `BOTH`            | Whichever comes first  |

---

## EXCEPTION_QUEUE

Manual intervention for system failures or edge cases.

```json
{
  "stepId": "S90_EXCEPTION",
  "type": "EXCEPTION_QUEUE",
  "name": "Exception Handling",
  "assignment": { "mode": "ROLE", "roleCode": "WORKFLOW_ADMIN" },
  "actions": [
    { "code": "RETRY_SYSTEM_STEP" },
    { "code": "FORCE_APPROVE", "requiresReason": true, "reasonSet": "overrideReasons" },
    { "code": "FORCE_REJECT", "requiresReason": true, "reasonSet": "overrideReasons" },
    { "code": "REASSIGN_TO_STEP", "requiresComment": true }
  ],
  "metadata": {
    "showErrorDetails": true,
    "showRetryCount": true
  }
}
```

---

## Step SLA Configuration

```json
{
  "sla": {
    "dueIn": { "hours": 24 },
    "pauseOnHold": true,
    "businessCalendar": "DEFAULT_UAE",
    "reminders": [
      { "whenPercentElapsed": 50, "notify": ["ASSIGNEE"] },
      { "whenPercentElapsed": 80, "notify": ["ASSIGNEE", "ASSIGNEE_MANAGER"] }
    ],
    "escalations": [
      { "afterHoursOverdue": 4, "action": "NOTIFY", "targets": ["ASSIGNEE_MANAGER"] },
      { "afterHoursOverdue": 8, "action": "REASSIGN", "toRole": "ESCALATION_APPROVER" }
    ]
  }
}
```
