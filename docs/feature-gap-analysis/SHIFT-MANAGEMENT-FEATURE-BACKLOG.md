# SHIFT MANAGEMENT — FEATURE BACKLOG

**Generated:** 2026-07-19
**Last Updated:** 2026-07-20 (Sprint 1 completion)
**Module:** Attendance → Shift Management
**Total Features:** 45 (23 implemented, 7 missing, 10 partially implemented, 5 out of scope)

---

## CRITICAL (Must Have for Enterprise Adoption)

| ID   | Title                                | Category    | Sprint   | Est. Complexity | Dependencies                                   | Status          |
| ---- | ------------------------------------ | ----------- | -------- | --------------- | ---------------------------------------------- | --------------- |
| F-01 | Notification Triggers                | A — Missing | Sprint 1 | Medium          | Notification module (exists in codebase)       | ✅ **COMPLETE** |
| F-02 | Roster Publishing Workflow           | A — Missing | Sprint 1 | High            | Roster model extension, frontend state UI      | ✅ **COMPLETE** |
| F-03 | Bulk Roster Operations               | A — Missing | Sprint 1 | High            | RosterManagementService, shift patterns        | ✅ **COMPLETE** |
| F-07 | Shift Pattern Engine (DB-backed)     | A — Missing | Sprint 1 | High            | ShiftPattern model, API endpoints              | ✅ **COMPLETE** |
| F-08 | Shift Differential Pay Engine        | A — Missing | Sprint 1 | High            | Payroll module, DifferentialRate model         | ✅ **COMPLETE** |
| F-09 | Attendance Integration               | A — Missing | Sprint 1 | High            | AttendanceService integration with Shift model | ✅ **COMPLETE** |
| F-23 | Employee Name Resolution in Main Hub | B — Partial | Sprint 1 | Medium          | Include employee relation in queries           | ✅ **COMPLETE** |
| F-24 | Date Range Filtering                 | B — Partial | Sprint 1 | Low             | API query params, frontend filter UI           | ✅ **COMPLETE** |
| F-25 | Pagination UI                        | B — Partial | Sprint 1 | Low             | DataPage component enhancement                 | ✅ **COMPLETE** |

---

## HIGH (Should Have for Production Use)

| ID   | Title                            | Category    | Sprint   | Est. Complexity | Dependencies                        | Status          |
| ---- | -------------------------------- | ----------- | -------- | --------------- | ----------------------------------- | --------------- |
| F-04 | Export / Print                   | A — Missing | Sprint 1 | Medium          | Export service + API route + UI     | ✅ **COMPLETE** |
| F-05 | Calendar View                    | A — Missing | Sprint 2 | High            | `date-fns`, ShiftCalendar component | ✅ **COMPLETE** |
| F-06 | Employee Self-Service for Swaps  | A — Missing | Sprint 2 | Medium          | Notification module, frontend state | ✅ **COMPLETE** |
| F-10 | Payroll Integration              | A — Missing | Sprint 3 | High            | Payroll module                      | 🔜 Pending      |
| F-11 | Approval Hierarchy for Swaps     | A — Missing | Sprint 3 | Medium          | Org hierarchy model                 | 🔜 Pending      |
| F-12 | Employee Availability Check      | A — Missing | Sprint 2 | Medium          | Leave module, AttendanceRecord      | ✅ **COMPLETE** |
| F-16 | Shift Templates (DB-backed)      | B — Partial | Sprint 2 | Medium          | Template model, API endpoints       | ✅ **COMPLETE** |
| F-19 | Shift Definition Impact Analysis | B — Partial | Sprint 3 | Medium          | Notification module                 | 🔜 Pending      |
| F-27 | Bulk Assignment from UI          | B — Partial | Sprint 2 | Medium          | Frontend multi-select component     | ✅ **COMPLETE** |

---

## MEDIUM (Important for completeness)

