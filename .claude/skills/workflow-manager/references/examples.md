# Complete Workflow Examples

## Example 1: Employee Expense Claim

Full workflow with system validation, dynamic routing, manager approval, and finance approval.

```json
{
  "processType": "EXPENSE_CLAIM",
  "name": "Expense Claim Approval",
  "version": 1,
  "status": "ACTIVE",
  "effectiveFrom": "2026-01-01",
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
    "sod": { "preventSelfApproval": true },
    "concurrency": { "actionLockMode": "INSTANCE_AND_STEP", "lockTimeoutSeconds": 15 }
  },
  "reasonCatalog": {
    "approveReasons": ["OK_POLICY", "OK_BUDGET", "EXCEPTION_APPROVED"],
    "rejectReasons": ["INVALID_DOCS", "POLICY_VIOLATION", "DUPLICATE", "INSUFFICIENT_DETAILS"],
    "holdReasons": ["WAITING_INFO", "WAITING_VENDOR_DOCS", "SYSTEM_CHECK_PENDING"],
    "overrideReasons": ["ADMIN_EXCEPTION", "DATA_FIX", "EMERGENCY_APPROVAL"]
  },
  "variables": {
    "amountFinanceThreshold": 2000,
    "amountCfoThreshold": 10000
  },
  "steps": [
    {
      "stepId": "S05_DRAFT_EDIT",
      "type": "SYSTEM_AUTOMATED",
      "name": "Draft Created",
      "system": { "actions": [] },
      "transitions": [{ "to": "S10_VALIDATE" }]
    },
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
            "onFailure": { "policy": "ROUTE_TO_EXCEPTION_STEP", "exceptionStepId": "S90_EXCEPTION" }
          }
        ]
      },
      "transitions": [{ "to": "S20_ENRICH" }]
    },
    {
      "stepId": "S20_ENRICH",
      "type": "SYSTEM_AUTOMATED",
      "name": "Enrich Org Context",
      "system": {
        "actions": [
          {
            "actionId": "ENR1",
            "kind": "INTERNAL_FUNCTION",
            "target": "claims.enrichContext",
            "retry": { "maxAttempts": 2, "backoffSeconds": 5 },
            "onFailure": { "policy": "ROUTE_TO_EXCEPTION_STEP", "exceptionStepId": "S90_EXCEPTION" }
          }
        ]
      },
      "transitions": [{ "to": "S30_ROUTE_DECISION" }]
    },
    {
      "stepId": "S30_ROUTE_DECISION",
      "type": "DECISION",
      "name": "Route Based on Amount",
      "decision": {
        "cases": [
          {
            "when": { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 10000 } },
            "goTo": "S60_CFO_APPROVAL"
          },
          {
            "when": { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 2000 } },
            "goTo": "S50_FINANCE_APPROVAL"
          }
        ],
        "defaultGoTo": "S40_MANAGER_APPROVAL"
      }
    },
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
        { "code": "DELEGATE" }
      ],
      "sla": { "dueIn": { "hours": 24 }, "pauseOnHold": true }
    },
    {
      "stepId": "S50_FINANCE_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Finance Approval",
      "assignment": { "mode": "ROLE", "roleCode": "FINANCE_APPROVER" },
      "actions": [
        { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
        {
          "code": "REJECT",
          "requiresReason": true,
          "reasonSet": "rejectReasons",
          "requiresComment": true
        },
        { "code": "SEND_BACK", "requiresComment": true },
        { "code": "HOLD", "requiresReason": true, "reasonSet": "holdReasons" }
      ],
      "sla": { "dueIn": { "hours": 48 }, "pauseOnHold": true }
    },
    {
      "stepId": "S60_CFO_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "CFO Approval",
      "assignment": { "mode": "ROLE", "roleCode": "CFO_APPROVER" },
      "actions": [
        { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
        {
          "code": "REJECT",
          "requiresReason": true,
          "reasonSet": "rejectReasons",
          "requiresComment": true
        }
      ],
      "sla": { "dueIn": { "hours": 72 } }
    },
    {
      "stepId": "S80_POST_APPROVAL",
      "type": "SYSTEM_AUTOMATED",
      "name": "Post Approval Actions",
      "system": {
        "actions": [
          {
            "actionId": "P1",
            "kind": "INTERNAL_FUNCTION",
            "target": "claims.markApproved",
            "retry": { "maxAttempts": 3, "backoffSeconds": 10 }
          },
          { "actionId": "P2", "kind": "EMIT_EVENT", "event": "claims.approved" }
        ]
      },
      "transitions": [{ "to": "S99_END" }]
    },
    {
      "stepId": "S99_END",
      "type": "SYSTEM_AUTOMATED",
      "name": "Completed",
      "system": { "actions": [] }
    },
    {
      "stepId": "S90_EXCEPTION",
      "type": "EXCEPTION_QUEUE",
      "name": "Exception Handling",
      "assignment": { "mode": "ROLE", "roleCode": "WORKFLOW_ADMIN" },
      "actions": [
        { "code": "RETRY_SYSTEM_STEP" },
        { "code": "FORCE_APPROVE", "requiresReason": true, "reasonSet": "overrideReasons" },
        { "code": "FORCE_REJECT", "requiresReason": true, "reasonSet": "overrideReasons" }
      ]
    }
  ],
  "transitions": [
    { "from": "S40_MANAGER_APPROVAL", "on": "APPROVE", "to": "S80_POST_APPROVAL" },
    { "from": "S50_FINANCE_APPROVAL", "on": "APPROVE", "to": "S80_POST_APPROVAL" },
    { "from": "S60_CFO_APPROVAL", "on": "APPROVE", "to": "S80_POST_APPROVAL" },
    { "from": "S40_MANAGER_APPROVAL", "on": "SEND_BACK", "to": "S05_DRAFT_EDIT" },
    { "from": "S50_FINANCE_APPROVAL", "on": "SEND_BACK", "to": "S05_DRAFT_EDIT" },
    { "from": "S40_MANAGER_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S50_FINANCE_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S60_CFO_APPROVAL", "on": "REJECT", "to": "S99_END" }
  ],
  "hooks": {
    "onInstanceApproved": [
      { "kind": "INTERNAL_FUNCTION", "target": "claims.markApproved" },
      { "kind": "NOTIFY", "template": "REQUESTER_APPROVED" }
    ],
    "onInstanceRejected": [
      { "kind": "INTERNAL_FUNCTION", "target": "claims.markRejected" },
      { "kind": "NOTIFY", "template": "REQUESTER_REJECTED" }
    ]
  },
  "slaDefaults": {
    "businessCalendar": "DEFAULT_UAE",
    "reminders": [
      { "whenPercentElapsed": 70, "notify": ["ASSIGNEE"] },
      { "whenPercentElapsed": 90, "notify": ["ASSIGNEE", "ASSIGNEE_MANAGER"] }
    ],
    "escalations": [
      { "afterHoursOverdue": 4, "action": "NOTIFY", "targets": ["ASSIGNEE_MANAGER"] },
      { "afterHoursOverdue": 8, "action": "REASSIGN", "toRole": "ESCALATION_APPROVER" }
    ]
  }
}
```

