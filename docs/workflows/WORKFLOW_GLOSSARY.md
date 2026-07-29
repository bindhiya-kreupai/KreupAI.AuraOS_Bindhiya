# AuraOS Enterprise Workflow Glossary & Dictionary

## Master Business, Technical & Architectural Vocabulary

> **Document Code:** `DOC-GLOSS-001`  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Official Master Terminology Dictionary  
> **Target Audience:** All AuraOS Authors, Reviewers, Business Analysts, Developers, QA Engineers, Enterprise Customers

---

## 1. Introduction & Usage Guide

The **AuraOS Enterprise Workflow Glossary** is the definitive, single source of truth for business vocabulary, technical definitions, acronyms, and formatting conventions used across the entire AuraOS documentation library.

### 1.1 Purpose

This glossary eliminates ambiguity by standardizing terminology across all 29 workflow specifications, architecture documents, API catalogs, and database schemas. Every workflow specification MUST link to or reference terms in this dictionary rather than redefining terms locally.

### 1.2 How to Use This Glossary

- **For Technical Authors:** Verify approved terms, acronyms, and forbidden words before writing workflow specifications.
- **For Developers & Architects:** Align API payload fields, Prisma model properties, and code comments with official business vocabulary.
- **For Business Analysts & QA:** Ensure acceptance criteria and test scripts use exact domain terminology.

---

## 2. Enterprise Documentation Terms

### Workflow

- **Category:** Core Process Architecture
- **Definition:** An orchestrated sequence of business activities, validations, and state transitions performed by human actors or automated system workers to achieve an enterprise operational outcome.
- **Business Context:** Governs business procedures such as leave requests, expense approvals, and payroll runs.
- **Technical Context:** Executed via dedicated service state machines (e.g., `ExpenseService`) or the generic BullMQ worker engine (`workflowExecutionWorker.ts`).
- **Related Terms:** `Workflow Definition`, `Workflow Instance`, `Business Process`
- **Preferred Usage:** `Workflow` (Capitalized in formal titles, lower-case in text).
- **Example Sentence:** "The Expense Claim Approval Workflow evaluates policy rules before routing to the manager."
- **Repository Relevance:** `apps/web/src/lib/services/expense.service.ts`

---

### Workflow Definition

- **Category:** Core Process Architecture
- **Definition:** The immutable structural metadata, node graph layout, condition rules, and approval chains defining how a workflow behaves.
- **Business Context:** The template designed by business administrators for a specific process (e.g., GCC Leave Approval Template).
- **Technical Context:** Persisted in the `WorkflowDefinition` Prisma entity.
- **Related Terms:** `Workflow Instance`, `Node Graph`
- **Preferred Usage:** `Workflow Definition` (NOT _Workflow Plan_ or _Workflow Schema_).
- **Repository Relevance:** `packages/@aura/database/prisma/schema.prisma` (`WorkflowDefinition`)

---

### Workflow Instance

- **Category:** Core Process Architecture
- **Definition:** A single runtime execution of a published Workflow Definition tracking active node state, variable payload, and history.
- **Business Context:** A specific leave application submitted by an employee on a specific date.
- **Technical Context:** Persisted in the `WorkflowInstance` entity; tracked by BullMQ job ID.
- **Related Terms:** `Workflow Definition`, `State Machine`
- **Preferred Usage:** `Workflow Instance` (NOT _Workflow Job_ or _Run Record_).
- **Repository Relevance:** `services/workflow-service/src/workers/workflowExecutionWorker.ts`

---

### Workflow Engine

- **Category:** Platform Infrastructure
- **Definition:** The asynchronous microservice runtime responsible for evaluating conditions, queuing background jobs, and advancing workflow nodes.
- **Business Context:** The background system orchestrating multi-step automation without manual intervention.
- **Technical Context:** Standalone Node.js service running Redis + BullMQ workers with concurrency=10.
- **Related Terms:** `BullMQ`, `Worker`, `Queue`
- **Preferred Usage:** `Workflow Engine` (NOT _BPM Server_ or _Automation Runner_).
- **Repository Relevance:** `services/workflow-service/src/services/workflowEngine.ts`

---

### Workflow Stage

- **Category:** Multi-Stage Governance
- **Definition:** A major sequential checkpoint or phase within a multi-stage case (e.g., `PRE_JOINING`, `ENROLMENT`).
- **Business Context:** Governs high-level phase progression in long-running processes such as Employee Onboarding.
- **Technical Context:** Stored in `currentStage` field on `OnboardingCase`; validated by sequential stage guards.
- **Related Terms:** `Onboarding Case`, `Stage History`
- **Preferred Usage:** `Workflow Stage` (NOT _Workflow Step_ or _Phase_).
- **Repository Relevance:** `apps/web/src/lib/services/onboarding-case.service.ts`

---

### Workflow State / Status

