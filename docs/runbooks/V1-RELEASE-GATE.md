# Runbook — v1.0 Release Gate (#80, #83)

**Status:** Open release-readiness items blocking the v1.0 ship.
**Audience:** Engineering management + Product + QA.

The phase-2 PR closed the code-level v1.0 scope; this runbook captures the two non-code items that still gate the actual release: end-to-end validation (#83) and product sign-off (#80).

---

## #83 — End-to-End Validation

### Scope

Independent validation that the v1.0 workstreams behave correctly through real user journeys, not just unit-test-passing.

### Required E2E scenarios

#### 1. Hire-to-Payroll (UAE)

```
HR Admin                                                      Employee
  │                                                            │
  ├─ Add new employee → API: POST /v1/employees                │
  ├─ Wait for welcome email                                    │
  ├─ Assign to grade with SalaryStructure                       │
  └─ Run payroll for current month                              │
       ↓                                                       ↓
       ├─ Verify payslip generated                            ←─ Open mobile app
       ├─ Verify UAE WPS SIF generated with this employee      ├─ Download payslip PDF
       └─ Submit WPS via real MoHRE submission ref             └─ Confirm payslip total
```

Verifications:

- Bilingual error responses (`message` + `messageAr`) in all error paths.
- AuditLog entries for every state transition.
- Tenant isolation: a second tenant's HR admin cannot see employee A.

#### 2. Leave Request to Payroll Deduction (India)

```
Employee submits leave → manager approves → leave balance debited →
next payroll run applies LOP deduction → payslip reflects.
```

Verifications:

- LeaveAccrual row created with correct prorated days.
- TDS recalculation based on adjusted gross.
- Form-24Q quarterly statutory report includes the adjusted figures.

#### 3. Recruitment Funnel

```
Open requisition → publish to career site → candidate applies →
interview scheduling → offer issued via e-sign → onboarding kicked off.
```

Verifications:

- Audit trail across all 14 audited recruitment write paths.
- File upload (resume) flows through to actual S3 / file store.

#### 4. Exit + F&F (KSA)

```
Resignation submitted → manager approves → exit clearance opened →
each clearance department signs off → on final clearance, F&F auto-calculated →
F&F approved + processed → settlement amount written back to ExitRequest.
```

Verifications:

- F&F gratuity matches KSA Labour Law Art. 84 hand-calc.
- All clearances must be APPROVED before exit can complete (refuse otherwise).

#### 5. Mobile-only happy path

- Login on iOS + Android.
- Pull-to-refresh on dashboard.
- Submit a leave request entirely from mobile.
- Approve on manager mobile.
- Offline mode: queue an action while airplane-mode, replay on reconnect.

### Tooling

- **Playwright** for web flows. Lives at `apps/web/tests/e2e/` (folder ready, tests pending).
- **Detox** or **Maestro** for mobile flows.
- One CI job runs each domain's e2e suite against a fresh seeded DB.

### Exit criteria

- All 5 scenarios pass on 3 consecutive nightly CI runs.
- No P0 / P1 defects open in the e2e suite.
- Sign-off recorded in PR description by the QA Lead.

---

## #80 — Product Sign-off

### Scope

Cross-functional approval that v1.0 meets the product / commercial bar.

### Sign-off matrix (1 per workstream)

| Workstream         | Sign-off owner            | Acceptance criteria source                                   |
| ------------------ | ------------------------- | ------------------------------------------------------------ |
| Core Services      | Product Manager (Core)    | `docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md`       |
| Payroll Engine     | Product Manager (Payroll) | `docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md`     |
| Leave Engine       | Product Manager (HR)      | `docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md`       |
| Attendance         | Product Manager (HR)      | `docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md`         |
| Recruitment        | Product Manager (Talent)  | `docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md`        |
| Export / Reporting | Product Manager (Core)    | `docs/implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md`   |
| Audit              | Compliance / Security     | `docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md`   |
| Lifecycle History  | Product Manager (Core)    | `docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md`    |
| Mobile             | Product Manager (Mobile)  | `docs/implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md` |

### Process

1. Schedule a 60-minute review per workstream.
2. Each session walks the demo path from the implementation guide.
3. PM signs the bottom of the doc with `Signed off: <name>, <date>`.
4. PMO collects sign-offs in `docs/runbooks/V1-SIGNOFFS.md`.
5. Once all 9 are in, file the release ticket and tag v1.0.

### Bilingual + accessibility checklist (block-of-five)

Before sign-off, each workstream's UI is:

- Bilingual (EN + AR) without truncation.
- RTL renders correctly.
- Hits WCAG 2.1 AA on the headline screens (use axe-core in Playwright).
- Mobile passes Detox/Maestro happy path.
- Tenant isolation verified by switching tenants in the test environment.

---

## Decision required

Both #80 and #83 need a sponsor — these are not code work and cannot be executed by the engineering agent. Once the sponsor names a QA lead and the 9 PM sign-off owners, this runbook becomes the project plan.
