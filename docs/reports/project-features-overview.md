# AURA Project Overview & Feature Map

> Reference: `docs/aura-master-instructions.md` and `packages/@aura/config/src/super-admin-menu.ts`

## Scope
This document summarizes what exists in the repository today: applications, shared packages, and the functional surface of the web experience (modules, routes, and sample feature screens). It is derived from the current file tree and menu configuration so it stays close to the implemented code.

## Repository Layout
- `apps/web`: Next.js app with marketing pages plus the full dashboard experience under `/dashboard/*`.
- `apps/admin`: Skeleton only (`.gitkeep` placeholders); no routes or UI yet.
- `apps/mobile`: React Native skeleton; screens folders exist but only contain `.gitkeep` placeholders.
- `packages/@aura`: Shared libraries including `config` (menu + constants), `ui` (shared components), `types`, `utils`, `i18n`, and `database`.
- `services` / `infrastructure`: Stubs for services and IaC; no surfaced code in this pass.

## Feature Map (web dashboard)
Derived from `apps/web/src/app/dashboard/*`. “Pages” counts include the landing page plus nested feature pages; “Sample feature pages” is the first few child routes in each module to illustrate coverage.

| Module | Route | Pages | Sample feature pages |
|---|---|---|---|
| Admin | /dashboard/admin | 55 | Assets; Documents; Integrations; Master Data |
| Agriculture | /dashboard/agriculture | 7 | Crop Cycles; Crops; Housing; Housing Management |
| Ai Automation | /dashboard/ai-automation | 16 | Ai Coaching Bot; Anomaly Detection; Attrition Prediction; Auto Accruals |
| Alumni Network | /dashboard/alumni-network | 4 | Alumni Directory; Alumni Jobs; Events Reunions |
| Analytics | /dashboard/analytics | 17 | Compliance Reports; Cross Module Reports; Custom Reports; Dashboard Builder |
| Attendance | /dashboard/attendance | 21 | Approval Workflow; Attendance Exceptions; Comp Off; Comp Off Management |
| Automotive | /dashboard/automotive | 7 | Parts; Parts Inventory; Sales; Sales Commissions |
| Aviation | /dashboard/aviation | 6 | Cabin Crew; Ground Operations; Ground Ops; Pilot Training |
| Benefits | /dashboard/benefits | 14 | Benefit Types; Claim Status; Claims; Dependent Management |
| Career | /dashboard/career | 5 | Aspirations; Career Goals; Career Ladders; Internal Mobility |
| Chatbot Builder | /dashboard/chatbot-builder | 9 | Analytics Dashboard; Dialogue Designer; Entity Management; Handoff Rules |
| Collaboration | /dashboard/collaboration | 7 | Daily Standups; Digital Whiteboard; Kanban; Standups |
| Compensation | /dashboard/compensation | 12 | Arrears Processing; Bonus Management; Budget Simulation; Grade Bands |
| Compliance | /dashboard/compliance | 13 | Arbitration; Audits; Collective Bargaining; Communication Log |
| Core Hr | /dashboard/core-hr | 18 | Anniversary Alerts; Asset Management; Auto Numbering; Confirmation Letters |
| Dei | /dashboard/dei | 9 | Accessibility; Bias Training; Dei Goals; Diversity Metrics |
| Education | /dashboard/education | 7 | Adjunct Management; Adjuncts; Faculty Tenure; Grants |
| Engagement | /dashboard/engagement | 18 | Birthday Anniversary; Classifieds; Csr Activities; Event Calendar |
| Finance | /dashboard/finance | 12 | Assets; Budget; Petty Cash; Vendors |
| Gamification | /dashboard/gamification | 9 | Achievement Wall; Badges; Challenges; Leaderboards |
| Government | /dashboard/government | 7 | Civil Service Grades; Clearance; Grades; Pension Scheme |
| Health Safety | /dashboard/health-safety | 8 | Covid Tracker; Emergency; Emergency Contacts; Health Checkups |
| Healthcare | /dashboard/healthcare | 6 | Credentialing; Locum; Locum Management; Nurse Rostering |
| Helpdesk | /dashboard/helpdesk | 11 | Agent Assignment; Agent Console; Analytics; Canned Responses |
| Hospitality | /dashboard/hospitality | 6 | Event Staffing; Events; Housekeeping; Tip Management |
| Hr Helpdesk | /dashboard/hr-helpdesk | 11 | Case Management; Chat Support; Continuous Improvement; Knowledge Base |
| Integration Hub | /dashboard/integration-hub | 4 | Api Marketplace; App Directory; Webhook Manager |
| Job Library | /dashboard/job-library | 6 | Job Catalog; Job Evaluation; Job Families; Job Posting Templates |
| Learning | /dashboard/learning | 23 | Assessment Engine; Assessments; Attendance Tracking; Calendar |
| Leave | /dashboard/leave | 12 | Carry Forward; Comp Off Tracking; Holiday Management; Leave Application |
| Logistics | /dashboard/logistics | 7 | Driver Management; Drivers; Fleet Safety; Safety |
| Manager | /dashboard/manager | 5 | Approval Center; Delegation; Team Dashboard; Team Reports |
| Manufacturing | /dashboard/manufacturing | 7 | Maintenance; Plant Maintenance; Production; Production Efficiency |
| Maritime | /dashboard/maritime | 7 | Compliance; Crew; Offshore Compliance; Port Operations |
| Mining | /dashboard/mining | 6 | Camp; Camp Management; Fifo Logistics; Hazard Pay |
| Mobile App | /dashboard/mobile-app | 16 | Biometric Login; Chat Messaging; Document Upload; Expense Claims |
| Mobility | /dashboard/mobility | 7 | Expat Tax Manager; Immigration; Relocation; Relocation Packages |
| My Services | /dashboard/my-services | 10 | Attendance View; Grievances; Leave Application; My Documents |
| Nonprofit | /dashboard/nonprofit | 7 | Deployment; Donor Relations; Donors; Field Deployment |
| Offboarding | /dashboard/offboarding | 5 | Clearance Checklist; Exit Interview; Exit Process; F F Settlement |
| Onboarding | /dashboard/onboarding | 6 | 30 60 90 Day Plan; Buddy Assignment; First Day Experience; Induction Program |
| Org Design | /dashboard/org-design | 9 | Change Management; Matrix Structure; Org Analytics; Org Chart Builder |
| Payroll | /dashboard/payroll | 18 | Additional Tasks Per Doc; Arrears Management; Bank File Generation; Bonus Processing |
| Performance | /dashboard/performance | 27 | 1 On 1 Meetings; 360 Feedback; Bell Curve; Calibration |
| Policy Mgmt | /dashboard/policy-mgmt | 9 | Acknowledgement; Approval Workflow; Compliance Tracking; Policy Creation |
| Position Budgeting | /dashboard/position-budgeting | 9 | Budget Allocation; Budget Vs Actual; Position Analytics; Position Creation |
| Recruitment | /dashboard/recruitment | 31 | Agency Portal; Application Tracking; Assessment Tests; Background Verification |
| Remote Work | /dashboard/remote-work | 9 | Communication Tools; Equipment Tracking; Expense Management; Productivity Tracking |
| Retail | /dashboard/retail | 7 | Commission Incentives; Commissions; Hiring; Operations |
| Security | /dashboard/security | 13 | Alert Rules; Approval Logs; Audit Logs; Compliance Tracker |
| Succession Planning | /dashboard/succession-planning | 12 | Career Pathing; Critical Positions; Development Planning; Emergency Succession |
| Travel | /dashboard/travel | 17 | Advance Request; Booking Integration; Dashboard; Expense Claims |
| User Management | /dashboard/user-management | 13 | Access Control; Audit Trail; License Management; Multi Factor Auth |
| Wellness | /dashboard/wellness | 9 | Dashboard; Gym; Gym Membership; Health Programs |
| Workflow Engine | /dashboard/workflow-engine | 13 | Approval Chains; Audit Log; Conditional Logic; Designer |
| Workforce Planning | /dashboard/workforce-planning | 8 | Demand Forecasting; Gap Analysis; Scenario Modeling; Succession Readiness |