- **Category:** State Machine Architecture
- **Definition:** The discrete position of a request or instance within its state machine lifecycle (e.g., `DRAFT`, `SUBMITTED`, `APPROVED`).
- **Business Context:** Indicates current processing status for applicants and approvers.
- **Technical Context:** Represented as UPPERCASE string literals in Prisma enums and service transition maps.
- **Related Terms:** `State Transition`, `Allowed Transitions`
- **Preferred Usage:** `Status` or `Workflow State` (NOT _Flag_ or _Condition_).
- **Repository Relevance:** `apps/web/src/lib/services/exit.service.ts` (`STATUS_TRANSITIONS`)

---

## 3. Business & Organizational Terms

### Employee

- **Category:** Organizational Management
- **Definition:** An individual engaged under an employment contract within a tenant organization.
- **Business Context:** Primary subject of HR, Leave, Payroll, and Performance workflows.
- **Technical Context:** Represented by the `Employee` Prisma model (`employeeId`).
- **Preferred Usage:** `Employee` (STRICTLY PROHIBITED: _Staff_, _Staff Member_, _Worker_, _User_).
- **Repository Relevance:** `packages/@aura/database/prisma/schema.prisma` (`Employee`)

---

### Tenant

- **Category:** Multi-Tenant Platform Architecture
- **Definition:** An isolated customer enterprise entity within the multi-tenant AuraOS platform infrastructure.
- **Business Context:** A customer company or conglomerate operating within AuraOS.
- **Technical Context:** Every API request and database query MUST scope data by `tenantId`.
- **Preferred Usage:** `Tenant` or `Tenant Organization` (NOT _Company Account_ or _Client Account_).
- **Repository Relevance:** `apps/web/src/lib/auth.ts` (`ctx.user.tenantId`)

---

### Maker-Checker

- **Category:** Enterprise Governance
- **Definition:** A dual-control governance pattern requiring one actor to create/submit a transaction (Maker) and a different actor to verify/approve it (Checker).
- **Business Context:** Prevents fraud and unauthorized data modification in financial and workforce changes.
- **Technical Context:** Implemented in `requisitionMakerCheckerService` and `ProfileChangeService`.
- **Preferred Usage:** `Maker-Checker` (NOT _Four-Eyes Principle_ or _Dual Control_).
- **Repository Relevance:** `apps/web/src/app/api/v1/workforce-planning/requisition-workflow/route.ts`

---

## 4. Workflow Operations & Approval Terms

### Approval

- **Category:** Governance Operation
- **Definition:** An affirmative decision rendered by an authorized approver advancing a request to the next state or completion.
- **Preferred Usage:** `Approval` (NOT _Acceptance_ or _Sign-off_).

### Rejection

- **Category:** Governance Operation
- **Definition:** A negative decision rendered by an approver terminating a request or returning it to `DRAFT`.
- **Preferred Usage:** `Rejection` (NOT _Denial_, _Decline_, or _Refusal_).

### Delegation

- **Category:** Governance Operation
- **Definition:** Reassigning approval authority from a primary approver to a designated proxy for a specific time window.
- **Preferred Usage:** `Delegation` (NOT _Substitution_ or _Forwarding_).

### Escalation

- **Category:** Governance Operation
- **Definition:** Automatically reassigning an overdue approval task to a higher-level role when SLA thresholds are breached.
- **Preferred Usage:** `Escalation` (NOT _Upgrade_ or _Rollover_).

---

## 5. HR, Workforce & GCC Compliance Terms

### End-of-Service Benefit (EOSB)

- **Category:** Regional Payroll Compliance (GCC)
- **Definition:** Statutory severance gratuity calculated based on tenure and last drawn basic salary per country labor laws.
- **Business Context:** Mandatory calculation during Employee Exit in UAE (Federal Law 33/2021), KSA, Bahrain, Qatar, Oman, and Kuwait.
- **Technical Context:** Calculated by `fullFinalService.calculateEOSB()`.
- **Preferred Usage:** `End-of-Service Benefit (EOSB)` (NOT _Severance Payout_ or _Gratuity Payout_).
- **Repository Relevance:** `apps/web/src/lib/services/full-final.service.ts`

---

### Comp-Off (Compensatory Off)

- **Category:** Time & Attendance
- **Definition:** Time off credited to an employee in lieu of worked overtime hours or weekend work.
- **Technical Context:** Created via `overtime.service.ts` method `convertToCompOff()`.
- **Preferred Usage:** `Comp-Off` or `Compensatory Off` (NOT _Overtime Credit_).
- **Repository Relevance:** `apps/web/src/lib/services/overtime.service.ts`

---

## 6. Acronym Dictionary (22 Key Acronyms)