---

## Example 2: Sales Order Credit Approval (Parallel Any-One)

Credit approval with risk-based routing and parallel pool assignment.

```json
{
  "processType": "SALES_ORDER_CREDIT",
  "name": "Sales Order Credit Approval",
  "version": 1,
  "status": "ACTIVE",
  "effectiveFrom": "2026-01-01",
  "settings": {
    "definitionMode": "PINNED_PER_INSTANCE",
    "reEvaluateRoutingOn": ["RESUBMIT", "AMEND_KEY_FIELDS"],
    "keyFields": ["orderAmount", "customerId", "companyId", "salesPersonId", "paymentTerms"],
    "snapshotFields": [
      "soNumber",
      "orderAmount",
      "currency",
      "customerId",
      "salesPersonId",
      "companyId"
    ]
  },
  "variables": {
    "financeThreshold": 50000,
    "cfoThreshold": 150000
  },
  "steps": [
    {
      "stepId": "S10_ENRICH_RISK",
      "type": "SYSTEM_AUTOMATED",
      "name": "Enrich Customer Risk & Exposure",
      "system": {
        "actions": [
          {
            "actionId": "R1",
            "kind": "INTERNAL_FUNCTION",
            "target": "credit.enrichExposure",
            "retry": { "maxAttempts": 3, "backoffSeconds": 10 },
            "onFailure": { "policy": "ROUTE_TO_EXCEPTION_STEP", "exceptionStepId": "S90_EXCEPTION" }
          }
        ]
      },
      "transitions": [{ "to": "S20_DECIDE_PATH" }]
    },
    {
      "stepId": "S20_DECIDE_PATH",
      "type": "DECISION",
      "name": "Decide Approval Path",
      "decision": {
        "cases": [
          {
            "when": {
              "op": "OR",
              "args": [
                { "op": "GTE", "left": { "var": "orderAmount" }, "right": { "const": 150000 } },
                { "op": "EQ", "left": { "var": "customerRiskTier" }, "right": { "const": "HIGH" } }
              ]
            },
            "goTo": "S70_CFO_APPROVAL"
          },
          {
            "when": { "op": "GTE", "left": { "var": "orderAmount" }, "right": { "const": 50000 } },
            "goTo": "S60_FINANCE_APPROVAL"
          }
        ],
        "defaultGoTo": "S50_CREDIT_CONTROLLER_ANYONE"
      }
    },
    {
      "stepId": "S50_CREDIT_CONTROLLER_ANYONE",
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
        },
        { "code": "SEND_BACK", "requiresComment": true }
      ],
      "sla": { "dueIn": { "hours": 8 } },
      "transitions": [
        { "on": "APPROVE", "to": "S80_POST" },
        { "on": "REJECT", "to": "S99_END" }
      ]
    },
    {
      "stepId": "S60_FINANCE_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Finance Approval",
      "assignment": { "mode": "ROLE", "roleCode": "FINANCE_APPROVER" },
      "actions": [
        { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
        {
          "code": "REJECT",
          "requiresReason": true,
          "reasonSet": "rejectReasons",
          "requiresComment": true
        },
        { "code": "SEND_BACK", "requiresComment": true }
      ],
      "sla": { "dueIn": { "hours": 24 } },
      "transitions": [
        { "on": "APPROVE", "to": "S80_POST" },
        { "on": "REJECT", "to": "S99_END" }
      ]
    },
    {
      "stepId": "S70_CFO_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "CFO Approval",
      "assignment": { "mode": "ROLE", "roleCode": "CFO_APPROVER" },
      "actions": [
        { "code": "APPROVE", "requiresReason": true, "reasonSet": "approveReasons" },
        {
          "code": "REJECT",
          "requiresReason": true,
          "reasonSet": "rejectReasons",
          "requiresComment": true
        }
      ],
      "sla": { "dueIn": { "hours": 48 } },
      "transitions": [
        { "on": "APPROVE", "to": "S80_POST" },
        { "on": "REJECT", "to": "S99_END" }
      ]
    },
    {
      "stepId": "S80_POST",
      "type": "SYSTEM_AUTOMATED",
      "name": "Post Decision",
      "system": {
        "actions": [
          {
            "actionId": "P1",
            "kind": "INTERNAL_FUNCTION",
            "target": "salesOrder.setCreditDecision",
            "retry": { "maxAttempts": 3, "backoffSeconds": 10 }
          },
          { "actionId": "P2", "kind": "EMIT_EVENT", "event": "sales.credit.decision" }
        ]
      },
      "transitions": [{ "to": "S99_END" }]
    },
    {
      "stepId": "S99_END",
      "type": "SYSTEM_AUTOMATED",
      "name": "Completed",
      "system": { "actions": [] }
    },
    {
      "stepId": "S90_EXCEPTION",
      "type": "EXCEPTION_QUEUE",
      "name": "Exception Handling",
      "assignment": { "mode": "ROLE", "roleCode": "WORKFLOW_ADMIN" },
      "actions": [
        { "code": "RETRY_SYSTEM_STEP" },
        { "code": "FORCE_APPROVE", "requiresReason": true, "reasonSet": "overrideReasons" },
        { "code": "FORCE_REJECT", "requiresReason": true, "reasonSet": "overrideReasons" }
      ]
    }
  ]
}
```

