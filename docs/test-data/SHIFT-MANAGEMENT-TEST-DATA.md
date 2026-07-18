# Shift Management Module -- Manual Test Data

**Target URL:** `http://localhost:3006/dashboard/attendance/shift-management`
**Generated:** 2026-07-16

---

## Table of Contents

1. [Main Page -- Shifts Tab](#1-main-page--shifts-tab)
2. [Main Page -- Assignments Tab](#2-main-page--assignments-tab)
3. [Main Page -- Rosters Tab](#3-main-page--rosters-tab)
4. [Main Page -- Swap Requests Tab](#4-main-page--swap-requests-tab)
5. [Shift Templates Page](#5-shift-templates-page)
6. [Ramadan Auto-Switch Page](#6-ramadan-auto-switch-page)
7. [Roster Assignment (Weekly Grid) Page](#7-roster-assignment-weekly-grid-page)
8. [Shift Swapping (ESS) Page](#8-shift-swapping-ess-page)
9. [Cross-Cutting: Search](#9-cross-cutting-search)
10. [Cross-Cutting: Pagination](#10-cross-cutting-pagination)
11. [Cross-Cutting: Permissions](#11-cross-cutting-permissions)

---

## 1. Main Page -- Shifts Tab

### 1.1 Create Shift -- Valid Data

---

**TC-SHIFT-CREATE-001: Create a standard morning shift**

| Field                | Value                                     |
| -------------------- | ----------------------------------------- |
| Shift code           | `MORN-01`                                 |
| Name                 | `Morning Shift`                           |
| Description          | `Standard morning shift for office staff` |
| Start time (HH:MM)   | `06:00`                                   |
| End time (HH:MM)     | `14:00`                                   |
| Work hours           | `8`                                       |
| Grace in (min)       | `10`                                      |
| Grace out (min)      | `10`                                      |
| Break duration (min) | `60`                                      |
| Overtime allowed     | unchecked                                 |
| Max overtime hours   | `0`                                       |

**Expected Result:**

- Toast: `Shift created`
- Shift appears in table with code `MORN-01`, name `Morning Shift`, start `06:00`, end `14:00`, hours `8h`, grace `10 min`
- Status badge: green `Active`
- "Default" badge: not shown
- Total shifts stat card increments by 1
- Active shifts stat card increments by 1
- API returns `201`

---

**TC-SHIFT-CREATE-002: Create a night shift with overtime**

| Field                | Value                        |
| -------------------- | ---------------------------- |
| Shift code           | `NIGHT-01`                   |
| Name                 | `Night Shift`                |
| Description          | `Overnight operations shift` |
| Start time (HH:MM)   | `22:00`                      |
| End time (HH:MM)     | `06:00`                      |
| Work hours           | `8`                          |
| Grace in (min)       | `15`                         |
| Grace out (min)      | `15`                         |
| Break duration (min) | `45`                         |
| Overtime allowed     | checked                      |
| Max overtime hours   | `4`                          |

**Expected Result:**

- Toast: `Shift created`
- Shift appears in table: code `NIGHT-01`, start `22:00`, end `06:00`
- Cross-midnight shift accepted without error

---

**TC-SHIFT-CREATE-003: Create a short 4-hour shift**

| Field                | Value            |
| -------------------- | ---------------- |
| Shift code           | `SHORT-01`       |
| Name                 | `Half Day Shift` |
| Start time (HH:MM)   | `08:00`          |
| End time (HH:MM)     | `12:00`          |
| Work hours           | `4`              |
| Grace in (min)       | `0`              |
| Grace out (min)      | `0`              |
| Break duration (min) | `0`              |
| Overtime allowed     | unchecked        |
| Max overtime hours   | `0`              |

**Expected Result:**

- Toast: `Shift created`
- Table shows `4h` in hours column

---

**TC-SHIFT-CREATE-004: Create a shift with maximum values**

| Field                | Value                      |
| -------------------- | -------------------------- |
| Shift code           | `MAX-01`                   |
| Name                 | `Maximum Parameters Shift` |
| Description          | `Testing upper limits`     |
| Start time (HH:MM)   | `00:00`                    |
| End time (HH:MM)     | `23:59`                    |
| Work hours           | `24`                       |
| Grace in (min)       | `120`                      |
| Grace out (min)      | `120`                      |
| Break duration (min) | `480`                      |
| Overtime allowed     | checked                    |
| Max overtime hours   | `12`                       |

**Expected Result:**

- Toast: `Shift created`
- Start `00:00` and end `23:59` are accepted
- All max values stored correctly

---

**TC-SHIFT-CREATE-005: Create a shift with minimum valid values**

| Field                | Value           |
| -------------------- | --------------- |
| Shift code           | `MIN-01`        |
| Name                 | `Minimal Shift` |
| Start time (HH:MM)   | `01:00`         |
| End time (HH:MM)     | `01:30`         |
| Work hours           | `0.5`           |
| Grace in (min)       | `0`             |
| Grace out (min)      | `0`             |
| Break duration (min) | `0`             |
| Overtime allowed     | unchecked       |
| Max overtime hours   | `0`             |

**Expected Result:**

- Toast: `Shift created`
- Work hours `0.5` is the minimum valid value
- Table shows `0.5h`

---

**TC-SHIFT-CREATE-006: Create a flexible shift**

| Field                | Value                                     |
| -------------------- | ----------------------------------------- |
| Shift code           | `FLEX-01`                                 |
| Name                 | `Flexible Hours Shift`                    |
| Description          | `Core hours 11:00-15:00 with flex window` |
| Start time (HH:MM)   | `08:00`                                   |
| End time (HH:MM)     | `17:00`                                   |
| Work hours           | `8`                                       |
| Grace in (min)       | `120`                                     |
| Grace out (min)      | `120`                                     |
| Break duration (min) | `60`                                      |
| Overtime allowed     | checked                                   |
| Max overtime hours   | `2`                                       |

**Expected Result:**

- Toast: `Shift created`
- Large grace values accepted

---

### 1.2 Create Shift -- Boundary Data

---

**TC-SHIFT-BOUNDARY-001: Earliest valid time 00:00 to 00:01**

| Field                | Value             |
| -------------------- | ----------------- |
| Shift code           | `EARLY-01`        |
| Name                 | `Edge Time Shift` |
| Start time (HH:MM)   | `00:00`           |
| End time (HH:MM)     | `00:01`           |
| Work hours           | `0.5`             |
| Grace in (min)       | `0`               |
| Grace out (min)      | `0`               |
| Break duration (min) | `0`               |
| Overtime allowed     | unchecked         |
| Max overtime hours   | `0`               |

**Expected Result:**

- Toast: `Shift created`
- `00:00` is valid first time; `00:01` is different from start so refinement passes

---

**TC-SHIFT-BOUNDARY-002: Latest valid time 23:58 to 23:59**

| Field                | Value              |
| -------------------- | ------------------ |
| Shift code           | `LATE-01`          |
| Name                 | `End of Day Shift` |
| Start time (HH:MM)   | `23:58`            |
| End time (HH:MM)     | `23:59`            |
| Work hours           | `0.5`              |
| Grace in (min)       | `0`                |
| Grace out (min)      | `0`                |
| Break duration (min) | `0`                |
| Overtime allowed     | unchecked          |
| Max overtime hours   | `0`                |

**Expected Result:**

- Toast: `Shift created`
- Both times at edge of valid range accepted

---

**TC-SHIFT-BOUNDARY-003: Work hours exactly 0.5 (minimum)**

| Field              | Value                 |
| ------------------ | --------------------- |
| Shift code         | `MINHR-01`            |
| Name               | `Minimum Hours Shift` |
| Start time (HH:MM) | `09:00`               |
| End time (HH:MM)   | `09:30`               |
| Work hours         | `0.5`                 |

**Expected Result:**

- Toast: `Shift created`

---

**TC-SHIFT-BOUNDARY-004: Grace in and out at 0 (minimum)**

| Field              | Value            |
| ------------------ | ---------------- |
| Shift code         | `NOGRACE-01`     |
| Name               | `No Grace Shift` |
| Start time (HH:MM) | `09:00`          |
| End time (HH:MM)   | `17:00`          |
| Work hours         | `8`              |
| Grace in (min)     | `0`              |
| Grace out (min)    | `0`              |

**Expected Result:**

- Toast: `Shift created`
- Table shows `0 min` in grace column

---

### 1.3 Create Shift -- Invalid Data

---

**TC-SHIFT-INVALID-001: Missing shift code**

| Field              | Value        |
| ------------------ | ------------ |
| Shift code         | _(empty)_    |
| Name               | `Test Shift` |
| Start time (HH:MM) | `09:00`      |
| End time (HH:MM)   | `17:00`      |
| Work hours         | `8`          |

**Expected Result:**

- Form validation error: code field is required (`min(1)`)
- Shift is NOT created

---

**TC-SHIFT-INVALID-002: Missing shift name**

| Field              | Value       |
| ------------------ | ----------- |
| Shift code         | `NONAME-01` |
| Name               | _(empty)_   |
| Start time (HH:MM) | `09:00`     |
| End time (HH:MM)   | `17:00`     |
| Work hours         | `8`         |

**Expected Result:**

- Form validation error: name field is required (`min(1)`)
- Shift is NOT created

---

**TC-SHIFT-INVALID-003: Invalid start time format -- not HH:MM**

| Field              | Value            |
| ------------------ | ---------------- |
| Shift code         | `BADT-01`        |
| Name               | `Bad Time Shift` |
| Start time (HH:MM) | `9am`            |
| End time (HH:MM)   | `17:00`          |
| Work hours         | `8`              |

**Expected Result:**

- Zod validation error: `Start time must be in HH:MM format (00:00-23:59)`
- Shift is NOT created

---

**TC-SHIFT-INVALID-004: Invalid end time format -- out of range**

| Field              | Value                |
| ------------------ | -------------------- |
| Shift code         | `BADT-02`            |
| Name               | `Bad End Time Shift` |
| Start time (HH:MM) | `09:00`              |
| End time (HH:MM)   | `25:00`              |
| Work hours         | `8`                  |

**Expected Result:**

- Zod validation error: `End time must be in HH:MM format (00:00-23:59)`
- `25:00` fails regex `^([01]\d|2[0-3]):[0-5]\d$`

---

**TC-SHIFT-INVALID-005: Invalid end time -- minutes >= 60**

| Field              | Value               |
| ------------------ | ------------------- |
| Shift code         | `BADT-03`           |
| Name               | `Bad Minutes Shift` |
| Start time (HH:MM) | `09:00`             |
| End time (HH:MM)   | `17:65`             |
| Work hours         | `8`                 |

**Expected Result:**

- Zod validation error: `End time must be in HH:MM format (00:00-23:59)`
- `65` minutes fails the `[0-5]\d` portion of the regex

---

**TC-SHIFT-INVALID-006: Start time equals end time**

| Field              | Value             |
| ------------------ | ----------------- |
| Shift code         | `SAME-01`         |
| Name               | `Same Time Shift` |
| Start time (HH:MM) | `09:00`           |
| End time (HH:MM)   | `09:00`           |
| Work hours         | `8`               |

**Expected Result:**

- Zod refine error on `endTime` path: `Start time and end time must be different`
- Shift is NOT created

---

**TC-SHIFT-INVALID-007: Work hours below minimum (0.4)**

| Field              | Value             |
| ------------------ | ----------------- |
| Shift code         | `LOWHR-01`        |
| Name               | `Low Hours Shift` |
| Start time (HH:MM) | `09:00`           |
| End time (HH:MM)   | `17:00`           |
| Work hours         | `0.4`             |

**Expected Result:**

- Zod validation error: `Number must be greater than or equal to 0.5` (for `min(0.5)`)

---

**TC-SHIFT-INVALID-008: Work hours is 0**

| Field              | Value              |
| ------------------ | ------------------ |
| Shift code         | `ZEROHR-01`        |
| Name               | `Zero Hours Shift` |
| Start time (HH:MM) | `09:00`            |
| End time (HH:MM)   | `17:00`            |
| Work hours         | `0`                |

**Expected Result:**

- Zod validation error: `Number must be greater than or equal to 0.5`

---

**TC-SHIFT-INVALID-009: Duplicate shift code within tenant**

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Shift code         | `MORN-01` _(already exists from TC-SHIFT-CREATE-001)_ |
| Name               | `Duplicate Code Shift`                                |
| Start time (HH:MM) | `10:00`                                               |
| End time (HH:MM)   | `18:00`                                               |
| Work hours         | `8`                                                   |

**Expected Result:**

- Service error: `A shift with code "MORN-01" already exists.`
- Toast shows the error
- Shift is NOT created

---

**TC-SHIFT-INVALID-010: Whitespace-only code**

| Field              | Value              |
| ------------------ | ------------------ |
| Shift code         | `   ` _(3 spaces)_ |
| Name               | `Whitespace Code`  |
| Start time (HH:MM) | `09:00`            |
| End time (HH:MM)   | `17:00`            |
| Work hours         | `8`                |

**Expected Result:**

- Zod `min(1)` treats `"   "` as length 3, so it MAY pass schema validation
- If the service does not trim, the shift is created with whitespace code
- Verify if the UI trims or the API rejects it

---

**TC-SHIFT-INVALID-011: Whitespace-only name**

| Field              | Value              |
| ------------------ | ------------------ |
| Shift code         | `WS-NAME-01`       |
| Name               | `   ` _(3 spaces)_ |
| Start time (HH:MM) | `09:00`            |
| End time (HH:MM)   | `17:00`            |
| Work hours         | `8`                |

**Expected Result:**

- Same as above -- Zod `min(1)` counts length 3 as valid
- Verify if UI or API trims

---

**TC-SHIFT-INVALID-012: Special characters in name**

| Field              | Value                                 |
| ------------------ | ------------------------------------- |
| Shift code         | `SPEC-01`                             |
| Name               | `Shift <script>alert('xss')</script>` |
| Start time (HH:MM) | `09:00`                               |
| End time (HH:MM)   | `17:00`                               |
| Work hours         | `8`                                   |

**Expected Result:**

- If created, the `<script>` tag must be rendered as plain text in the table (not executed)
- Verify XSS protection in the rendering layer

---

**TC-SHIFT-INVALID-013: Emoji in name**

| Field              | Value            |
| ------------------ | ---------------- |
| Shift code         | `EMOJI-01`       |
| Name               | `Night 🌙 Shift` |
| Start time (HH:MM) | `22:00`          |
| End time (HH:MM)   | `06:00`          |
| Work hours         | `8`              |

**Expected Result:**

- Shift is created successfully (Prisma String field accepts Unicode)
- Table renders emoji correctly

---

**TC-SHIFT-INVALID-014: SQL injection in description**

| Field              | Value                          |
| ------------------ | ------------------------------ |
| Shift code         | `SQL-01`                       |
| Name               | `SQL Test`                     |
| Description        | `'; DROP TABLE aura_shift; --` |
| Start time (HH:MM) | `09:00`                        |
| End time (HH:MM)   | `17:00`                        |
| Work hours         | `8`                            |

**Expected Result:**

- Shift is created with the literal string stored (Prisma parameterized queries prevent injection)
- Table is NOT dropped
- Description field shows the literal string

---

**TC-SHIFT-INVALID-015: Negative work hours**

| Field              | Value            |
| ------------------ | ---------------- |
| Shift code         | `NEG-01`         |
| Name               | `Negative Hours` |
| Start time (HH:MM) | `09:00`          |
| End time (HH:MM)   | `17:00`          |
| Work hours         | `-5`             |

**Expected Result:**

- Zod validation error: `Number must be greater than or equal to 0.5`

---

**TC-SHIFT-INVALID-016: Negative grace minutes**

| Field              | Value            |
| ------------------ | ---------------- |
| Shift code         | `NEGGR-01`       |
| Name               | `Negative Grace` |
| Start time (HH:MM) | `09:00`          |
| End time (HH:MM)   | `17:00`          |
| Work hours         | `8`              |
| Grace in (min)     | `-5`             |

**Expected Result:**

- Zod validation error: `Number must be greater than or equal to 0`

---

**TC-SHIFT-INVALID-017: Start time with single digit hour**

| Field              | Value                        |
| ------------------ | ---------------------------- |
| Shift code         | `SINGLE-01`                  |
| Name               | `Single Digit`               |
| Start time (HH:MM) | `9:00` _(only 1 digit hour)_ |
| End time (HH:MM)   | `17:00`                      |
| Work hours         | `8`                          |

**Expected Result:**

- Zod regex fails: `9:00` does not match `^([01]\d|2[0-3]):[0-5]\d$`
- Error: `Start time must be in HH:MM format (00:00-23:59)`

---

**TC-SHIFT-INVALID-018: Time with seconds**

| Field              | Value           |
| ------------------ | --------------- |
| Shift code         | `SEC-01`        |
| Name               | `Seconds Shift` |
| Start time (HH:MM) | `09:00:00`      |
| End time (HH:MM)   | `17:00:00`      |
| Work hours         | `8`             |

**Expected Result:**

- Zod regex fails: `09:00:00` does not match the 5-character HH:MM pattern
- Error: `Start time must be in HH:MM format (00:00-23:59)`

---

**TC-SHIFT-INVALID-019: Empty start time**

| Field              | Value        |
| ------------------ | ------------ |
| Shift code         | `EMPTYT-01`  |
| Name               | `Empty Time` |
| Start time (HH:MM) | _(empty)_    |
| End time (HH:MM)   | `17:00`      |
| Work hours         | `8`          |

**Expected Result:**

- Zod regex fails on empty string
- Error: `Start time must be in HH:MM format (00:00-23:59)`

---

**TC-SHIFT-INVALID-020: Unicode in shift code**

| Field              | Value          |
| ------------------ | -------------- |
| Shift code         | `ÜNÏCÖDE`      |
| Name               | `Unicode Code` |
| Start time (HH:MM) | `09:00`        |
| End time (HH:MM)   | `17:00`        |
| Work hours         | `8`            |

**Expected Result:**

- Zod `min(1)` passes (non-empty string)
- Prisma stores it; verify if the unique constraint treats it case-sensitively

---

### 1.4 Edit Shift

---

**TC-SHIFT-EDIT-001: Edit shift name**

Select an existing shift in the table, open edit form, change:

| Field | Original        | New Value               |
| ----- | --------------- | ----------------------- |
| Name  | `Morning Shift` | `Updated Morning Shift` |

**Expected Result:**

- Toast: `Shift updated`
- Table reflects new name
- Other fields remain unchanged

---

**TC-SHIFT-EDIT-002: Edit shift times**

| Field      | Original | New Value |
| ---------- | -------- | --------- |
| Start time | `06:00`  | `07:00`   |
| End time   | `14:00`  | `15:00`   |

**Expected Result:**

- Toast: `Shift updated`
- Table shows new times

---

**TC-SHIFT-EDIT-003: Edit to invalid time -- start = end**

| Field      | New Value |
| ---------- | --------- |
| Start time | `09:00`   |
| End time   | `09:00`   |

**Expected Result:**

- Zod refine error: `Start time and end time must be different`
- Shift NOT updated

---

**TC-SHIFT-EDIT-004: Edit to duplicate code**

| Field      | New Value                                   |
| ---------- | ------------------------------------------- |
| Shift code | `MORN-01` _(another existing shift's code)_ |

**Expected Result:**

- Service error: `A shift with code "MORN-01" already exists.`
- Shift NOT updated

---

**TC-SHIFT-EDIT-005: Edit only description (partial update)**

| Field       | New Value                  |
| ----------- | -------------------------- |
| Description | `Updated description text` |

**Expected Result:**

- Toast: `Shift updated`
- Only description changes; all other fields preserved

---

**TC-SHIFT-EDIT-006: Edit to clear description**

| Field       | New Value |
| ----------- | --------- |
| Description | _(empty)_ |

**Expected Result:**

- Toast: `Shift updated`
- Description field becomes null/empty in database

---

### 1.5 Delete Shift

---

**TC-SHIFT-DEL-001: Delete shift with no assignments**

Click Delete button on a shift that has NO active assignments.

**Expected Result:**

- Custom confirm dialog appears: title "Delete Shift", message `Are you sure you want to delete "<name>"? This action cannot be undone.`
- Press Cancel: dialog closes, shift NOT deleted
- Press Delete: dialog closes, toast: `Shift deleted`, shift removed from table
- Total shifts stat card decrements by 1

---

**TC-SHIFT-DEL-002: Delete shift with active assignments**

Create an assignment for a shift, then try to delete that shift.

**Expected Result:**

- Confirm dialog appears and user confirms
- Service error: `Cannot delete shift that has active assignments`
- Toast shows error
- Shift is NOT deleted

---

### 1.6 Set Default Shift

---

**TC-SHIFT-DEFAULT-001: Set a shift as default**

On a shift row where `isDefault` is `false`, click the star/defaults button.

**Expected Result:**

- Toast: `"<shift name>" set as default shift`
- "Default" badge appears on the row
- Previous default shift (if any) loses its "Default" badge (only one default per tenant)

---

**TC-SHIFT-DEFAULT-002: Verify only one default at a time**

Create 2+ shifts, set one as default, then set a different one as default.

**Expected Result:**

- Only the most recently set shift shows the "Default" badge
- The previous default's `isDefault` is now `false`

---

### 1.7 Shift Search

---

**TC-SHIFT-SEARCH-001: Search by exact code**

Type `MORN-01` in the search box.

**Expected Result:**

- Table filters to show only the shift with code `MORN-01`

---

**TC-SHIFT-SEARCH-002: Search by partial name**

Type `Night` in the search box.

**Expected Result:**

- Table shows all shifts whose name contains `Night` (case-insensitive)

---

**TC-SHIFT-SEARCH-003: Search by time**

Type `09:00` in the search box.

**Expected Result:**

- Table shows shifts where `startTime` or `endTime` matches `09:00`

---

**TC-SHIFT-SEARCH-004: Search by partial description**

Type `office` in the search box.

**Expected Result:**

- Table shows shifts where description contains `office`

---

**TC-SHIFT-SEARCH-005: Search with no results**

Type `NONEXISTENT-XYZ` in the search box.

**Expected Result:**

- Table shows empty state or "No results" message

---

**TC-SHIFT-SEARCH-006: Clear search**

Type something, then clear the search box.

**Expected Result:**

- Table returns to showing all shifts

---

**TC-SHIFT-SEARCH-007: Search with mixed case**

Type `morN` in the search box.

**Expected Result:**

- Case-insensitive match returns `MORN-01` / `Morning Shift`

---

**TC-SHIFT-SEARCH-008: Search with special characters**

Type `@#$` in the search box.

**Expected Result:**

- No results found; no error thrown

---

### 1.8 Stat Cards

---

**TC-SHIFT-STATS-001: Verify stat cards after CRUD operations**

1. Note initial stat values
2. Create a shift -> total shifts +1, active shifts +1
3. Delete a shift -> total shifts -1, active shifts -1

**Expected Result:**

- All 4 stat cards update in real-time after each operation
- Cards: Total shifts, Active shifts, Active assignments, Pending swaps

---

## 2. Main Page -- Assignments Tab

### 2.1 Create Assignment

---

**TC-ASSIGN-001: Assign shift to employee**

| Field          | Value                                 |
| -------------- | ------------------------------------- |
| Employee ID    | `emp-001`                             |
| Shift ID       | `shift-1` _(ID of an existing shift)_ |
| Effective from | `2026-07-16`                          |
| Effective to   | _(empty)_                             |
| Reason         | `New hire onboarding`                 |

**Expected Result:**

- Toast: `Assignment created`
- Assignment appears in table: employee `emp-001`, shift name displayed, from date shown, "To" shows gray `Current`, status `Active`
- Active assignments stat card increments by 1

---

**TC-ASSIGN-002: Assign shift with end date**

| Field          | Value                  |
| -------------- | ---------------------- |
| Employee ID    | `emp-002`              |
| Shift ID       | `shift-1`              |
| Effective from | `2026-08-01`           |
| Effective to   | `2026-12-31`           |
| Reason         | `Temporary assignment` |

**Expected Result:**

- Toast: `Assignment created`
- "To" column shows `12/31/2026` (not "Current")

---

**TC-ASSIGN-003: Assign shift with no reason**

| Field          | Value        |
| -------------- | ------------ |
| Employee ID    | `emp-003`    |
| Shift ID       | `shift-2`    |
| Effective from | `2026-07-16` |
| Effective to   | _(empty)_    |
| Reason         | _(empty)_    |

**Expected Result:**

- Toast: `Assignment created` (reason is optional)

---

**TC-ASSIGN-004: Auto-deactivate previous assignment**

Employee `emp-001` already has an active assignment from TC-ASSIGN-001. Create a new one.

| Field          | Value        |
| -------------- | ------------ |
| Employee ID    | `emp-001`    |
| Shift ID       | `shift-2`    |
| Effective from | `2026-07-17` |

**Expected Result:**

- Toast: `Assignment created`
- Previous assignment for `emp-001` is auto-deactivated (`isActive: false`, `effectiveTo` set to now)
- New assignment is active
- Table shows one active and one inactive for `emp-001`

---

### 2.2 Delete Assignment

---

**TC-ASSIGN-DEL-001: End an active assignment**

Click Delete on an active assignment row.

**Expected Result:**

- Custom confirm dialog: title "End Assignment", message `Are you sure you want to end this assignment?`
- Confirm -> toast: `Assignment ended`, assignment removed from table
- Active assignments stat card decrements

---

### 2.3 Assignment Search

---

**TC-ASSIGN-SEARCH-001: Search by employee ID**

Type `emp-001` in the search box.

**Expected Result:**

- Table shows only assignments for `emp-001`

---

**TC-ASSIGN-SEARCH-002: Search by shift name**

Type `Morning` in the search box.

**Expected Result:**

- Table shows assignments where the shift name contains `Morning`

---

## 3. Main Page -- Rosters Tab

### 3.1 Create Roster Entry

---

**TC-ROSTER-001: Create roster entry for employee**

| Field                | Value        |
| -------------------- | ------------ |
| Employee ID          | `emp-001`    |
| Shift ID             | `shift-1`    |
| Date                 | `2026-07-17` |
| Custom start (HH:MM) | _(empty)_    |
| Custom end (HH:MM)   | _(empty)_    |
| Week off             | unchecked    |
| Holiday              | unchecked    |

**Expected Result:**

- Toast: `Roster entry created`
- Entry appears in table: employee, date shown, shift name, status `SCHEDULED`

---

**TC-ROSTER-002: Create week-off roster entry**

| Field       | Value        |
| ----------- | ------------ |
| Employee ID | `emp-001`    |
| Shift ID    | `shift-1`    |
| Date        | `2026-07-19` |
| Week off    | checked      |
| Holiday     | unchecked    |

**Expected Result:**

- Toast: `Roster entry created`
- Table shows checkmark in "Week Off" column

---

**TC-ROSTER-003: Create holiday roster entry**

| Field       | Value        |
| ----------- | ------------ |
| Employee ID | `emp-001`    |
| Shift ID    | `shift-1`    |
| Date        | `2026-08-15` |
| Week off    | unchecked    |
| Holiday     | checked      |

**Expected Result:**

- Toast: `Roster entry created`
- Table shows checkmark in "Holiday" column

---

**TC-ROSTER-004: Create roster with custom times**

| Field                | Value        |
| -------------------- | ------------ |
| Employee ID          | `emp-002`    |
| Shift ID             | `shift-1`    |
| Date                 | `2026-07-18` |
| Custom start (HH:MM) | `07:30`      |
| Custom end (HH:MM)   | `16:30`      |

**Expected Result:**

- Toast: `Roster entry created`
- Custom times stored (even if not displayed in main table columns)

---

**TC-ROSTER-005: Duplicate roster entry (same employee + same date)**

Employee `emp-001` already has a roster for `2026-07-17` from TC-ROSTER-001. Try to create another.

| Field       | Value        |
| ----------- | ------------ |
| Employee ID | `emp-001`    |
| Shift ID    | `shift-2`    |
| Date        | `2026-07-17` |

**Expected Result:**

- Service error: `Employee emp-001 already has a roster entry for 2026-07-17. Update or delete the existing entry first.`
- Toast shows error
- Roster NOT created

---

### 3.2 Delete Roster Entry

---

**TC-ROSTER-DEL-001: Delete roster entry**

Click Delete on a roster row.

**Expected Result:**

- Custom confirm dialog: title "Delete Roster Entry", message `Are you sure you want to delete this roster entry?`
- Confirm -> toast: `Roster entry deleted`

---

### 3.3 Roster Search

---

**TC-ROSTER-SEARCH-001: Search by employee ID**

Type `emp-001` in search.

**Expected Result:**

- Table shows only rosters for `emp-001`

---

**TC-ROSTER-SEARCH-002: Search by status**

Type `SCHEDULED` in search.

**Expected Result:**

- Table shows only entries with status `SCHEDULED`

---

## 4. Main Page -- Swap Requests Tab

### 4.1 Create Swap Request

---

**TC-SWAP-001: Create swap request**

| Field                   | Value                |
| ----------------------- | -------------------- |
| Your employee ID        | `emp-001`            |
| Your shift ID           | `shift-1`            |
| Your shift date         | `2026-07-20`         |
| Swap with (employee ID) | `emp-002`            |
| Their shift ID          | `shift-2`            |
| Their shift date        | `2026-07-21`         |
| Reason                  | `Family appointment` |

**Expected Result:**

- Toast: `Swap request created`
- Table shows new row: requestor `emp-001`, swap with `emp-002`, dates shown, status yellow `PENDING`
- Pending swaps stat card increments

---

**TC-SWAP-002: Create swap with minimal reason**

| Field                   | Value        |
| ----------------------- | ------------ |
| Your employee ID        | `emp-003`    |
| Your shift ID           | `shift-1`    |
| Your shift date         | `2026-07-22` |
| Swap with (employee ID) | `emp-004`    |
| Their shift ID          | `shift-1`    |
| Their shift date        | `2026-07-23` |
| Reason                  | `Personal`   |

**Expected Result:**

- Toast: `Swap request created` (reason has no minimum length)

---

### 4.2 Edit Swap Request (Blocked)

---

**TC-SWAP-EDIT-001: Attempt to edit an existing swap**

Try to open the edit form for a swap that already has an `id`.

**Expected Result:**

- Toast error: `Swap requests cannot be edited -- use approve/reject.`
- Edit is blocked; no form opens

---

### 4.3 Peer Approve Swap

---

**TC-SWAP-PEER-001: Peer approve a pending swap**

On a PENDING swap, click "Peer approve".

**Expected Result:**

- Toast: `Peer approved`
- Status badge changes from yellow `PENDING` to blue `APPROVED_BY_PEER`

---

### 4.4 Manager Approve Swap

---

**TC-SWAP-MGR-001: Manager approve a peer-approved swap**

On an `APPROVED_BY_PEER` swap, click "Manager approve".

**Expected Result:**

- Toast: `Manager approved`
- Status badge changes to green `APPROVED_BY_MANAGER`

---

**TC-SWAP-MGR-002: Manager approve without peer approval**

On a `PENDING` swap (no peer approval yet), attempt manager approve.

**Expected Result:**

- Service error: `Peer approval required first`
- Toast shows error
- Status remains `PENDING`

---

### 4.5 Reject Swap

---

**TC-SWAP-REJECT-001: Reject with reason**

On a PENDING swap, click "Reject", enter reason, confirm.

| Field            | Value                                     |
| ---------------- | ----------------------------------------- |
| Rejection reason | `Schedule conflict with project deadline` |

**Expected Result:**

- Reject dialog opens with textarea
- Enter reason -> click Reject
- Toast: `Swap rejected`
- Status badge changes to red `REJECTED`

---

**TC-SWAP-REJECT-002: Reject without reason (empty)**

On a PENDING swap, click "Reject", leave reason empty, click Reject button.

**Expected Result:**

- Toast error: `Please provide a rejection reason`
- Dialog stays open
- Swap is NOT rejected

---

**TC-SWAP-REJECT-003: Reject with whitespace-only reason**

| Field            | Value              |
| ---------------- | ------------------ |
| Rejection reason | `   ` _(3 spaces)_ |

**Expected Result:**

- `rejectReason.trim()` is empty -> toast: `Please provide a rejection reason`
- Swap NOT rejected

---

**TC-SWAP-REJECT-004: Cancel reject dialog**

Open reject dialog, press Escape.

**Expected Result:**

- Dialog closes
- Swap remains unchanged

---

**TC-SWAP-REJECT-005: Reject with Unicode reason**

| Field            | Value                         |
| ---------------- | ----------------------------- |
| Rejection reason | `تم رفض الطلب - لا يوجد توفر` |

**Expected Result:**

- Toast: `Swap rejected`
- Reason stored with Arabic text

---

### 4.6 Swap Status Flow

---

**TC-SWAP-FLOW-001: Full approval flow**

1. Create swap (status: `PENDING`)
2. Peer approve (status: `APPROVED_BY_PEER`)
3. Manager approve (status: `APPROVED_BY_MANAGER`)

**Expected Result:**

- Each step transitions the status correctly
- Only appropriate buttons shown at each stage
- After `APPROVED_BY_MANAGER`: no more action buttons

---

**TC-SWAP-FLOW-002: Rejection from PENDING**

1. Create swap (status: `PENDING`)
2. Reject

**Expected Result:**

- Status changes to `REJECTED`
- No action buttons shown after rejection

---

**TC-SWAP-FLOW-003: Rejection from APPROVED_BY_PEER**

1. Create swap -> Peer approve -> Reject

**Expected Result:**

- Status changes from `APPROVED_BY_PEER` to `REJECTED`
- Reject button is available at `APPROVED_BY_PEER` stage

---

### 4.7 Swap Search

---

**TC-SWAP-SEARCH-001: Search by requestor ID**

Type `emp-001` in the search box.

**Expected Result:**

- Table shows swaps where `requestorId` contains `emp-001`

---

**TC-SWAP-SEARCH-002: Search by status**

Type `PENDING` in the search box.

**Expected Result:**

- Table shows only pending swaps

---

## 5. Shift Templates Page

**URL:** `/dashboard/attendance/shift-management/shift-templates`

### 5.1 Apply Template

---

**TC-TEMPLATE-001: Apply "General (9 to 6)" template**

Click the "Use" button on the General template card.

**Expected Result:**

- Button shows spinner during creation
- Badge changes to green "Created" on success
- Shift is created in the database with:
  - Code: `GEN-09-XXXX` (with 4-char timestamp suffix)
  - Name: `General (9 to 6)`
  - Times: 09:00-18:00, 8h, 60min break, 15/15 min grace, OT allowed 4h

---

**TC-TEMPLATE-002: Apply "Night (10 PM to 7 AM)" template**

Click "Use" on the Night template.

**Expected Result:**

- Cross-midnight shift created: 22:00-07:00
- Code: `NIGHT-22-XXXX`

---

**TC-TEMPLATE-003: Apply "Ramadan-reduced" template**

Click "Use" on the Ramadan template.

**Expected Result:**

- Shift created: 09:00-15:00, 6h, 30min break
- No overtime allowed

---

**TC-TEMPLATE-004: Apply "Split (retail)" template**

Click "Use" on the Split template.

**Expected Result:**

- Shift created: 09:00-20:00, 8h work, 180min break
- Overtime NOT allowed

---

**TC-TEMPLATE-005: Apply same template twice**

Click "Use" on a template, wait for "Created" badge, then try again.

**Expected Result:**

- Second creation succeeds with a different timestamp suffix (unique code)
- Two separate shifts created

---

**TC-TEMPLATE-006: Navigate back to main page**

Click "<-- Back to Shift Management" link.

**Expected Result:**

- Navigates to `/dashboard/attendance/shift-management`
- The newly created template shifts appear in the Shifts table

---

## 6. Ramadan Auto-Switch Page

**URL:** `/dashboard/attendance/shift-management/ramadan-auto-switch`

### 6.1 Country Selection

---

**TC-RAMADAN-001: Select each country**

Open the country dropdown and select each:

| Country Code | Expected Display       |
| ------------ | ---------------------- |
| AE           | `United Arab Emirates` |
| SA           | `Saudi Arabia`         |
| BH           | `Bahrain`              |
| QA           | `Qatar`                |
| OM           | `Oman`                 |
| KW           | `Kuwait`               |

**Expected Result:**

- Status cards update to show the selected country's working hours
- Standard hours and Ramadan hours reflect country-specific rules

---

### 6.2 Auto-Switch Toggle

---

**TC-RAMADAN-002: Toggle auto-switch on**

Click the toggle to enable.

**Expected Result:**

- Toggle switches to ON position
- Mappings can now be configured

---

**TC-RAMADAN-003: Toggle auto-switch off**

Click the toggle to disable.

**Expected Result:**

- Toggle switches to OFF position

---

### 6.3 Shift Mapping

---

**TC-RAMADAN-004: Map a regular shift to a Ramadan shift**

In the mapping table, select a Ramadan shift from the dropdown next to a regular shift.

**Expected Result:**

- Dropdown selection is visible
- Mapping is stored locally

---

**TC-RAMADAN-005: Save mapping**

After configuring mappings, click "Save Mapping".

**Expected Result:**

- Toast: `Ramadan mapping saved`
- "Saved" badge appears
- Mappings persist after page reload

---

**TC-RAMADAN-006: Save with no mappings**

Click "Save Mapping" without selecting any mappings.

**Expected Result:**

- Toast: `Ramadan mapping saved`
- Empty mapping object saved

---

### 6.4 Daily Hours Calculator

---

**TC-RAMADAN-CALC-001: Calculate daily hours**

| Field | Value        |
| ----- | ------------ |
| Date  | `2026-07-17` |

Click "Calculate".

**Expected Result:**

- Result shows working hours per day for the selected country
- If in Ramadan: reduced hours displayed

---

### 6.5 Overtime Calculator

---

**TC-RAMADAN-CALC-002: Calculate overtime**

| Field        | Value |
| ------------ | ----- |
| Actual hours | `10`  |
| Shift hours  | `8`   |
| Hourly rate  | `100` |

Click "Calculate".

**Expected Result:**

- OT hours: `2`
- Rate multiplier displayed (e.g., `1.25x`)
- OT pay: `2 * 100 * multiplier` displayed
- Engine amount shown

---

**TC-RAMADAN-CALC-003: Overtime with 0 actual hours**

| Field        | Value |
| ------------ | ----- |
| Actual hours | `0`   |
| Shift hours  | `8`   |
| Hourly rate  | `100` |

**Expected Result:**

- OT hours: `0`, OT pay: `0`

---

**TC-RAMADAN-CALC-004: Overtime where actual < shift**

| Field        | Value |
| ------------ | ----- |
| Actual hours | `6`   |
| Shift hours  | `8`   |
| Hourly rate  | `100` |

**Expected Result:**

- OT hours: `0` (no overtime when under-shift)

---

### 6.6 Daily Compliance Validator

---

**TC-RAMADAN-CALC-005: Compliant day**

| Field          | Value |
| -------------- | ----- |
| Hours worked   | `8`   |
| Overtime hours | `0`   |

Click "Validate".

**Expected Result:**

- Green "Compliant" indicator
- Max allowed hours displayed
- No violations

---

**TC-RAMADAN-CALC-006: Non-compliant day**

| Field          | Value |
| -------------- | ----- |
| Hours worked   | `12`  |
| Overtime hours | `4`   |

**Expected Result:**

- Red "Non-compliant" indicator
- Violations list displayed

---

### 6.7 Friday Compensation Calculator

---

**TC-RAMADAN-CALC-007: Calculate Friday compensation**

| Field               | Value  |
| ------------------- | ------ |
| Hours worked        | `8`    |
| Monthly base salary | `5000` |

Click "Calculate".

**Expected Result:**

- Compensation amount displayed (calculated based on country rules)

---

**TC-RAMADAN-CALC-008: Friday compensation with 0 hours**

| Field               | Value  |
| ------------------- | ------ |
| Hours worked        | `0`    |
| Monthly base salary | `5000` |

**Expected Result:**

- Compensation amount is `0`

---

## 7. Roster Assignment (Weekly Grid) Page

**URL:** `/dashboard/attendance/roster-assignment`

### 7.1 Week Navigation

---

**TC-GRID-NAV-001: Navigate to previous week**

Click the left chevron (ChevronLeft).

**Expected Result:**

- Grid shifts to the previous Monday-Sunday range
- Week number decrements
- Rosters for the new week are loaded

---

**TC-GRID-NAV-002: Navigate to next week**

Click the right chevron (ChevronRight).

**Expected Result:**

- Grid shifts to the next Monday-Sunday range
- Week number increments

---

**TC-GRID-NAV-003: Navigate to today's week**

Click "Today" button.

**Expected Result:**

- Grid returns to the current week containing today's date

---

### 7.2 Search and Filter

---

**TC-GRID-SEARCH-001: Search by employee name**

Type a name in the search box.

**Expected Result:**

- Grid filters to show only matching employees

---

**TC-GRID-SEARCH-002: Search by role**

Type a role name.

**Expected Result:**

- Grid filters to matching roles

---

**TC-GRID-FILTER-001: Filter by role**

Open filter panel, select a role from dropdown.

**Expected Result:**

- Grid shows only employees with that role

---

**TC-GRID-FILTER-002: Filter by shift**

Select a shift from the shift dropdown.

**Expected Result:**

- Grid shows only employees with roster entries for that shift in the visible week

---

**TC-GRID-FILTER-003: Filter by coverage = "Assigned"**

Select "Assigned" from coverage dropdown.

**Expected Result:**

- Grid shows only employees who have at least one working day in the visible week

---

**TC-GRID-FILTER-004: Filter by coverage = "Unassigned"**

Select "Unassigned" from coverage dropdown.

**Expected Result:**

- Grid shows only employees with zero working days in the visible week

---

**TC-GRID-FILTER-005: Multiple filters combined**

Set role + shift + coverage filters simultaneously.

**Expected Result:**

- All three filters are applied with AND logic
- Only matching employees shown

---

**TC-GRID-FILTER-006: Clear all filters**

Click "Clear filters" button.

**Expected Result:**

- All filters reset to defaults
- Full employee list shown

---

### 7.3 Roster Cell Modal

---

**TC-GRID-CELL-001: Assign shift to employee-day**

Click on an empty cell (--) in the grid.

In the modal:

- Select mode: `Shift`
- Choose a shift from the dropdown

Click Save.

**Expected Result:**

- Modal closes
- Cell shows shift abbreviation (first 3 chars of name, uppercased)
- Cell is color-coded
- Toast: `Roster updated.`

---

**TC-GRID-CELL-002: Set week off**

Click on a cell, select mode: `Week off`.

**Expected Result:**

- Cell shows `WO` in slate color
- Toast: `Roster updated.`

---

**TC-GRID-CELL-003: Set holiday**

Click on a cell, select mode: `Holiday`.

**Expected Result:**

- Cell shows `H` in purple color
- Toast: `Roster updated.`

---

**TC-GRID-CELL-004: Clear cell**

Click on an occupied cell, select mode: `Clear`.

**Expected Result:**

- Existing roster entry is deleted
- Cell shows `--`
- Toast: `Roster updated.`

---

**TC-GRID-CELL-005: Change shift on existing entry**

Click on a cell that already has a shift, change to a different shift.

**Expected Result:**

- Previous entry is deleted
- New entry created with different shift
- Cell updates to new shift abbreviation and color

---

**TC-GRID-CELL-006: Close modal with Escape**

Open cell modal, press Escape.

**Expected Result:**

- Modal closes without changes

---

### 7.4 Weekly Hours Column

---

**TC-GRID-HOURS-001: Verify weekly hours calculation**

Assign shifts with known work hours across a week for one employee.

**Expected Result:**

- Hours column shows sum of work hours for assigned days
- Week-off and holiday days contribute 0 hours

---

## 8. Shift Swapping (ESS) Page

**URL:** `/dashboard/attendance/shift-swapping`

### 8.1 My Shifts Tab

---

**TC-ESS-001: View assigned shifts**

Navigate to the page, wait for data to load.

**Expected Result:**

- Tab "My Shifts" is active by default
- Shift cards displayed with: type (Morning/Evening/Night), date, time, location
- Each card has a "Request Swap" button (if status is Scheduled)

---

**TC-ESS-002: Request shift swap**

Click "Request Swap" on a shift card with status "Scheduled".

**Expected Result:**

- Loading state on button
- Toast: `Swap request submitted.`
- Card status badge changes to amber `Pending`

---

**TC-ESS-003: Swap pending -- button disabled**

After requesting a swap, the button should show "Swap Pending" and be disabled.

**Expected Result:**

- Button is visually disabled
- Clicking it does nothing

---

**TC-ESS-004: No shifts assigned state**

Log in as an employee with no shift assignments.

**Expected Result:**

- Empty state: `No shifts assigned`

---

### 8.2 Marketplace Tab

---

**TC-ESS-005: View marketplace**

Click "Marketplace" tab.

**Expected Result:**

- Cards showing available swap offers from other employees
- Each card shows: offered by (name, role, avatar), shift type, date, time, reason
- "Accept Swap" button on each card

---

**TC-ESS-006: Accept swap from marketplace**

Click "Accept Swap" on a marketplace card.

**Expected Result:**

- Loading state
- Toast: `Swap accepted.`
- Card removed from marketplace

---

**TC-ESS-007: Empty marketplace**

No pending swap offers available.

**Expected Result:**

- Empty state: `No shifts available in the marketplace`

---

### 8.3 View Full Roster Link

---

**TC-ESS-008: Navigate to roster planner**

Click "View Full Roster" card.

**Expected Result:**

- Navigates to `/dashboard/attendance/roster-assignment`

---

## 9. Cross-Cutting: Search

### 9.1 Search Test Values (Apply to All Tabs)

| Test             | Input                          | Expected                                           |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| Exact match      | `MORN-01`                      | Shows the record with that exact code              |
| Partial match    | `MORN`                         | Shows all records containing "MORN"                |
| Case insensitive | `morn`                         | Same result as `MORN`                              |
| Numbers only     | `09:00`                        | Shows records with `09:00` in time fields          |
| Special chars    | `@#$%`                         | No results, no error                               |
| Unicode          | `تم`                           | No results (unless Arabic text exists)             |
| Whitespace only  | `   `                          | No results or shows all (depends on trim behavior) |
| No results       | `ZZZZNOTEXIST`                 | Empty table / no results state                     |
| Very long input  | 200+ characters                | No results, no error, no crash                     |
| SQL injection    | `' OR 1=1 --`                  | No results (Prisma parameterized)                  |
| XSS attempt      | `<img src=x onerror=alert(1)>` | No results, no script execution                    |

---

## 10. Cross-Cutting: Pagination

---

**TC-PAGIN-001: First page**

With 20+ records, navigate to page 1.

**Expected Result:**

- Shows first 20 records (default limit)
- Page 1 is highlighted in pagination controls

---

**TC-PAGIN-002: Navigate to last page**

Click last page number.

**Expected Result:**

- Shows remaining records (may be fewer than 20)
- Last page is highlighted

---

**TC-PAGIN-003: Navigate to middle page**

Click a middle page number.

**Expected Result:**

- Shows the correct 20 records for that page

---

**TC-PAGIN-004: Empty page**

Delete all records, then view pagination.

**Expected Result:**

- Pagination shows 0 total, or no pagination controls
- Empty state message displayed

---

## 11. Cross-Cutting: Permissions

---

**TC-PERM-001: Missing shifts:read permission**

Access the page without `shifts:read` permission.

**Expected Result:**

- API returns 403 with `E4030` error code
- Toast: `Forbidden: missing shifts:read permission` / `ممنوع`
- Table shows error state or empty

---

**TC-PERM-002: Missing shifts:create permission**

Click "Add shift" without `shifts:create` permission.

**Expected Result:**

- Form may open but submission returns 403
- Toast: `Forbidden: missing shifts:create permission` / `ممنوع`

---

**TC-PERM-003: Missing shifts:delete permission**

Click Delete on a shift without `shifts:delete` permission.

**Expected Result:**

- Confirm dialog may appear but API returns 403
- Toast: `Forbidden: missing shifts:delete permission` / `ممنوع`

---

**TC-PERM-004: Missing shift-swaps:update permission**

Click Peer approve without `shift-swaps:update` permission.

**Expected Result:**

- API returns 403
- Toast: `Forbidden: missing shift-swaps:update permission` / `ممنوع`

---

## Appendix A: Pre-Test Setup Data

Before running the full test suite, create these prerequisite records:

### A.1 Shifts (Create via Templates or Manual)

| Code      | Name          | Start   | End     | Hours | OT          |
| --------- | ------------- | ------- | ------- | ----- | ----------- |
| `SHIFT-A` | Alpha Shift   | `06:00` | `14:00` | `8`   | No          |
| `SHIFT-B` | Beta Shift    | `14:00` | `22:00` | `8`   | Yes, 4h max |
| `SHIFT-C` | Charlie Night | `22:00` | `06:00` | `8`   | Yes, 4h max |
| `SHIFT-D` | Delta Short   | `08:00` | `12:00` | `4`   | No          |
| `SHIFT-E` | Ramadan Early | `09:00` | `15:00` | `6`   | No          |

### A.2 Employees (Assumed to exist in system)

| ID        | Name            |
| --------- | --------------- |
| `emp-001` | Ahmed Al-Rashid |
| `emp-002` | Fatima Hassan   |
| `emp-003` | Omar Khalil     |
| `emp-004` | Sara Martinez   |
| `emp-005` | Youssef Nasser  |

### A.3 Dates Reference (Week starting Monday)

| Day       | Date         |
| --------- | ------------ |
| Monday    | `2026-07-13` |
| Tuesday   | `2026-07-14` |
| Wednesday | `2026-07-15` |
| Thursday  | `2026-07-16` |
| Friday    | `2026-07-17` |
| Saturday  | `2026-07-18` |
| Sunday    | `2026-07-19` |

---

## Appendix B: Validation Rules Quick Reference

| Schema                        | Field              | Rule                                  | Error Message                                      |
| ----------------------------- | ------------------ | ------------------------------------- | -------------------------------------------------- |
| `createShiftSchema`           | `code`             | `string().min(1)`                     | Required                                           |
| `createShiftSchema`           | `name`             | `string().min(1)`                     | Required                                           |
| `createShiftSchema`           | `startTime`        | `regex(/^([01]\d\|2[0-3]):[0-5]\d$/)` | `Start time must be in HH:MM format (00:00-23:59)` |
| `createShiftSchema`           | `endTime`          | `regex(/^([01]\d\|2[0-3]):[0-5]\d$/)` | `End time must be in HH:MM format (00:00-23:59)`   |
| `createShiftSchema`           | `endTime`          | refine: `startTime !== endTime`       | `Start time and end time must be different`        |
| `createShiftSchema`           | `workHours`        | `number().min(0.5)`                   | `Number must be greater than or equal to 0.5`      |
| `createShiftSchema`           | `graceInMinutes`   | `number().min(0).default(0)`          | `Number must be greater than or equal to 0`        |
| `createShiftSchema`           | `graceOutMinutes`  | `number().min(0).default(0)`          | `Number must be greater than or equal to 0`        |
| `createShiftSchema`           | `breakDuration`    | `number().min(0).default(0)`          | `Number must be greater than or equal to 0`        |
| `createShiftSchema`           | `maxOvertimeHours` | `number().min(0).default(0)`          | `Number must be greater than or equal to 0`        |
| `createShiftSchema`           | `flexWindow`       | `number().min(0).default(0)`          | `Number must be greater than or equal to 0`        |
| `createShiftAssignmentSchema` | `employeeId`       | `string()`                            | Required                                           |
| `createShiftAssignmentSchema` | `shiftId`          | `string()`                            | Required                                           |
| `createShiftAssignmentSchema` | `effectiveFrom`    | `string().or(z.date())`               | Required                                           |
| `createShiftRosterSchema`     | `employeeId`       | `string()`                            | Required                                           |
| `createShiftRosterSchema`     | `shiftId`          | `string()`                            | Required                                           |
| `createShiftRosterSchema`     | `rosterDate`       | `string().or(z.date())`               | Required                                           |
| `createShiftSwapSchema`       | `requestorId`      | `string()`                            | Required                                           |
| `createShiftSwapSchema`       | `swapWithId`       | `string()`                            | Required                                           |
| `createShiftSwapSchema`       | `requestorShiftId` | `string()`                            | Required                                           |
| `createShiftSwapSchema`       | `swapWithShiftId`  | `string()`                            | Required                                           |
| `createShiftSwapSchema`       | `reason`           | `string()`                            | Required                                           |

---

## Appendix C: Business Rules Quick Reference

| Rule                            | Entity     | Detail                                                                    |
| ------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Code uniqueness                 | Shift      | Unique per tenant (DB constraint + service check)                         |
| Time difference                 | Shift      | startTime != endTime (Zod refine)                                         |
| Minimum work hours              | Shift      | workHours >= 0.5                                                          |
| One default per tenant          | Shift      | Setting default clears all others first                                   |
| No delete with assignments      | Shift      | Count of active ShiftAssignment records must be 0                         |
| Auto-deactivate previous        | Assignment | New assignment deactivates all prior active assignments for same employee |
| One roster per employee per day | Roster     | DB unique constraint: `[tenantId, employeeId, rosterDate]`                |
| No swap editing                 | Swap       | If record has id, edit is blocked                                         |
| Two-stage approval              | Swap       | PENDING -> APPROVED_BY_PEER -> APPROVED_BY_MANAGER                        |
| Peer authorization              | Swap       | Only `swapWithId` employee can peer-approve                               |
| Peer before manager             | Swap       | Manager cannot approve unless peer already approved                       |
| Reject requires reason          | Swap       | Frontend validates non-empty trimmed reason                               |
| Tenant scoping                  | All        | Every query scoped by server-injected tenantId                            |