| Acronym     | Full Enterprise Expansion                     | Operational Definition / Context                                     |
| ----------- | --------------------------------------------- | -------------------------------------------------------------------- |
| **API**     | Application Programming Interface             | REST/HTTP contract interface connecting frontend to backend services |
| **BPM**     | Business Process Management                   | Discipline and tools governing workflow orchestration                |
| **BPMN**    | Business Process Model and Notation           | Visual standard representation for enterprise workflows              |
| **CRUD**    | Create, Read, Update, Delete                  | Four basic operations of persistent storage                          |
| **DSAR**    | Data Subject Access Request                   | GDPR / Privacy compliance data access/erasure workflow               |
| **DTO**     | Data Transfer Object                          | Structured Zod/TypeScript payload object passed across boundaries    |
| **EOSB**    | End-of-Service Benefit                        | GCC statutory severance calculation (UAE Law 33/2021)                |
| **ERP**     | Enterprise Resource Planning                  | Integrated suite managing core workforce and financial operations    |
| **FMLA**    | Family and Medical Leave Act                  | US statutory unpaid protected leave entitlement                      |
| **GCC**     | Gulf Cooperation Council                      | Regional legal entity jurisdiction (UAE, KSA, BH, QA, OM, KW)        |
| **HCM**     | Human Capital Management                      | End-to-end workforce lifecycle application suite                     |
| **JWT**     | JSON Web Token                                | Secure authentication token format carrying tenant/user context      |
| **KPI**     | Key Performance Indicator                     | Quantitative metric measuring workflow operational health            |
| **ORM**     | Object-Relational Mapping                     | Database access abstraction layer implemented via Prisma             |
| **RACI**    | Responsible, Accountable, Consulted, Informed | Responsibility assignment matrix model                               |
| **RBAC**    | Role-Based Access Control                     | Permission strategy granting access based on system roles            |
| **REST**    | Representational State Transfer               | Architectural style for HTTP API endpoints                           |
| **SLA**     | Service Level Agreement                       | Defined maximum time window for task completion                      |
| **UAT**     | User Acceptance Testing                       | Final operational verification by enterprise users                   |
| **UI / UX** | User Interface / User Experience              | Graphical frontend visual layout and user interaction design         |
| **UUID**    | Universally Unique Identifier                 | 128-bit unique string record key identifier                          |
| **Zod**     | Zod TypeScript Validation Library             | Schema validation engine enforcing API input contracts               |

---

## 7. Terminology Preference Table

Authors MUST strictly adhere to the preferred terms below:

| Preferred Term           | Prohibited Term                     | Context / Reason                         |
| ------------------------ | ----------------------------------- | ---------------------------------------- |
| `Employee`               | Staff, Staff Member, Worker, Person | Standard HCM domain entity name          |
| `Workflow Stage`         | Step, Phase, Milestone              | Multi-stage case governance terminology  |
| `Workflow Status`        | Flag, Condition, Situation          | State machine position string literal    |
| `Approval`               | Acceptance, Sign-off, Permission    | Formal affirmative decision term         |
| `Rejection`              | Denial, Decline, Refusal            | Formal negative decision term            |
| `Line Manager`           | Supervisor, Boss, Team Lead         | Direct reporting relationship term       |
| `Tenant`                 | Company, Client, Org Account        | Multi-tenant platform isolation boundary |
| `Maker-Checker`          | Four-Eyes Principle, Dual Control   | Segregation of duties governance pattern |
| `End-of-Service Benefit` | Gratuity, Severance                 | GCC statutory compliance term            |
| `Prisma Model`           | SQL Table, Database Table           | Schema persistence entity term           |

---

## 8. Synonym Index

- **Employee** $\to$ _Worker_, _Staff_, _Personnel_, _Team Member_ (Use **Employee**)
- **Workflow Stage** $\to$ _Phase_, _Step_, _Checkpoint_ (Use **Workflow Stage**)
- **Line Manager** $\to$ _Supervisor_, _Boss_, _Reporting Manager_ (Use **Line Manager**)
- **End-of-Service Benefit** $\to$ _Gratuity_, _Severance_, _Final Payout_ (Use **End-of-Service Benefit**)

---

## 9. Forbidden Terminology

The following subjective, vague, informal, or marketing words MUST NEVER appear in any AuraOS technical specification:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Forbidden Words List                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ Easy / Easily               ❌ Simple / Simply              ❌ Magic / Magically    │
│ ❌ Just                       ❌ Obviously                    ❌ Stuff                 │
│ ❌ Thing                      ❌ Etc. / et cetera             ❌ Misc / Miscellaneous  │
│ ❌ Various                    ❌ Seamless                     ❌ Powerful              │
│ ❌ Best-in-class              ❌ Out-of-the-box               ❌ State-of-the-art      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Glossary Cross-References

Glossary terms link directly to master documentation infrastructure artifacts:

- **State Machine Rules:** Referenced in `docs/workflows/WORKFLOW_STANDARDS.md#section-9`.
- **Writing Formatting:** Governed by `docs/workflows/WORKFLOW_STYLE_GUIDE.md`.
- **QA Gate Verification:** Enforced by `docs/workflows/WORKFLOW_REVIEW_CHECKLIST.md`.
- **Master Generation Sequence:** Tracked in `docs/workflows/WORKFLOW_GENERATION_PLAN.md`.

---

_End of Workflow Glossary & Dictionary (`DOC-GLOSS-001`)._
