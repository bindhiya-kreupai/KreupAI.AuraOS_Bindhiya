# Module Link Map

> Reference: `docs/aura-master-instructions.md`  
> Purpose: describe how major modules depend on and feed each other so integration stories are explicit.

## System of Record & Governance
- `core-hr` owns people profiles, employment history, organization structures, and documents; everything else reads from it.
- `admin/master-data` defines global picklists (roles, job families, grades, cost centers, locations) consumed by recruitment, payroll, learning, and analytics.
- `user-management` controls identities (SSO/MFA), roles, and sessions; all modules should respect its RBAC and audit policies.
- `localization` supplies locale/time/currency settings used by payroll, leave, attendance, and finance.
- `workflow-engine` orchestrates approvals across modules (recruitment offers, leave approvals, payroll changes, policy acknowledgements).

## Talent Lifecycle
- `job-library` and `position-budgeting` define roles and vacancies; they feed `recruitment` requisitions and `workforce-planning` forecasts.
- `recruitment` outputs offers that trigger `onboarding` tasks and creation of `core-hr` employee records.
- `onboarding` hands off to `learning` (inductions), `equipment/facilities` (access + assets), and `payroll` (initial compensation setup).
- `performance`, `learning`, `career`, and `succession-planning` share competencies and goals from `job-library` and feed readiness insights into `workforce-planning`.
- `offboarding` consumes last-pay data from `payroll`, deactivates accounts through `user-management`, and can move people into `alumni-network`.

## Time, Pay, and Benefits
- `attendance` + `leave` (timesheets, accruals) feed `payroll` for gross calculations and `analytics` for productivity/availability reporting.
- `payroll` depends on `compensation` (salary structure, bonuses, stock), `benefits` (deductions, enrollments), and `travel`/`expenses` for reimbursements.
- `travel` and `expenses` need policy rules from `policy-mgmt` and cost centers from `admin/master-data` to code expenses correctly.
- `benefits`, `wellness`, and `health-safety` share eligibility and dependents from `core-hr`; claims and programs should sync into `analytics`.

## Service, Automation, and Support
- `helpdesk` and `hr-helpdesk` use `knowledge-base` assets and route through `workflow-engine`; escalations should respect `manager` delegation rules.
- `ai-automation` and `chatbot-builder` expose automations that span recruitment screening, performance analysis, attendance anomaly detection, and leave forecasting; they need access to the same datasets as their target modules.
- `integration-hub` provides inbound/outbound connectors (API marketplace, webhooks) for payroll providers, job boards, LMS/LRS, background check vendors, and identity providers.

## Engagement, Culture, and Experience
- `engagement`, `gamification`, `community`, and `my-services` consume profile data from `core-hr` and achievements from `learning`/`performance`; rewards should tie into `compensation` and `benefits`.
- `manager` and `mss/ess` experiences overlay approvals for attendance, leave, performance, travel, and expenses.
- `dei` and `esg` metrics pull from `core-hr`, `recruitment`, `performance`, and `analytics` for reporting and compliance.
- `wellness` and `health-safety` integrate with `attendance` (fitness/health flags), `payroll` (benefit deductions), and `analytics` (risk signals).

## Vertical/Industry Modules
- Industry modules (manufacturing, healthcare, retail, education, government, logistics, aviation, maritime, hospitality, agriculture, mining, nonprofit, financial-services, media, construction, energy) extend the core data model with sector-specific compliance, rostering, and safety features.
- Each vertical reuses `core-hr`, `attendance`, `leave`, `payroll`, and `compliance` while adding domain-specific workflows (e.g., nurse rostering -> payroll differentials, fleet safety -> compliance reporting).

## Analytics & Reporting
- `analytics` consumes events and records from every module; dashboards should be driven by governed metrics fed through the integration layer, not mock data.
- `security/audit` records from `security` and `audit` features must be available to `analytics` for compliance dashboards and anomaly detection.

## Mobile & Admin Footprints
- `mobile-app` surfaces ESS/MSS slices from attendance, leave, payslips, helpdesk, and approvals; it depends on the same APIs and RBAC as web.
- `apps/admin` is intended for tenant, integration, and localization governance; it should front the configuration used by all other modules.