## Additional Modules Not Wired to Navigation
These exist in the codebase but are not exposed via the sidebar/top nav.

| Module | Route | Pages | Sample feature pages |
|---|---|---|---|
| [...slug] | /dashboard/[...slug] | 1 |  |
| Ai | /dashboard/ai | 1 | Assistant |
| Community | /dashboard/community | 3 | Alumni; Events; Jobs |
| Construction | /dashboard/construction | 8 | Equipment Leasing; Project Management; Safety; Site Safety |
| Energy | /dashboard/energy | 5 | Renewable Assets; Smart Grid; Utility Billing; Water Conservation |
| Esg | /dashboard/esg | 3 | Carbon; Csr; Governance |
| Facilities | /dashboard/facilities | 9 | Canteen; Lost Found; Maintenance; Meeting Rooms |
| Financial Services | /dashboard/financial-services | 5 | Banking Operations; Insurance Claims; Regulatory Compliance; Wealth Management |
| Legal | /dashboard/legal | 3 | Contracts; Ip; Litigation |
| Localization | /dashboard/localization | 5 | Address Formats; Calendar Types; Date Time Formats; Government Reports |
| Media | /dashboard/media | 8 | Audience Metrics; Bandwidth Analytics; Cast Crew; Content Rights |
| Overview | /dashboard/overview | 1 |  |
| Projects | /dashboard/projects | 1 | Resource Booking |

## Notes
- Sidebar navigation is driven by `packages/@aura/config/src/super-admin-menu.ts`; some entries in that config point to routes without a landing page (see navigation audit).
- All module screens are static/mock today. They need configuration-driven data, RBAC, i18n, error/loading states, telemetry, and tests before production readiness.
- Industry-specific modules (e.g., manufacturing, healthcare, retail) are implemented as standalone routes rather than under `/dashboard/industry/*` even though the menu has nested industry paths.
