# SHIFT MANAGEMENT — FEATURE BACKLOG

**Generated:** 2026-07-19
**Module:** Attendance → Shift Management
**Total Features:** 45 (17 implemented, 12 missing, 11 partially implemented, 5 out of scope)

---

## CRITICAL (Must Have for Enterprise Adoption)

| ID   | Title                                | Category    | Sprint   | Est. Complexity | Dependencies                              |
| ---- | ------------------------------------ | ----------- | -------- | --------------- | ----------------------------------------- |
| F-01 | Notification Triggers                | A — Missing | Sprint 1 | Medium          | Notification module (exists in codebase)  |
| F-02 | Roster Publishing Workflow           | A — Missing | Sprint 1 | High            | Roster model extension, frontend state UI |
| F-03 | Bulk Roster Operations               | A — Missing | Sprint 1 | High            | RosterManagementService, shift patterns   |
| F-09 | Attendance Integration               | A — Missing | Sprint 1 | High            | AttendanceService, Shift model wiring     |
| F-23 | Employee Name Resolution in Main Hub | B — Partial | Sprint 1 | Medium          | Include employee relation in queries      |
| F-24 | Date Range Filtering                 | B — Partial | Sprint 1 | Low             | API query params, frontend filter UI      |
| F-25 | Pagination UI                        | B — Partial | Sprint 1 | Low             | DataPage component enhancement            |

---

## HIGH (Should Have for Production Use)

| ID   | Title                            | Category    | Sprint   | Est. Complexity | Dependencies                        |
| ---- | -------------------------------- | ----------- | -------- | --------------- | ----------------------------------- |
| F-04 | Export / Print                   | A — Missing | Sprint 2 | Medium          | Export module                       |
| F-05 | Calendar View                    | A — Missing | Sprint 2 | High            | Frontend calendar component         |
| F-06 | Employee Self-Service for Swaps  | A — Missing | Sprint 2 | Medium          | Notification module, frontend state |
| F-07 | Shift Pattern Engine (DB-backed) | A — Missing | Sprint 2 | High            | ShiftPattern model, API endpoints   |
| F-10 | Payroll Integration              | A — Missing | Sprint 3 | High            | Payroll module                      |
| F-11 | Approval Hierarchy for Swaps     | A — Missing | Sprint 3 | Medium          | Org hierarchy model                 |
| F-12 | Employee Availability Check      | A — Missing | Sprint 2 | Medium          | Leave module, AttendanceRecord      |
| F-16 | Shift Templates (DB-backed)      | B — Partial | Sprint 2 | Medium          | Template model, API endpoints       |
| F-19 | Shift Definition Impact Analysis | B — Partial | Sprint 3 | Medium          | Notification module                 |
| F-27 | Bulk Assignment from UI          | B — Partial | Sprint 2 | Medium          | Frontend multi-select component     |

---

## MEDIUM (Important for completeness)

| ID   | Title                             | Category        | Sprint   | Est. Complexity | Dependencies                           |
| ---- | --------------------------------- | --------------- | -------- | --------------- | -------------------------------------- |
| F-08 | Shift Differential Pay Engine     | A — Missing     | Sprint 3 | High            | Payroll module, DifferentialRate model |
| F-13 | Roster Status State Machine       | A — Missing     | Sprint 3 | Low             | Roster model extension                 |
| F-14 | Swap Status State Machine         | A — Missing     | Sprint 2 | Low             | Service layer validation               |
| F-15 | Multi-Week Roster View            | A — Missing     | Sprint 3 | Low             | Frontend enhancement                   |
| F-17 | Shift Statistics (Enhanced)       | B — Partial     | Sprint 3 | Medium          | Enhanced aggregation queries           |
| F-18 | Open Shift Marketplace (Enhanced) | B — Partial     | Sprint 3 | Medium          | Notification module, skill model       |
| F-21 | Shift Swap Policy Enforcement     | B — Partial     | Sprint 3 | Medium          | Policy CRUD UI, service integration    |
| F-26 | Search by Name/Code               | B — Partial     | Sprint 2 | Low             | Search infrastructure                  |
| F-28 | Drag-and-Drop Roster              | C — Enhancement | Sprint 4 | High            | Frontend DnD library                   |
| F-29 | Capacity / Shortage Indicators    | C — Enhancement | Sprint 4 | Medium          | RosterConfig model                     |
| F-36 | Holiday-Aware Roster Generation   | C — Enhancement | Sprint 4 | Medium          | HolidayCalendar integration            |
| F-37 | Night Shift Compliance            | C — Enhancement | Sprint 4 | Medium          | LabourLawConfig integration            |
| F-39 | Recurring Shift Patterns          | C — Enhancement | Sprint 3 | High            | ShiftPattern model                     |
| F-40 | Shift Marketplace Notifications   | C — Enhancement | Sprint 4 | Medium          | Notification module                    |

---

## LOW (Nice to Have)

| ID   | Title                        | Category        | Sprint   | Est. Complexity | Dependencies                    |
| ---- | ---------------------------- | --------------- | -------- | --------------- | ------------------------------- |
| F-20 | Soft Delete Consistency      | B — Partial     | Sprint 4 | Low             | Model convention decision       |
| F-22 | Created/UpdatedBy Tracking   | B — Partial     | Sprint 2 | Low             | Service layer update            |
| F-30 | Multi-Tenant Shift Templates | C — Enhancement | Sprint 4 | Medium          | Template model, tenant scoping  |
| F-31 | Shift Swap History           | C — Enhancement | Sprint 3 | Low             | Frontend tab, API extension     |
| F-32 | Keyboard Shortcuts           | C — Enhancement | Sprint 4 | Low             | Frontend keyboard handler       |
| F-33 | Undo Operations              | C — Enhancement | Sprint 4 | Medium          | Frontend state, API soft-delete |
| F-34 | Confirmation Dialogs         | C — Enhancement | Sprint 3 | Low             | Frontend component              |
| F-35 | Loading States & Feedback    | C — Enhancement | Sprint 3 | Low             | Frontend audit                  |
| F-38 | Split Shift Support          | C — Enhancement | Sprint 5 | High            | Shift model extension           |

---

## OUT OF SCOPE

| ID   | Title                             | Rationale                                       |
| ---- | --------------------------------- | ----------------------------------------------- |
| F-41 | Geofence-based shift assignment   | Requires GPS infrastructure beyond module scope |
| F-42 | AI-powered optimal scheduling     | Requires ML infrastructure                      |
| F-43 | External calendar sync            | Integration concern, not core                   |
| F-44 | Mobile-native shift management    | Requires mobile app development                 |
| F-45 | Union/collective bargaining rules | Region-specific, not GCC scope                  |
