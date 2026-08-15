# SHIFT MANAGEMENT — PRODUCT ROADMAP

**Generated:** 2026-07-19
**Last Updated:** 2026-07-20 (Sprint 2 complete)
**Module:** Attendance → Shift Management
**Current State:** ~84% feature-complete (Sprint 2 complete)

---

## ✅ COMPLETED — Sprint 1 (Foundation → Operational)

> All Sprint 1 Operational Readiness features are now complete.

| ID   | Feature                    | Sprint   | Status          | Notes                                                                                                   |
| ---- | -------------------------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| F-01 | Notification Triggers      | Sprint 1 | ✅ **COMPLETE** | 10 types wired across 9 service methods + 2 routes. In-app via WebSocket.                               |
| F-02 | Roster Publishing Workflow | Sprint 1 | ✅ **COMPLETE** | Draft→Published batch publish, `publishedAt`/`publishedBy`, `excludeDrafts` filter.                     |
| F-03 | Bulk Roster Operations     | Sprint 1 | ✅ **COMPLETE** | Copy-week, bulk-assign-by-day, CSV/Excel import.                                                        |
| F-07 | Shift Pattern Engine       | Sprint 1 | ✅ **COMPLETE** | DB-backed CRUD with soft delete (`aura_shift_pattern`).                                                 |
| F-08 | Shift Differential Pay     | Sprint 1 | ✅ **COMPLETE** | DB-backed CRUD with tenant scoping (`aura_shift_differential`).                                         |
| F-23 | Employee Name Resolution   | Sprint 1 | ✅ **COMPLETE** | Names displayed on all 4 tabs instead of UUIDs.                                                         |
| F-24 | Date Range Filtering       | Sprint 1 | ✅ **COMPLETE** | Date picker + Apply button on assignments, rosters, swaps.                                              |
| F-25 | Pagination UI              | Sprint 1 | ✅ **COMPLETE** | Prev/next/page controls in DataPage component.                                                          |
| F-04 | Export / Print             | Sprint 1 | ✅ **COMPLETE** | 4 entities (shifts, assignments, rosters, swap-requests) × 3 formats (csv, xlsx, pdf).                  |
| F-05 | Calendar View              | Sprint 1 | ✅ **COMPLETE** | Monthly calendar grid with color-coded shifts, today marker, week-off/holiday cells, cell-click modal.  |
| F-09 | Attendance Integration     | Sprint 1 | ✅ **COMPLETE** | Shift-aware clock/clock-out with breakDuration auto-deduction, maxOvertimeHours cap, absence detection. |

---

## ✅ COMPLETED — Sprint 2 (Usability & Completeness)

> All Sprint 2 Usability features are now complete.

| ID   | Feature                         | Sprint   | Status          | Notes                                                                                                          |
| ---- | ------------------------------- | -------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| F-06 | Employee Self-Service for Swaps | Sprint 2 | ✅ **COMPLETE** | Swap status visibility, cancel/withdraw, history view, Request Swap dialog with colleague picker.              |
| F-12 | Employee Availability Check     | Sprint 2 | ✅ **COMPLETE** | Conflict detection on roster/assignment create: double-booking, leave overlap, assignment consistency.         |
| F-16 | Shift Templates (DB-backed)     | Sprint 2 | ✅ **COMPLETE** | DB-backed CRUD at `/api/v1/shift-templates`, full UI at `shift-templates/page.tsx`, 7 defaults + user-defined. |
| F-22 | createdBy/updatedBy Tracking    | Sprint 2 | ✅ **COMPLETE** | All mutation routes pass `user.userId`; service writes to `createdBy`/`updatedBy` on all models.               |
| F-26 | Enhanced Search                 | Sprint 2 | ✅ **COMPLETE** | `RosterForm` + `SwapForm` with employee/shift dropdowns; employee name search across all 4 tabs.               |
| F-27 | Bulk Assignment from UI         | Sprint 2 | ✅ **COMPLETE** | `BulkAssignForm` multi-select employee picker wired to `/shifts/assign` bulk endpoint.                         |

---

## SHOULD HAVE (Phase 3 — Enterprise)

> These features are required for large-scale enterprise deployment.

