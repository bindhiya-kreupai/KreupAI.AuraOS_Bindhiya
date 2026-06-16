# AuraOS HRMS — GCC Compliance Product Backlog

Epics and detailed user stories derived from **GCC HR Compliance Handbook (2026 Edition)**.
Every chapter and appendix requirement in the handbook is mapped to an epic, and every epic
section is covered by one or more user stories with acceptance criteria and implementation tasks.

- **Product:** AuraOS HRMS — GCC HR, Payroll, Immigration & Workforce Compliance
- **Stack assumed:** NestJS/TypeScript backend · PostgreSQL · React/Next.js frontend · workflow + country rule engine · event bus · RBAC · audit trail
- **Total epics:** 38 · **User stories:** 650 · **Requirement sections mapped:** 1084
- **Source:** `GCC HR Compliance Handbook - AuraOS.docx`

## How to use in GitHub

Each `epics/EPIC-XX-*.md` file is an epic with its user stories. Stories are written as
GitHub-issue-ready blocks (title, As-a/I-want/So-that, acceptance criteria checklist, task
checklist, labels, priority, estimate). To bulk-create issues, use `issues-import.csv`
with the GitHub CLI or an importer. Suggested workflow: create one GitHub _milestone_ or
_parent issue_ per epic, then create child issues per story and link them.

## Conventions

- **Epic ID:** `EPIC-01` … `EPIC-38` · **Story ID:** `EPIC-XX-S01`, `EPIC-XX-S02`, …
- **Priority:** MoSCoW — `Must` / `Should` / `Could` / `Won't (now)`
- **Estimate:** story points (Fibonacci 1,2,3,5,8,13)
- **Given/When/Then** acceptance criteria; tasks split across schema · API · UI · rules · alerts · tests
- **`Covers:`** lists the exact handbook section(s) the story satisfies (traceability)

### Personas

`HR Admin` · `HR Manager` · `Payroll Officer` · `PRO / Immigration Officer` · `Compliance Officer` ·
`Line Manager` · `Employee (Self-Service)` · `Internal Auditor` · `Executive / Leadership` · `System Administrator`

### Labels

`epic` · `user-story` · `gcc-compliance` and module labels:
`core-hr` · `recruitment` · `payroll` · `wps` · `time-attendance` · `leave` · `social-insurance` ·
`nationalization` · `immigration` · `benefits` · `welfare` · `hse` · `employee-relations` ·
`separation` · `eosb` · `analytics` · `policies` · `forms` · `platform` · `audit`

## Epic Index

