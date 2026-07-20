# SHIFT MANAGEMENT — PRODUCT ROADMAP

**Generated:** 2026-07-19
**Module:** Attendance → Shift Management
**Current State:** 42% feature-complete (Foundation phase)

---

## MUST HAVE (Phase 1 — Foundation to Operational)

> These features are required before the module can be used by any real organization.

| ID   | Feature                    | Sprint   | Business Justification                                                                                                               |
| ---- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| F-01 | Notification Triggers      | Sprint 1 | Without notifications, the module is a database with a UI, not a workflow system. Employees and managers must be alerted to changes. |
| F-02 | Roster Publishing Workflow | Sprint 1 | Roster changes going live instantly is a compliance risk. Draft → Published workflow is standard in enterprise HR.                   |
| F-03 | Bulk Roster Operations     | Sprint 1 | Cell-by-cell editing is operationally unviable for teams >20. Copy-week and bulk-assign are essential.                               |
| F-09 | Attendance Integration     | Sprint 1 | Grace periods, overtime rules, and shift times must enforce actual attendance punch validation.                                      |
| F-23 | Employee Name Resolution   | Sprint 1 | Displaying UUIDs instead of names is a fundamental usability barrier.                                                                |
| F-24 | Date Range Filtering       | Sprint 1 | Cannot answer basic questions like "who worked what in March?" without date filtering.                                               |
| F-25 | Pagination UI              | Sprint 1 | API pagination exists but no UI controls; users see only the first page.                                                             |

---

## SHOULD HAVE (Phase 2 — Operational to Usable)

> These features are required for the module to be practical in daily operations.

| ID   | Feature                         | Sprint   | Business Justification                                                              |
| ---- | ------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| F-04 | Export / Print                  | Sprint 2 | Cannot share schedules, generate reports, or satisfy audit requests without export. |
| F-05 | Calendar View                   | Sprint 2 | Enterprise rostering tools always include a visual calendar perspective.            |
| F-06 | Employee Self-Service for Swaps | Sprint 2 | Employees need visibility into their swap request status and ability to cancel.     |
| F-07 | Shift Pattern Engine            | Sprint 2 | DB-backed shift patterns enable auto-roster generation and rotation scheduling.     |
| F-12 | Employee Availability Check     | Sprint 2 | No conflict detection means double-bookings and scheduling errors go undetected.    |
| F-14 | Swap Status State Machine       | Sprint 2 | Freeform status allows bypassing the approval workflow; must enforce transitions.   |
| F-16 | Shift Templates (DB-backed)     | Sprint 2 | Hardcoded templates cannot be customized per tenant or industry.                    |
| F-22 | Created/UpdatedBy Tracking      | Sprint 2 | Audit trail requires knowing who created/modified records.                          |
| F-26 | Enhanced Search                 | Sprint 2 | Basic text search is insufficient for large datasets.                               |
| F-27 | Bulk Assignment from UI         | Sprint 2 | API supports bulk but UI only creates one at a time.                                |

---

## NICE TO HAVE (Phase 3 — Enterprise)

> These features are required for large-scale enterprise deployment.

| ID   | Feature                          | Sprint   | Business Justification                                                  |
| ---- | -------------------------------- | -------- | ----------------------------------------------------------------------- |
| F-08 | Shift Differential Pay Engine    | Sprint 3 | Differential pay is a core GCC labor requirement; currently mocked.     |
| F-10 | Payroll Integration              | Sprint 3 | Shift data must flow to overtime, break, and differential calculations. |
| F-11 | Approval Hierarchy for Swaps     | Sprint 3 | Any-user-can-approve is a security and compliance gap.                  |
| F-13 | Roster Status State Machine      | Sprint 3 | Freeform status enables invalid transitions.                            |
| F-15 | Multi-Week Roster View           | Sprint 3 | Planning ahead requires 2-4 week views.                                 |
| F-17 | Enhanced Statistics              | Sprint 3 | Basic counts are insufficient for management reporting.                 |
| F-18 | Enhanced Marketplace             | Sprint 3 | Open shift marketplace needs notifications, expiry, and skill matching. |
| F-19 | Impact Analysis on Shift Changes | Sprint 3 | Changing shift times silently affects all assigned employees.           |
| F-21 | Swap Policy Enforcement          | Sprint 3 | Policy model exists but is never enforced.                              |
| F-31 | Shift Swap History               | Sprint 3 | Completed/rejected swaps disappear from view.                           |
| F-39 | Recurring Shift Patterns         | Sprint 3 | No ability to define repeating weekly patterns.                         |

---

## FUTURE (Phase 4 — Advanced)

> These features are valuable but require significant infrastructure or are long-term roadmap items.

| ID        | Feature                        | Sprint   | Business Justification                                       |
| --------- | ------------------------------ | -------- | ------------------------------------------------------------ |
| F-20      | Soft Delete Consistency        | Sprint 4 | Models have soft-delete fields but service uses hard delete. |
| F-28      | Drag-and-Drop Roster           | Sprint 4 | Power-user feature for large-team scheduling.                |
| F-29      | Capacity / Shortage Indicators | Sprint 4 | Visual staffing level indicators in roster grid.             |
| F-30      | Multi-Tenant Templates         | Sprint 4 | Tenant-specific template libraries.                          |
| F-32      | Keyboard Shortcuts             | Sprint 4 | Power-user efficiency.                                       |
| F-33      | Undo Operations                | Sprint 4 | Mistake recovery.                                            |
| F-34      | Confirmation Dialogs           | Sprint 3 | Destructive action protection.                               |
| F-35      | Loading States & Feedback      | Sprint 3 | UX consistency.                                              |
| F-36      | Holiday-Aware Roster           | Sprint 4 | Auto-detect holidays in roster generation.                   |
| F-37      | Night Shift Compliance         | Sprint 4 | GCC night shift regulation enforcement.                      |
| F-38      | Split Shift Support            | Sprint 5 | Two-period shifts for retail/hospitality.                    |
| F-40      | Marketplace Notifications      | Sprint 4 | Push notifications for open shifts.                          |
| F-41-F-45 | Out of Scope                   | TBD      | Geofence, AI scheduling, calendar sync, mobile, union rules. |

---

## Milestone Summary

| Milestone              | Target       | Features                                                                                                              | Completion |
| ---------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | ---------- |
| **v1.0 — Foundation**  | Current      | CRUD, basic roster, basic swap, Ramadan config, i18n, a11y                                                            | 42%        |
| **v1.1 — Operational** | Sprint 1 + 2 | Notifications, bulk roster, export, attendance integration, names, filters, pagination, calendar, patterns, templates | 70%        |
| **v2.0 — Enterprise**  | Sprint 3     | Approval hierarchy, differential pay, payroll integration, policy enforcement, statistics, compliance                 | 88%        |
| **v2.1 — Advanced**    | Sprint 4+    | Drag-and-drop, capacity indicators, undo, soft delete, holiday-aware, night shift compliance, split shifts            | 95%        |
| **v3.0 — Full HCM**    | Future       | AI scheduling, mobile, external calendar sync, geofence                                                               | 100%       |