---

## Example 3: Purchase Approval (Parallel All Required)

Purchase approval requiring both Finance and Compliance approval.

```json
{
  "processType": "PURCHASE_REQUEST",
  "name": "Purchase Request Approval",
  "version": 1,
  "status": "ACTIVE",
  "steps": [
    {
      "stepId": "S10_BUDGET_CHECK",
      "type": "SYSTEM_AUTOMATED",
      "name": "Check Budget Availability",
      "system": {
        "actions": [
          {
            "actionId": "B1",
            "kind": "INTERNAL_FUNCTION",
            "target": "finance.checkBudget",
            "retry": { "maxAttempts": 2, "backoffSeconds": 5 },
            "onFailure": { "policy": "ROUTE_TO_EXCEPTION_STEP", "exceptionStepId": "S90_EXCEPTION" }
          }
        ]
      },
      "transitions": [{ "to": "S20_ROUTE" }]
    },
    {
      "stepId": "S20_ROUTE",
      "type": "DECISION",
      "name": "Route Based on Amount and Category",
      "decision": {
        "cases": [
          {
            "when": {
              "op": "AND",
              "args": [
                { "op": "GTE", "left": { "var": "amount" }, "right": { "const": 25000 } },
                {
                  "op": "IN",
                  "left": { "var": "category" },
                  "right": { "const": ["IT_EQUIPMENT", "SOFTWARE"] }
                }
              ]
            },
            "goTo": "S50_DUAL_APPROVAL"
          },
          {
            "when": { "op": "GTE", "left": { "var": "amount" }, "right": { "const": 10000 } },
            "goTo": "S40_FINANCE_APPROVAL"
          }
        ],
        "defaultGoTo": "S30_MANAGER_APPROVAL"
      }
    },
    {
      "stepId": "S30_MANAGER_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Manager Approval",
      "assignment": {
        "mode": "USER_LOOKUP",
        "assignees": [{ "lookup": "org.costCenterOwner", "args": [{ "var": "costCenterId" }] }],
        "fallback": { "mode": "ROLE", "roleCode": "PROCUREMENT_ADMIN" }
      },
      "actions": [
        { "code": "APPROVE", "requiresReason": true },
        { "code": "REJECT", "requiresReason": true, "requiresComment": true },
        { "code": "SEND_BACK" }
      ],
      "sla": { "dueIn": { "hours": 24 } }
    },
    {
      "stepId": "S40_FINANCE_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Finance Approval",
      "assignment": { "mode": "ROLE", "roleCode": "FINANCE_APPROVER" },
      "actions": [
        { "code": "APPROVE", "requiresReason": true },
        { "code": "REJECT", "requiresReason": true, "requiresComment": true }
      ],
      "sla": { "dueIn": { "hours": 48 } }
    },
    {
      "stepId": "S50_DUAL_APPROVAL",
      "type": "HUMAN_PARALLEL_ALL_REQUIRED",
      "name": "Finance + Compliance Approval",
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
        { "code": "APPROVE", "requiresReason": true },
        { "code": "REJECT", "requiresReason": true, "requiresComment": true }
      ],
      "sla": { "dueIn": { "hours": 72 } }
    },
    {
      "stepId": "S80_CREATE_PO",
      "type": "SYSTEM_AUTOMATED",
      "name": "Create Purchase Order",
      "system": {
        "actions": [
          { "actionId": "C1", "kind": "INTERNAL_FUNCTION", "target": "procurement.createPO" },
          { "actionId": "C2", "kind": "EMIT_EVENT", "event": "procurement.po.created" }
        ]
      },
      "transitions": [{ "to": "S99_END" }]
    },
    {
      "stepId": "S99_END",
      "type": "SYSTEM_AUTOMATED",
      "name": "Completed",
      "system": { "actions": [] }
    },
    {
      "stepId": "S90_EXCEPTION",
      "type": "EXCEPTION_QUEUE",
      "name": "Exception Handling",
      "assignment": { "mode": "ROLE", "roleCode": "WORKFLOW_ADMIN" }
    }
  ],
  "transitions": [
    { "from": "S30_MANAGER_APPROVAL", "on": "APPROVE", "to": "S80_CREATE_PO" },
    { "from": "S40_FINANCE_APPROVAL", "on": "APPROVE", "to": "S80_CREATE_PO" },
    { "from": "S50_DUAL_APPROVAL", "on": "APPROVE", "to": "S80_CREATE_PO" },
    { "from": "S30_MANAGER_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S40_FINANCE_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S50_DUAL_APPROVAL", "on": "REJECT", "to": "S99_END" }
  ]
}
```