| ID   | Title                             | Category        | Sprint   | Est. Complexity | Dependencies                        | Status          |
| ---- | --------------------------------- | --------------- | -------- | --------------- | ----------------------------------- | --------------- |
| F-15 | Multi-Week Roster View            | A — Missing     | Sprint 3 | Low             | Frontend enhancement                | 🔜 Pending      |
| F-17 | Shift Statistics (Enhanced)       | B — Partial     | Sprint 3 | Medium          | Enhanced aggregation queries        | 🔜 Pending      |
| F-18 | Open Shift Marketplace (Enhanced) | B — Partial     | Sprint 3 | Medium          | Notification module, skill model    | 🔜 Pending      |
| F-21 | Shift Swap Policy Enforcement     | B — Partial     | Sprint 3 | Medium          | Policy CRUD UI, service integration | 🔜 Pending      |
| F-26 | Search by Name/Code               | B — Partial     | Sprint 2 | Low             | Search infrastructure               | ✅ **COMPLETE** |
| F-27 | **Bulk Assignment from UI**       | B — Partial     | Sprint 2 | Medium          | Frontend multi-select component     | ✅ **COMPLETE** |
| F-28 | Drag-and-Drop Roster              | C — Enhancement | Sprint 4 | High            | Frontend DnD library                | 🔜 Pending      |
| F-29 | Capacity / Shortage Indicators    | C — Enhancement | Sprint 4 | Medium          | RosterConfig model                  | 🔜 Pending      |
| F-36 | Holiday-Aware Roster Generation   | C — Enhancement | Sprint 4 | Medium          | HolidayCalendar integration         | 🔜 Pending      |
| F-37 | Night Shift Compliance            | C — Enhancement | Sprint 4 | Medium          | LabourLawConfig integration         | 🔜 Pending      |
| F-39 | Recurring Shift Patterns          | C — Enhancement | Sprint 3 | High            | ShiftPattern model                  | 🔜 Pending      |
| F-40 | Shift Marketplace Notifications   | C — Enhancement | Sprint 4 | Medium          | Notification module                 | 🔜 Pending      |

---

## LOW (Nice to Have)

| ID   | Title                        | Category        | Sprint   | Est. Complexity | Dependencies                    | Status     |
| ---- | ---------------------------- | --------------- | -------- | --------------- | ------------------------------- | ---------- |
| F-20 | Soft Delete Consistency      | B — Partial     | Sprint 4 | Low             | Model convention decision       | 🔜 Pending |
| F-30 | Multi-Tenant Shift Templates | C — Enhancement | Sprint 4 | Medium          | Template model, tenant scoping  | 🔜 Pending |
| F-31 | Shift Swap History           | C — Enhancement | Sprint 3 | Low             | Frontend tab, API extension     | 🔜 Pending |
| F-32 | Keyboard Shortcuts           | C — Enhancement | Sprint 4 | Low             | Frontend keyboard handler       | 🔜 Pending |
| F-33 | Undo Operations              | C — Enhancement | Sprint 4 | Medium          | Frontend state, API soft-delete | 🔜 Pending |
| F-34 | Confirmation Dialogs         | C — Enhancement | Sprint 3 | Low             | Frontend component              | 🔜 Pending |
| F-35 | Loading States & Feedback    | C — Enhancement | Sprint 3 | Low             | Frontend audit                  | 🔜 Pending |
| F-38 | Split Shift Support          | C — Enhancement | Sprint 5 | High            | Shift model extension           | 🔜 Pending |

---

## OUT OF SCOPE

| ID   | Title                             | Rationale                                       |
| ---- | --------------------------------- | ----------------------------------------------- |
| F-41 | Geofence-based shift assignment   | Requires GPS infrastructure beyond module scope |
| F-42 | AI-powered optimal scheduling     | Requires ML infrastructure                      |
| F-43 | External calendar sync            | Integration concern, not core                   |
| F-44 | Mobile-native shift management    | Requires mobile app development                 |
| F-45 | Union/collective bargaining rules | Region-specific, not GCC scope                  |
