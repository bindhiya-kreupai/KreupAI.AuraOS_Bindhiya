# Rule Engine DSL Reference

## Condition Object Format

Every condition uses:

- `op`: Operator
- `left` / `right`: Operands (for binary operators)
- `args`: Array of conditions (for boolean composition)

## Operand Types

### Variable (Workflow Data)

```json
{ "var": "totalAmount" }
{ "var": "claimType" }
{ "var": "customer.riskTier" }
```

### Constant

```json
{ "const": 1000 }
{ "const": "HIGH" }
{ "const": true }
{ "const": ["TRAVEL", "MEDICAL", "IT"] }
```

### Context (Submitter/Runtime)

```json
{ "ctx": "submitter.userId" }
{ "ctx": "submitter.departmentId" }
{ "ctx": "submitter.companyId" }
{ "ctx": "submitter.grade" }
{ "ctx": "submitter.type" }
{ "ctx": "actor.role" }
{ "ctx": "currentDateTime" }
```

### Lookup (Dynamic Resolution)

```json
{ "lookup": "org.managerOf", "args": [{ "ctx": "submitter.userId" }] }
{ "lookup": "org.skipLevelManagerOf", "args": [{ "ctx": "submitter.userId" }, { "const": 2 }] }
{ "lookup": "org.costCenterOwner", "args": [{ "var": "costCenterId" }] }
```

---

## Operators

### Comparison Operators

| Operator | Description           | Example                                                                 |
| -------- | --------------------- | ----------------------------------------------------------------------- |
| `EQ`     | Equals                | `{"op": "EQ", "left": {"var": "status"}, "right": {"const": "ACTIVE"}}` |
| `NE`     | Not equals            | `{"op": "NE", "left": {"var": "type"}, "right": {"const": "DRAFT"}}`    |
| `GT`     | Greater than          | `{"op": "GT", "left": {"var": "amount"}, "right": {"const": 1000}}`     |
| `GTE`    | Greater than or equal | `{"op": "GTE", "left": {"var": "amount"}, "right": {"const": 5000}}`    |
| `LT`     | Less than             | `{"op": "LT", "left": {"var": "quantity"}, "right": {"const": 10}}`     |
| `LTE`    | Less than or equal    | `{"op": "LTE", "left": {"var": "days"}, "right": {"const": 30}}`        |

### Null/Empty Operators

| Operator    | Description               | Example                                              |
| ----------- | ------------------------- | ---------------------------------------------------- |
| `IS_NULL`   | Value is null             | `{"op": "IS_NULL", "left": {"var": "managerId"}}`    |
| `NOT_NULL`  | Value is not null         | `{"op": "NOT_NULL", "left": {"var": "approvedBy"}}`  |
| `IS_EMPTY`  | Array/string is empty     | `{"op": "IS_EMPTY", "left": {"var": "attachments"}}` |
| `NOT_EMPTY` | Array/string is not empty | `{"op": "NOT_EMPTY", "left": {"var": "comments"}}`   |

### String Operators

| Operator      | Description        | Example                                                                                     |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `CONTAINS`    | String contains    | `{"op": "CONTAINS", "left": {"var": "description"}, "right": {"const": "urgent"}}`          |
| `STARTS_WITH` | String starts with | `{"op": "STARTS_WITH", "left": {"var": "refNo"}, "right": {"const": "EXP-"}}`               |
| `ENDS_WITH`   | String ends with   | `{"op": "ENDS_WITH", "left": {"var": "email"}, "right": {"const": "@company.com"}}`         |
| `IN`          | Value in array     | `{"op": "IN", "left": {"var": "category"}, "right": {"const": ["TRAVEL", "MEDICAL"]}}`      |
| `NOT_IN`      | Value not in array | `{"op": "NOT_IN", "left": {"var": "status"}, "right": {"const": ["CANCELLED", "EXPIRED"]}}` |

### Boolean Composition

```json
{
  "op": "AND",
  "args": [
    { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 2000 } },
    { "op": "EQ", "left": { "var": "currency" }, "right": { "const": "AED" } }
  ]
}
```

```json
{
  "op": "OR",
  "args": [
    { "op": "GTE", "left": { "var": "amount" }, "right": { "const": 150000 } },
    { "op": "EQ", "left": { "var": "customerRiskTier" }, "right": { "const": "HIGH" } }
  ]
}
```

```json
{
  "op": "NOT",
  "args": [{ "op": "EQ", "left": { "ctx": "submitter.type" }, "right": { "const": "CONTRACTOR" } }]
}
```

### Date/Time Operators

| Operator  | Description               |
| --------- | ------------------------- |
| `BEFORE`  | Date is before            |
| `AFTER`   | Date is after             |
| `BETWEEN` | Date is between two dates |

```json
{
  "op": "BEFORE",
  "left": { "var": "requestDate" },
  "right": { "const": "2026-12-31" }
}
```

---

## Lookup Functions

### Organization Lookups

| Function                 | Arguments      | Returns                     |
| ------------------------ | -------------- | --------------------------- |
| `org.managerOf`          | userId         | Manager's userId            |
| `org.skipLevelManagerOf` | userId, levels | Skip-level manager's userId |
| `org.departmentHead`     | departmentId   | Department head's userId    |
| `org.costCenterOwner`    | costCenterId   | Cost center owner's userId  |
| `org.siteManager`        | siteId         | Site manager's userId       |