---

## Example 4: Leave Request (Sequential + Skip-Level)

Leave approval with sequential manager chain.

```json
{
  "processType": "LEAVE_REQUEST",
  "name": "Leave Request Approval",
  "version": 1,
  "status": "ACTIVE",
  "settings": {
    "reEvaluateRoutingOn": ["RESUBMIT"],
    "keyFields": ["leaveType", "numberOfDays", "startDate"],
    "snapshotFields": [
      "employeeId",
      "employeeName",
      "department",
      "leaveType",
      "numberOfDays",
      "startDate",
      "endDate"
    ]
  },
  "steps": [
    {
      "stepId": "S10_BALANCE_CHECK",
      "type": "SYSTEM_AUTOMATED",
      "name": "Check Leave Balance",
      "system": {
        "actions": [
          {
            "actionId": "L1",
            "kind": "INTERNAL_FUNCTION",
            "target": "leave.checkBalance",
            "onFailure": { "policy": "STOP_WORKFLOW" }
          }
        ]
      },
      "transitions": [{ "to": "S20_ROUTE" }]
    },
    {
      "stepId": "S20_ROUTE",
      "type": "DECISION",
      "name": "Route Based on Duration",
      "decision": {
        "cases": [
          {
            "when": { "op": "GT", "left": { "var": "numberOfDays" }, "right": { "const": 10 } },
            "goTo": "S40_SKIP_LEVEL_APPROVAL"
          }
        ],
        "defaultGoTo": "S30_MANAGER_APPROVAL"
      }
    },
    {
      "stepId": "S30_MANAGER_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Direct Manager Approval",
      "assignment": {
        "mode": "USER_LOOKUP",
        "assignees": [{ "lookup": "org.managerOf", "args": [{ "ctx": "submitter.userId" }] }],
        "fallback": { "mode": "ROLE", "roleCode": "HR_ADMIN" }
      },
      "actions": [
        { "code": "APPROVE" },
        { "code": "REJECT", "requiresComment": true },
        { "code": "SEND_BACK" }
      ],
      "sla": { "dueIn": { "hours": 24 } }
    },
    {
      "stepId": "S40_SKIP_LEVEL_APPROVAL",
      "type": "HUMAN_SINGLE",
      "name": "Skip-Level Manager Approval",
      "assignment": {
        "mode": "USER_LOOKUP",
        "assignees": [
          {
            "lookup": "org.skipLevelManagerOf",
            "args": [{ "ctx": "submitter.userId" }, { "const": 2 }]
          }
        ],
        "fallback": { "mode": "ROLE", "roleCode": "HR_ADMIN" }
      },
      "actions": [{ "code": "APPROVE" }, { "code": "REJECT", "requiresComment": true }],
      "sla": { "dueIn": { "hours": 48 } }
    },
    {
      "stepId": "S80_APPLY_LEAVE",
      "type": "SYSTEM_AUTOMATED",
      "name": "Apply Leave",
      "system": {
        "actions": [
          { "actionId": "A1", "kind": "INTERNAL_FUNCTION", "target": "leave.apply" },
          { "actionId": "A2", "kind": "EMIT_EVENT", "event": "leave.approved" }
        ]
      },
      "transitions": [{ "to": "S99_END" }]
    },
    {
      "stepId": "S99_END",
      "type": "SYSTEM_AUTOMATED",
      "name": "Completed",
      "system": { "actions": [] }
    }
  ],
  "transitions": [
    { "from": "S30_MANAGER_APPROVAL", "on": "APPROVE", "to": "S80_APPLY_LEAVE" },
    { "from": "S40_SKIP_LEVEL_APPROVAL", "on": "APPROVE", "to": "S80_APPLY_LEAVE" },
    { "from": "S30_MANAGER_APPROVAL", "on": "REJECT", "to": "S99_END" },
    { "from": "S40_SKIP_LEVEL_APPROVAL", "on": "REJECT", "to": "S99_END" }
  ]
}
```
