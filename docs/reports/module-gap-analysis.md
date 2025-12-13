# Module Gap Analysis

> Reference: `docs/aura-master-instructions.md`  
> Sources: `apps/web/src/app/dashboard/*`, `packages/@aura/config/src/super-admin-menu.ts`

## Method
- Scanned every dashboard route (`page.tsx`) to see what screens exist.
- Cross-checked sidebar config (`super-admin-menu.ts`) to see what is linked vs. hidden.
- Marked whether a landing page exists for the module path, counted feature pages, and noted immediate gaps.

## Cross-Cutting Gaps
- All modules render static or mock data; none call backend services, configuration APIs, or persist changes.
- RBAC, audit, error/loading states, form validation, and i18n hooks are absent across modules.
- Navigation mismatches: several menu entries point to non-existent landings; several implemented modules are missing from the menu.
- Admin and mobile apps are skeletons with `.gitkeep` files only—no implemented screens.
- Tests (unit/E2E), analytics instrumentation, and CI checks per module are missing.

## Per-Module Findings

| Module | Route | Nav linked? | Landing page? | # Pages | Gap summary |
|---|---|---|---|---|---|
| [...slug] | /dashboard/[...slug] | No | Yes | 1 | Fallback catch-all route; ensure redirects are intentional or remove to avoid confusing UX. |
| Admin | /dashboard/admin | Yes | No | 55 | Nav points here but no landing page; add /page.tsx or adjust menu to point to existing subpage. |
| Agriculture | /dashboard/agriculture | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Ai | /dashboard/ai | No | No | 1 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Ai Automation | /dashboard/ai-automation | Yes | Yes | 16 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Alumni Network | /dashboard/alumni-network | Yes | Yes | 4 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Analytics | /dashboard/analytics | Yes | Yes | 17 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Attendance | /dashboard/attendance | Yes | Yes | 21 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Automotive | /dashboard/automotive | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Aviation | /dashboard/aviation | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Benefits | /dashboard/benefits | Yes | Yes | 14 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Career | /dashboard/career | Yes | Yes | 5 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Chatbot Builder | /dashboard/chatbot-builder | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Collaboration | /dashboard/collaboration | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Community | /dashboard/community | No | No | 3 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Compensation | /dashboard/compensation | Yes | Yes | 12 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Compliance | /dashboard/compliance | Yes | Yes | 13 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Construction | /dashboard/construction | No | Yes | 8 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Core Hr | /dashboard/core-hr | Yes | Yes | 18 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Dei | /dashboard/dei | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Education | /dashboard/education | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Energy | /dashboard/energy | No | Yes | 5 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Engagement | /dashboard/engagement | Yes | Yes | 18 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Esg | /dashboard/esg | No | No | 3 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Facilities | /dashboard/facilities | No | No | 9 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Finance | /dashboard/finance | Yes | No | 12 | Nav points here but no landing page; add /page.tsx or adjust menu to point to existing subpage. |
| Financial Services | /dashboard/financial-services | No | Yes | 5 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Gamification | /dashboard/gamification | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Government | /dashboard/government | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Health Safety | /dashboard/health-safety | Yes | Yes | 8 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Healthcare | /dashboard/healthcare | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Helpdesk | /dashboard/helpdesk | Yes | Yes | 11 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Hospitality | /dashboard/hospitality | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Hr Helpdesk | /dashboard/hr-helpdesk | Yes | Yes | 11 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Integration Hub | /dashboard/integration-hub | Yes | Yes | 4 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Job Library | /dashboard/job-library | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Learning | /dashboard/learning | Yes | Yes | 23 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Leave | /dashboard/leave | Yes | Yes | 12 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Legal | /dashboard/legal | No | No | 3 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Localization | /dashboard/localization | No | Yes | 5 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Logistics | /dashboard/logistics | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Manager | /dashboard/manager | Yes | Yes | 5 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Manufacturing | /dashboard/manufacturing | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Maritime | /dashboard/maritime | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Media | /dashboard/media | No | Yes | 8 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Mining | /dashboard/mining | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Mobile App | /dashboard/mobile-app | Yes | Yes | 16 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Mobility | /dashboard/mobility | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| My Services | /dashboard/my-services | Yes | Yes | 10 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Nonprofit | /dashboard/nonprofit | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Offboarding | /dashboard/offboarding | Yes | Yes | 5 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Onboarding | /dashboard/onboarding | Yes | Yes | 6 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Org Design | /dashboard/org-design | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Overview | /dashboard/overview | No | Yes | 1 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Payroll | /dashboard/payroll | Yes | Yes | 18 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Performance | /dashboard/performance | Yes | Yes | 27 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Policy Mgmt | /dashboard/policy-mgmt | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Position Budgeting | /dashboard/position-budgeting | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Projects | /dashboard/projects | No | No | 1 | Not exposed in sidebar; add menu entry or hide behind feature flag; same integration/QA gaps as others. |
| Recruitment | /dashboard/recruitment | Yes | Yes | 31 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Remote Work | /dashboard/remote-work | Yes | Yes | 9 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Retail | /dashboard/retail | Yes | Yes | 7 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Security | /dashboard/security | Yes | Yes | 13 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Succession Planning | /dashboard/succession-planning | Yes | Yes | 12 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Travel | /dashboard/travel | Yes | Yes | 17 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| User Management | /dashboard/user-management | Yes | Yes | 13 | Nav-linked UI with mock/static data; needs backend wiring, RBAC, validation, telemetry, and error states. |
| Wellness | /dashboard/wellness | Yes | No | 9 | Nav points here but no landing page; add /page.tsx or adjust menu to point to existing subpage. |
| Workflow Engine | /dashboard/workflow-engine | Yes | No | 13 | Nav points here but no landing page; add /page.tsx or adjust menu to point to existing subpage. |
| Workforce Planning | /dashboard/workforce-planning | Yes | No | 8 | Nav points here but no landing page; add /page.tsx or adjust menu to point to existing subpage. |

## Immediate Improvements to Close Gaps
1) Wire configuration/service layer into the UI (all modules) with error/loading/empty states and optimistic UX patterns.  
2) Fix navigation mismatches: add missing landings, correct industry paths, and surface hidden modules intentionally (menu or feature flags).  
3) Add RBAC, audit logging, and telemetry hooks per module.  
4) Implement form validation and persistence for creation/edit flows.  
5) Add automated coverage: unit tests for components, route guards, and smoke E2E per critical flow (login, nav, CRUD).  
6) Define API contracts for each module in `docs/api/` and align with services layer.  
7) Flesh out `apps/admin` and `apps/mobile` or explicitly defer with roadmaps so scope stays visible.