### Role Lookups

| Function           | Arguments        | Returns          |
| ------------------ | ---------------- | ---------------- |
| `auth.usersInRole` | roleCode, scope  | Array of userIds |
| `auth.hasRole`     | userId, roleCode | Boolean          |

### Risk/Credit Lookups

| Function            | Arguments  | Returns                        |
| ------------------- | ---------- | ------------------------------ |
| `risk.customerTier` | customerId | Risk tier (HIGH/MEDIUM/LOW)    |
| `credit.exposure`   | customerId | Current credit exposure amount |
| `credit.limit`      | customerId | Credit limit amount            |
| `credit.available`  | customerId | Available credit               |

### Finance Lookups

| Function                  | Arguments            | Returns                 |
| ------------------------- | -------------------- | ----------------------- |
| `finance.budgetAvailable` | costCenterId, amount | Boolean                 |
| `finance.budgetRemaining` | costCenterId         | Remaining budget amount |

### Calendar Lookups

| Function                 | Arguments        | Returns                |
| ------------------------ | ---------------- | ---------------------- |
| `calendar.isOutOfOffice` | userId, dateTime | Boolean                |
| `calendar.delegate`      | userId           | Delegate userId if OOO |

---

## Complex Rule Examples

### Amount + Category Routing

```json
{
  "decision": {
    "cases": [
      {
        "when": {
          "op": "AND",
          "args": [
            { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 10000 } },
            {
              "op": "IN",
              "left": { "var": "claimType" },
              "right": { "const": ["TRAVEL", "EQUIPMENT"] }
            }
          ]
        },
        "goTo": "S60_CFO_APPROVAL"
      },
      {
        "when": { "op": "GTE", "left": { "var": "totalAmount" }, "right": { "const": 2000 } },
        "goTo": "S50_FINANCE_APPROVAL"
      }
    ],
    "defaultGoTo": "S40_MANAGER_APPROVAL"
  }
}
```

### Submitter-Based Dynamic Assignment

```json
{
  "assignment": {
    "mode": "USER_LOOKUP",
    "assignees": [{ "lookup": "org.managerOf", "args": [{ "ctx": "submitter.userId" }] }],
    "fallback": { "mode": "ROLE", "roleCode": "HR_ADMIN" }
  }
}
```

### Conditional Assignment by Submitter Type

```json
{
  "decision": {
    "cases": [
      {
        "when": {
          "op": "EQ",
          "left": { "ctx": "submitter.type" },
          "right": { "const": "EMPLOYEE" }
        },
        "goTo": "S40_MANAGER_APPROVAL"
      },
      {
        "when": {
          "op": "EQ",
          "left": { "ctx": "submitter.type" },
          "right": { "const": "CONTRACTOR" }
        },
        "goTo": "S45_PROCUREMENT_APPROVAL"
      },
      {
        "when": {
          "op": "EQ",
          "left": { "ctx": "submitter.type" },
          "right": { "const": "PARTNER" }
        },
        "goTo": "S48_PARTNER_MANAGER_APPROVAL"
      }
    ],
    "defaultGoTo": "S40_MANAGER_APPROVAL"
  }
}
```

### Risk-Based Credit Approval

```json
{
  "decision": {
    "cases": [
      {
        "when": {
          "op": "OR",
          "args": [
            { "op": "GTE", "left": { "var": "orderAmount" }, "right": { "const": 150000 } },
            {
              "op": "EQ",
              "left": { "lookup": "risk.customerTier", "args": [{ "var": "customerId" }] },
              "right": { "const": "HIGH" }
            }
          ]
        },
        "goTo": "S70_CFO_APPROVAL"
      },
      {
        "when": { "op": "GTE", "left": { "var": "orderAmount" }, "right": { "const": 50000 } },
        "goTo": "S60_FINANCE_APPROVAL"
      }
    ],
    "defaultGoTo": "S50_CREDIT_CONTROLLER"
  }
}
```

---

## Rule Engine Implementation

### TypeScript Interface

```typescript
interface Condition {
  op: Operator;
  left?: Operand;
  right?: Operand;
  args?: Condition[];
}

interface Operand {
  var?: string;
  const?: any;
  ctx?: string;
  lookup?: string;
  args?: Operand[];
}

type Operator =
  | 'EQ'
  | 'NE'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'IS_NULL'
  | 'NOT_NULL'
  | 'IS_EMPTY'
  | 'NOT_EMPTY'
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'IN'
  | 'NOT_IN'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'BEFORE'
  | 'AFTER'
  | 'BETWEEN';
```

### Evaluation Context

```typescript
interface EvaluationContext {
  variables: Record<string, any>; // Workflow payload/snapshot
  submitter: SubmitterContext; // Submitter info
  actor: ActorContext; // Current user
  lookupProviders: LookupProviders; // Registered lookup functions
}

interface SubmitterContext {
  userId: string;
  departmentId: string;
  companyId: string;
  siteId: string;
  grade: string;
  type: 'EMPLOYEE' | 'CONTRACTOR' | 'PARTNER';
}
```
