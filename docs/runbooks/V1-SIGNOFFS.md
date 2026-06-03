# v1.0 Workstream Sign-offs (#80)

**Purpose:** PMO-owned collection point for the 9 workstream sign-offs that gate v1.0 release. Cross-referenced from [V1-RELEASE-GATE.md](./V1-RELEASE-GATE.md).

**How to record a sign-off:** the workstream PM appends a row to the relevant table below with name + ISO date + the PR or recording link that proves the demo happened. Once all 9 rows are filled, file the release ticket.

---

## Workstream sign-off matrix

| #   | Workstream                 | Owner                 | Acceptance criteria source                                                                         | Sign-off recorded |
| --- | -------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Core Services              | PM (Core)             | [GUIDE-CORE-SERVICE-COMPLETION.md](../implementation/GUIDE-CORE-SERVICE-COMPLETION.md)             | ☐ pending         |
| 2   | Payroll Engine             | PM (Payroll)          | [GUIDE-PAYROLL-ENGINE-COMPLETION.md](../implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md)         | ☐ pending         |
| 3   | Leave Engine               | PM (HR)               | [GUIDE-LEAVE-ENGINE-COMPLETION.md](../implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md)             | ☐ pending         |
| 4   | Attendance                 | PM (HR)               | [GUIDE-ATTENDANCE-COMPLETION.md](../implementation/GUIDE-ATTENDANCE-COMPLETION.md)                 | ☐ pending         |
| 5   | Recruitment                | PM (Talent)           | [GUIDE-RECRUITMENT-COMPLETION.md](../implementation/GUIDE-RECRUITMENT-COMPLETION.md)               | ☐ pending         |
| 6   | Export / Reporting         | PM (Core)             | [GUIDE-EXPORT-REPORTING-COMPLETION.md](../implementation/GUIDE-EXPORT-REPORTING-COMPLETION.md)     | ☐ pending         |
| 7   | Audit / Compliance         | Compliance / Security | [GUIDE-AUDIT-COMPLIANCE-COMPLETION.md](../implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)     | ☐ pending         |
| 8   | Employee Lifecycle History | PM (Core)             | [GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md](../implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md)       | ☐ pending         |
| 9   | Mobile                     | PM (Mobile)           | [GUIDE-MOBILE-INTEGRATION-COMPLETION.md](../implementation/GUIDE-MOBILE-INTEGRATION-COMPLETION.md) | ☐ pending         |

### Bilingual + accessibility block-of-five (per workstream)

| Workstream    | EN + AR no truncation | RTL renders | WCAG 2.1 AA | Mobile happy path | Tenant isolation |
| ------------- | --------------------- | ----------- | ----------- | ----------------- | ---------------- |
| Core Services | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Payroll       | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Leave         | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Attendance    | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Recruitment   | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Export        | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Audit         | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Lifecycle     | ☐                     | ☐           | ☐           | ☐                 | ☐                |
| Mobile        | ☐                     | ☐           | ☐           | ☐                 | ☐                |

---

## Release-gate prerequisites checklist

These must be green before any PM sign-off is collected (otherwise the demo can drift from the shipping artefact).

| Gate                                    | Status | Evidence                                                   |
| --------------------------------------- | ------ | ---------------------------------------------------------- |
| Service tests 100% green                | ☐      | `pnpm vitest run` in `apps/web`                            |
| Integration tests 100% green            | ☐      | `pnpm vitest run` in `services/*`                          |
| Critical-path E2E nightly green ×3 runs | ☐      | Latest 3 runs of `.github/workflows/critical-path-e2e.yml` |
| Security blockers #20–25 closed         | ☐      | Issues + audit log                                         |
| Observability dashboards live (#82)     | ☐      | DevOps dashboard URL                                       |
| No P0/P1 open defects in workstream     | ☐      | Jira / GitHub query                                        |
| Tenant isolation analyzer at 0 findings | ☐      | `pnpm check:tenant-isolation`                              |

---

## Final tag + release ticket

Once all 9 sign-offs are recorded and all gates are green:

1. PMO files `release/v1.0.0` ticket.
2. Engineering Lead cuts `v1.0.0` tag on `main`.
3. CD workflow publishes the release.
4. PMO posts the release announcement.

Last updated: 2026-06-03