| Epic    | Title                                                          | Module                         | Sections | File                                                                                                                         |
| ------- | -------------------------------------------------------------- | ------------------------------ | :------: | ---------------------------------------------------------------------------------------------------------------------------- |
| EPIC-01 | Chapter 1: GCC Employment Landscape                            | Foundation                     |    6     | [`epics/EPIC-01-gcc-employment-landscape.md`](epics/EPIC-01-gcc-employment-landscape.md)                                     |
| EPIC-02 | Chapter 2 – Regulatory Framework                               | Platform / Country Rule Engine |    20    | [`epics/EPIC-02-chapter-2-regulatory-framework.md`](epics/EPIC-02-chapter-2-regulatory-framework.md)                         |
| EPIC-03 | Chapter 3 – Workforce Planning & Manpower Compliance           | Core HR                        |    14    | [`epics/EPIC-03-chapter-3-workforce-planning-manpower-comp.md`](epics/EPIC-03-chapter-3-workforce-planning-manpower-comp.md) |
| EPIC-04 | Chapter 4 – Recruitment & Selection Compliance                 | Recruitment                    |    21    | [`epics/EPIC-04-chapter-4-recruitment-selection-compliance.md`](epics/EPIC-04-chapter-4-recruitment-selection-compliance.md) |
| EPIC-05 | Chapter 5 – Offer Management & Pre-Employment Compliance       | Recruitment                    |    21    | [`epics/EPIC-05-chapter-5-offer-management-pre-employment-.md`](epics/EPIC-05-chapter-5-offer-management-pre-employment-.md) |
| EPIC-06 | Chapter 6 – Employee Onboarding Compliance                     | Core HR                        |    23    | [`epics/EPIC-06-chapter-6-employee-onboarding-compliance.md`](epics/EPIC-06-chapter-6-employee-onboarding-compliance.md)     |
| EPIC-07 | Chapter 7 – Immigration & Work Authorization Compliance        | Immigration                    |    19    | [`epics/EPIC-07-chapter-7-immigration-work-authorization-c.md`](epics/EPIC-07-chapter-7-immigration-work-authorization-c.md) |
| EPIC-08 | Chapter 8 – Employee Records Management                        | Core HR                        |    21    | [`epics/EPIC-08-chapter-8-employee-records-management.md`](epics/EPIC-08-chapter-8-employee-records-management.md)           |
| EPIC-09 | Chapter 9 – Organization & Position Management                 | Core HR                        |    22    | [`epics/EPIC-09-chapter-9-organization-position-management.md`](epics/EPIC-09-chapter-9-organization-position-management.md) |
| EPIC-10 | Chapter 10 – Payroll Management & Processing                   | Payroll                        |    20    | [`epics/EPIC-10-chapter-10-payroll-management-processing.md`](epics/EPIC-10-chapter-10-payroll-management-processing.md)     |
| EPIC-11 | Chapter 11 – Wage Protection System Compliance                 | Payroll / WPS                  |    22    | [`epics/EPIC-11-chapter-11-wage-protection-system-complian.md`](epics/EPIC-11-chapter-11-wage-protection-system-complian.md) |
| EPIC-12 | Chapter 12 – Overtime Compliance                               | Time & Attendance              |    24    | [`epics/EPIC-12-chapter-12-overtime-compliance.md`](epics/EPIC-12-chapter-12-overtime-compliance.md)                         |
| EPIC-13 | Chapter 13 – GOSI Compliance                                   | Social Insurance               |    22    | [`epics/EPIC-13-chapter-13-gosi-compliance.md`](epics/EPIC-13-chapter-13-gosi-compliance.md)                                 |
| EPIC-14 | Chapter 14 – GPSSA Compliance                                  | Social Insurance               |    23    | [`epics/EPIC-14-chapter-14-gpssa-compliance.md`](epics/EPIC-14-chapter-14-gpssa-compliance.md)                               |
| EPIC-15 | Chapter 15 – Bahrain SIO Compliance                            | Social Insurance               |    23    | [`epics/EPIC-15-chapter-15-bahrain-sio-compliance.md`](epics/EPIC-15-chapter-15-bahrain-sio-compliance.md)                   |
| EPIC-16 | Chapter 16 – Emiratisation Compliance                          | Nationalization                |    26    | [`epics/EPIC-16-chapter-16-emiratisation-compliance.md`](epics/EPIC-16-chapter-16-emiratisation-compliance.md)               |
| EPIC-17 | Chapter 17 – Nitaqat / Saudization Compliance                  | Nationalization                |    26    | [`epics/EPIC-17-chapter-17-nitaqat-saudization-compliance.md`](epics/EPIC-17-chapter-17-nitaqat-saudization-compliance.md)   |
| EPIC-18 | Chapter 18 – Bahrainization Compliance                         | Nationalization                |    28    | [`epics/EPIC-18-chapter-18-bahrainization-compliance.md`](epics/EPIC-18-chapter-18-bahrainization-compliance.md)             |
| EPIC-19 | Chapter 19 – Attendance Compliance                             | Time & Attendance              |    30    | [`epics/EPIC-19-chapter-19-attendance-compliance.md`](epics/EPIC-19-chapter-19-attendance-compliance.md)                     |
| EPIC-20 | Chapter 20 – Leave Management Compliance                       | Time & Attendance              |    34    | [`epics/EPIC-20-chapter-20-leave-management-compliance.md`](epics/EPIC-20-chapter-20-leave-management-compliance.md)         |
| EPIC-21 | Chapter 21 – Public Holidays and Religious Holidays Compliance | Time & Attendance              |    27    | [`epics/EPIC-21-chapter-21-public-holidays-and-religious-h.md`](epics/EPIC-21-chapter-21-public-holidays-and-religious-h.md) |
| EPIC-22 | Chapter 22 – Employee Benefits Compliance                      | Benefits                       |    31    | [`epics/EPIC-22-chapter-22-employee-benefits-compliance.md`](epics/EPIC-22-chapter-22-employee-benefits-compliance.md)       |
| EPIC-23 | Chapter 23 – Accommodation and Labour Camp Compliance          | Welfare                        |    36    | [`epics/EPIC-23-chapter-23-accommodation-and-labour-camp-c.md`](epics/EPIC-23-chapter-23-accommodation-and-labour-camp-c.md) |
| EPIC-24 | Chapter 24 – Health, Safety and Welfare Compliance             | HSE                            |    32    | [`epics/EPIC-24-chapter-24-health-safety-and-welfare-compl.md`](epics/EPIC-24-chapter-24-health-safety-and-welfare-compl.md) |
| EPIC-25 | Chapter 25 – Employee Relations and Grievance Compliance       | Employee Relations             |    34    | [`epics/EPIC-25-chapter-25-employee-relations-and-grievanc.md`](epics/EPIC-25-chapter-25-employee-relations-and-grievanc.md) |
| EPIC-26 | Chapter 26 – Disciplinary Action Compliance                    | Employee Relations             |    30    | [`epics/EPIC-26-chapter-26-disciplinary-action-compliance.md`](epics/EPIC-26-chapter-26-disciplinary-action-compliance.md)   |
| EPIC-27 | Chapter 27 – Termination and Separation Compliance             | Separation                     |    37    | [`epics/EPIC-27-chapter-27-termination-and-separation-comp.md`](epics/EPIC-27-chapter-27-termination-and-separation-comp.md) |
| EPIC-28 | Chapter 28 – End-of-Service Benefits Compliance                | Separation                     |    30    | [`epics/EPIC-28-chapter-28-end-of-service-benefits-complia.md`](epics/EPIC-28-chapter-28-end-of-service-benefits-complia.md) |
| EPIC-29 | Chapter 29 – Visa, Work Permit and Immigration Exit Compliance | Immigration                    |    28    | [`epics/EPIC-29-chapter-29-visa-work-permit-and-immigratio.md`](epics/EPIC-29-chapter-29-visa-work-permit-and-immigratio.md) |
| EPIC-30 | Chapter 30 – Document Retention and HR Audit Compliance        | Compliance / Audit             |    38    | [`epics/EPIC-30-chapter-30-document-retention-and-hr-audit.md`](epics/EPIC-30-chapter-30-document-retention-and-hr-audit.md) |
| EPIC-31 | Chapter 31 – HR Compliance Dashboard and Controls              | Analytics                      |    31    | [`epics/EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md`](epics/EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md) |
| EPIC-32 | Chapter 32 – HR Policies                                       | Policies                       |    32    | [`epics/EPIC-32-chapter-32-hr-policies.md`](epics/EPIC-32-chapter-32-hr-policies.md)                                         |
| EPIC-33 | Chapter 33 – HR Forms and Templates                            | Forms                          |    45    | [`epics/EPIC-33-chapter-33-hr-forms-and-templates.md`](epics/EPIC-33-chapter-33-hr-forms-and-templates.md)                   |
| EPIC-34 | Chapter 34 – HRMS Configuration for GCC Compliance             | Platform                       |    34    | [`epics/EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md`](epics/EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md) |
| EPIC-35 | Compliance Calendar & Scheduling Automation                    | Platform / Scheduler           |    27    | [`epics/EPIC-35-compliance-calendar-scheduling-automation.md`](epics/EPIC-35-compliance-calendar-scheduling-automation.md)   |
| EPIC-36 | GCC Country Compliance Library & Rule Config                   | Platform / Country Rule Engine |    19    | [`epics/EPIC-36-gcc-country-compliance-library-rule-config.md`](epics/EPIC-36-gcc-country-compliance-library-rule-config.md) |
| EPIC-37 | Compliance Checklist & Red-Flag Engine                         | Compliance / Audit             |   102    | [`epics/EPIC-37-compliance-checklist-red-flag-engine.md`](epics/EPIC-37-compliance-checklist-red-flag-engine.md)             |
| EPIC-38 | Compliance KPI & Scorecard Library                             | Analytics                      |    26    | [`epics/EPIC-38-compliance-kpi-scorecard-library.md`](epics/EPIC-38-compliance-kpi-scorecard-library.md)                     |

> **Coverage note:** The handbook body skips a standalone Chapter 10 (Payroll) and duplicates
> Chapter 9. This backlog corrects that: Chapter 9 is de-duplicated and **EPIC-10 Payroll
> Management & Processing** is added so payroll requirements (referenced across WPS, GOSI/GPSSA/SIO,
> EOSB, and HRMS §34.9) are fully covered. Appendix A8 (Glossary) is reference data, captured as the
> HR Data Dictionary inside EPIC-34 / EPIC-36 rather than as a separate epic.