| ID   | Feature                          | Sprint   | Business Justification                                                   |
| ---- | -------------------------------- | -------- | ------------------------------------------------------------------------ |
| F-10 | Payroll Integration              | Sprint 3 | Shift data must flow to overtime, break, and differential calculations.  |
| F-11 | Approval Hierarchy for Swaps     | Sprint 3 | Any-user-can-approve is a security and compliance gap.                   |
| F-15 | Multi-Week Roster View           | Sprint 3 | Planning ahead requires 2-4 week views.                                  |
| F-17 | Enhanced Statistics              | Sprint 3 | Basic counts are insufficient for management reporting.                  |
| F-18 | Enhanced Marketplace             | Sprint 3 | Open shift marketplace needs notifications, expiry, and skill matching.  |
| F-19 | Impact Analysis on Shift Changes | Sprint 3 | Changing shift times silently affects all assigned employees.            |
| F-21 | Swap Policy Enforcement          | Sprint 3 | Policy model exists but is never enforced. BUG-3 covers some validation. |
| F-31 | Shift Swap History               | Sprint 3 | Completed/rejected swaps disappear from view.                            |
| F-39 | Recurring Shift Patterns         | Sprint 3 | No ability to define repeating weekly patterns.                          |

---

## NICE TO HAVE (Phase 4 — Advanced & Polish)

> These features are valuable but require significant infrastructure or are long-term roadmap items.

| ID        | Feature                        | Sprint   | Business Justification                                       |
| --------- | ------------------------------ | -------- | ------------------------------------------------------------ |
| F-20      | Soft Delete Consistency        | Sprint 4 | All delete ops now use soft delete (resolved in BUG-8).      |
| F-28      | Drag-and-Drop Roster           | Sprint 4 | Power-user feature for large-team scheduling.                |
| F-29      | Capacity / Shortage Indicators | Sprint 4 | Visual staffing level indicators in roster grid.             |
| F-30      | Multi-Tenant Templates         | Sprint 4 | Tenant-specific template libraries.                          |
| F-32      | Keyboard Shortcuts             | Sprint 4 | Power-user efficiency.                                       |
| F-33      | Undo Operations                | Sprint 4 | Mistake recovery.                                            |
| F-34      | Confirmation Dialogs           | Sprint 4 | Destructive action protection.                               |
| F-35      | Loading States & Feedback      | Sprint 4 | UX consistency.                                              |
| F-36      | Holiday-Aware Roster           | Sprint 4 | Auto-detect holidays in roster generation.                   |
| F-37      | Night Shift Compliance         | Sprint 4 | GCC night shift regulation enforcement.                      |
| F-38      | Split Shift Support            | Sprint 5 | Two-period shifts for retail/hospitality.                    |
| F-40      | Marketplace Notifications      | Sprint 4 | Push notifications for open shifts.                          |
| F-41-F-45 | Out of Scope                   | TBD      | Geofence, AI scheduling, calendar sync, mobile, union rules. |

---

## Milestone Summary

| Milestone              | Target    | Features                                                                                                                                        | Completion  |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **v1.0 — Foundation**  | Done      | CRUD, basic roster, basic swap, Ramadan config, i18n, a11y                                                                                      | 42% ✅      |
| **v1.1 — Operational** | **DONE**  | ~~Notifications~~, ~~bulk roster~~, ~~export~~, ~~attendance integration~~, ~~names~~, ~~filters~~, ~~pagination~~, ~~calendar view~~, patterns | **76%** ✅  |
| **v2.0 — Usable**      | **DONE**  | ~~Employee self-service~~, ~~conflict detection~~, ~~templates~~, ~~enhanced search~~, ~~bulk assign UI~~, ~~createdBy tracking~~               | **~84%** ✅ |
| **v2.1 — Enterprise**  | Sprint 3  | Approval hierarchy, payroll integration, policy enforcement, enhanced stats, compliance                                                         | ~92% 🔜     |
| **v3.0 — Advanced**    | Sprint 4+ | Drag-and-drop, capacity indicators, undo, soft delete, holiday-aware, night shift compliance, split shifts                                      | ~97% 🔜     |
| **v3.1 — Full HCM**    | Future    | AI scheduling, mobile, external calendar sync, geofence                                                                                         | 100% 🔜     |
