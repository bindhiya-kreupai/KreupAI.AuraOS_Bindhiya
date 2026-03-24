# Workflow Definition JSON Schema

## Top-Level Structure

```json
{
  "processType": "EXPENSE_CLAIM",
  "name": "Expense Claim Approval",
  "version": 3,
  "status": "ACTIVE",
  "effectiveFrom": "2026-01-01",
  "effectiveTo": null,
  "settings": { ... },
  "reasonCatalog": { ... },
  "variables": { ... },
  "steps": [ ... ],
  "transitions": [ ... ],
  "notifications": { ... },
  "hooks": { ... },
  "security": { ... },
  "slaDefaults": { ... },
  "uiHints": { ... }
}
```

## Settings Object

```json
{
  "settings": {
    "definitionMode": "PINNED_PER_INSTANCE",
    "reEvaluateRoutingOn": ["RESUBMIT", "AMEND_KEY_FIELDS"],
    "keyFields": ["totalAmount", "claimType", "companyId", "siteId", "costCenterId"],
    "snapshotFields": [
      "claimNumber",
      "totalAmount",
      "claimType",
      "currency",
      "requesterId",
      "departmentId",
      "siteId"
    ],
    "allowRequesterCancelWhen": ["DRAFT", "SUBMITTED"],
    "sod": {
      "preventSelfApproval": true,
      "preventApprovingSameStepAfterDelegation": true
    },
    "concurrency": {
      "actionLockMode": "INSTANCE_AND_STEP",
      "lockTimeoutSeconds": 15
    }
  }
}
```

**Field Descriptions:**

- `definitionMode`: `PINNED_PER_INSTANCE` (use version at start) or `LATEST` (always use latest)
- `reEvaluateRoutingOn`: Events that trigger rule re-evaluation
- `keyFields`: Fields that trigger routing re-evaluation when changed
- `snapshotFields`: Fields captured at submission for consistent approver view
- `sod`: Separation of duties rules

## Reason Catalog

```json
{
  "reasonCatalog": {
    "approveReasons": ["OK_POLICY", "OK_BUDGET", "EXCEPTION_APPROVED"],
    "rejectReasons": ["INVALID_DOCS", "POLICY_VIOLATION", "DUPLICATE", "INSUFFICIENT_DETAILS"],
    "holdReasons": ["WAITING_INFO", "WAITING_VENDOR_DOCS", "SYSTEM_CHECK_PENDING"],
    "sendBackReasons": ["MISSING_ATTACHMENT", "INCORRECT_AMOUNT", "WRONG_CATEGORY"],
    "overrideReasons": ["ADMIN_EXCEPTION", "DATA_FIX", "EMERGENCY_APPROVAL"]
  }
}
```

## Variables (Process-Level)

```json
{
  "variables": {
    "currencyDefault": "AED",
    "amountCfoThreshold": 10000,
    "amountFinanceThreshold": 2000,
    "maxApprovalDays": 5
  }
}
```

## SLA Defaults

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

## Notifications Configuration

```json
{
  "notifications": {
    "templates": {
      "TASK_ASSIGNED": {
        "channels": ["IN_APP", "EMAIL"],
        "subject": "Action required: {{processType}} {{refNo}}",
        "body": "A task is assigned to you. Due: {{dueAt}}. Current step: {{stepName}}."
      },
      "REQUESTER_STATUS": {
        "channels": ["IN_APP"],
        "body": "Your request {{refNo}} is now pending with {{pendingWithDisplay}}."
      },
      "SLA_REMINDER": {
        "channels": ["EMAIL"],
        "subject": "Reminder: {{processType}} {{refNo}} due soon",
        "body": "Task {{stepName}} is {{percentElapsed}}% through SLA. Due: {{dueAt}}."
      }
    },
    "events": [
      { "event": "TASK_CREATED", "template": "TASK_ASSIGNED" },
      { "event": "STEP_ASSIGNED", "template": "REQUESTER_STATUS" },
      { "event": "SLA_WARNING", "template": "SLA_REMINDER" }
    ]
  }
}
```

## Hooks (Post-Actions)

```json
{
  "hooks": {
    "onInstanceStarted": [{ "kind": "EMIT_EVENT", "event": "workflow.started" }],
    "onStepCompleted": [{ "kind": "EMIT_EVENT", "event": "workflow.step.completed" }],
    "onInstanceApproved": [
      { "kind": "INTERNAL_FUNCTION", "target": "claims.markApproved" },
      { "kind": "NOTIFY", "template": "REQUESTER_APPROVED" }
    ],
    "onInstanceRejected": [
      { "kind": "INTERNAL_FUNCTION", "target": "claims.markRejected" },
      { "kind": "NOTIFY", "template": "REQUESTER_REJECTED" }
    ]
  }
}
```

**Hook Kinds:**

- `EMIT_EVENT`: Publish event to message bus
- `INTERNAL_FUNCTION`: Call internal service method
- `NOTIFY`: Send notification using template
- `WEBHOOK`: Call external URL (optional)
- `CREATE_RECORD`: Create downstream record

## Security Configuration

```json
{
  "security": {
    "visibility": {
      "requesterCanViewTimeline": true,
      "requesterCanViewAssigneeNames": false,
      "approverCanViewSnapshotOnly": true
    },
    "fieldPermissions": [
      {
        "when": {
          "op": "EQ",
          "left": { "ctx": "actor.role" },
          "right": { "const": "FINANCE_APPROVER" }
        },
        "canEditFields": ["approvedAmount", "financeNotes"],
        "canViewFields": ["*"]
      }
    ]
  }
}
```

## UI Hints (Optional)

```json
{
  "uiHints": {
    "formLayout": "two-column",
    "primaryFields": ["totalAmount", "claimType", "description"],
    "requiredAttachments": ["receipt"],
    "timelineStyle": "compact"
  }
}
```

## Transitions (Centralized)

```json
{
  "transitions": [
    { "from": "S40_MANAGER_APPROVAL", "on": "APPROVE", "to": "S30_ROUTE_DECISION" },
    { "from": "S50_FINANCE_APPROVAL", "on": "APPROVE", "to": "S80_POST_APPROVAL" },
    {
      "from": "S40_MANAGER_APPROVAL",
      "on": "SEND_BACK",
      "to": "S05_DRAFT_EDIT",
      "effects": [{ "kind": "SET_STATUS", "value": "SENT_BACK" }]
    },
    { "from": "S40_MANAGER_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S50_FINANCE_APPROVAL", "on": "REJECT", "to": "S99_END" }
  ]
}
```

**Transition Effects:**

- `SET_STATUS`: Update instance status
- `SET_VARIABLE`: Update workflow variable
- `EMIT_EVENT`: Publish event
- `CALL_HOOK`: Execute hook function
