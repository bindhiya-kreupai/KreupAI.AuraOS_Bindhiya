# SHIFT MANAGEMENT -- EDGE CASE, NEGATIVE, AND REGRESSION DATASETS

================================================================================
PART A: EDGE-CASE DATASET (Boundary values, unusual but valid inputs)
================================================================================

## A1. Time Edge Cases

| Edge Case            | Start Time | End Time | Work Hours | Expected |
| -------------------- | ---------- | -------- | ---------- | -------- |
| Earliest possible    | 00:00      | 00:01    | 0.5        | Created  |
| Latest possible      | 23:58      | 23:59    | 0.5        | Created  |
| Midnight to morning  | 00:00      | 08:00    | 8          | Created  |
| Evening to midnight  | 16:00      | 00:00    | 8          | Created  |
| Cross-midnight       | 22:00      | 06:00    | 8          | Created  |
| 23-hour span         | 01:00      | 00:00    | 23         | Created  |
| Half-hour boundaries | 08:30      | 17:30    | 8          | Created  |
| 15-min offsets       | 08:15      | 16:45    | 8          | Created  |
| Single-minute shift  | 12:00      | 12:01    | 0.5        | Created  |

## A2. Numeric Edge Cases

| Edge Case             | Field            | Value | Expected |
| --------------------- | ---------------- | ----- | -------- |
| Minimum work hours    | workHours        | 0.5   | Created  |
| Fractional work hours | workHours        | 7.5   | Created  |
| Large work hours      | workHours        | 24    | Created  |
| Zero grace            | graceInMinutes   | 0     | Created  |
| Max reasonable grace  | graceInMinutes   | 120   | Created  |
| Zero break            | breakDuration    | 0     | Created  |
| Large break           | breakDuration    | 480   | Created  |
| Zero OT max           | maxOvertimeHours | 0     | Created  |
| Large OT max          | maxOvertimeHours | 24    | Created  |

## A3. String Edge Cases

| Edge Case               | Field       | Value                                               | Expected                             |
| ----------------------- | ----------- | --------------------------------------------------- | ------------------------------------ |
| Single character code   | code        | A                                                   | Created                              |
| 50-char code            | code        | A12345678901234567890123456789012345678901234567890 | Created                              |
| Single char name        | name        | X                                                   | Created                              |
| 200-char name           | name        | AAAAAAAAAA... (200 chars)                           | Created if Prisma allows             |
| Mixed case code         | code        | MiXiNg-01                                           | Created                              |
| Numbers in name         | name        | Shift 12345                                         | Created                              |
| Dots in code            | code        | A.B.C                                               | Created                              |
| Underscores             | code        | SHIFT_01                                            | Created                              |
| Hyphens                 | code        | SHIFT-01                                            | Created                              |
| Parentheses             | name        | Evening (Premium)                                   | Created                              |
| Commas in description   | description | Used by HR, Finance, and IT                         | Created                              |
| Newlines in description | description | Line 1\nLine 2                                      | Created                              |
| Very long description   | description | 1000+ chars                                         | Created (Prisma String has no limit) |

## A4. Date Edge Cases (Roster/Assignment)

| Edge Case                | Date         | Expected                      |
| ------------------------ | ------------ | ----------------------------- |
| Today                    | current date | Created                       |
| Tomorrow                 | today + 1    | Created                       |
| Yesterday                | today - 1    | Created                       |
| Far past                 | 2020-01-01   | Created (historical)          |
| Far future               | 2030-12-31   | Created                       |
| Leap year                | 2028-02-29   | Created                       |
| Year boundary            | 2026-12-31   | Created                       |
| New year                 | 2027-01-01   | Created                       |
| Friday (weekend for GCC) | 2026-07-17   | Created; verify weekend logic |
| Saturday                 | 2026-07-18   | Created                       |
| Sunday                   | 2026-07-19   | Created                       |

## A5. Swap Request Edge Cases

| Edge Case                       | Setup                                 | Expected                                       |
| ------------------------------- | ------------------------------------- | ---------------------------------------------- |
| Self-swap attempt               | requestorId == swapWithId             | Verify behavior (may be accepted at API level) |
| Same shift for both             | Both use shift-1                      | Created (swap same shift type)                 |
| Same date for both              | Both dates = 2026-07-20               | Created                                        |
| Past dates                      | Both dates in past                    | Created (if not validated)                     |
| Very long reason                | 500-char reason string                | Created (no min/max on reason)                 |
| Single char reason              | "x"                                   | Created                                        |
| Peer approve by wrong user      | Different employee calls peer-approve | Service error: Unauthorized                    |
| Double peer approve             | Approve already peer-approved swap    | Verify idempotency or error                    |
| Manager approve after rejection | Reject then try manager approve       | Should fail (already rejected)                 |
| Approve completed swap          | Try to approve COMPLETED swap         | Should fail (terminal state)                   |

## A6. Pagination Edge Cases

| Edge Case               | Setup              | Expected                                  |
| ----------------------- | ------------------ | ----------------------------------------- |
| Empty page              | 0 records          | No pagination; empty state                |
| Exactly 1 page          | 1-20 records       | No page navigation shown                  |
| Exactly 2 pages         | 21 records         | Page 1 shows 20; page 2 shows 1           |
| Many pages              | 100+ records       | Pagination controls work across all pages |
| Last page with 1 record | 21 records, page 2 | Shows 1 record on page 2                  |

## A7. Search Edge Cases

| Edge Case            | Input | Expected                      |
| -------------------- | ----- | ----------------------------- |
| All spaces           | " "   | Depends on trim logic         |
| Tab character        | "\t"  | No match (not in data)        |
| Null byte            | "\0"  | No match; no crash            |
| Regex metacharacters | ".\*" | No match (treated as literal) |
| Backslash            | "\\"  | No match; no escape issues    |
| Forward slash        | "/"   | No match if not in data       |
| Pipe                 | "\|"  | No match; no error            |
| Ampersand            | "&"   | No match; no error            |

---

================================================================================
PART B: NEGATIVE DATASET (Invalid inputs that must be rejected)
================================================================================

## B1. Shift Creation -- Must Fail

| Neg ID  | Field            | Invalid Value | Expected Error                            | Validation    |
| ------- | ---------------- | ------------- | ----------------------------------------- | ------------- |
| NEG-S01 | code             | ""            | Required                                  | Zod min(1)    |
| NEG-S02 | name             | ""            | Required                                  | Zod min(1)    |
| NEG-S03 | startTime        | "abc"         | HH:MM format error                        | Zod regex     |
| NEG-S04 | startTime        | "9:00"        | HH:MM format error (single digit)         | Zod regex     |
| NEG-S05 | startTime        | "25:00"       | HH:MM format error (out of range)         | Zod regex     |
| NEG-S06 | startTime        | "12:60"       | HH:MM format error (minutes >= 60)        | Zod regex     |
| NEG-S07 | startTime        | "12:00:00"    | HH:MM format error (has seconds)          | Zod regex     |
| NEG-S08 | startTime        | ""            | HH:MM format error (empty)                | Zod regex     |
| NEG-S09 | startTime        | "12"          | HH:MM format error (no colon)             | Zod regex     |
| NEG-S10 | endTime          | ""            | HH:MM format error                        | Zod regex     |
| NEG-S11 | endTime          | "abc"         | HH:MM format error                        | Zod regex     |
| NEG-S12 | start/end        | 09:00 / 09:00 | Start time and end time must be different | Zod refine    |
| NEG-S13 | workHours        | 0             | >= 0.5                                    | Zod min(0.5)  |
| NEG-S14 | workHours        | -1            | >= 0.5                                    | Zod min(0.5)  |
| NEG-S15 | workHours        | 0.49          | >= 0.5                                    | Zod min(0.5)  |
| NEG-S16 | graceInMinutes   | -1            | >= 0                                      | Zod min(0)    |
| NEG-S17 | graceOutMinutes  | -100          | >= 0                                      | Zod min(0)    |
| NEG-S18 | breakDuration    | -1            | >= 0                                      | Zod min(0)    |
| NEG-S19 | maxOvertimeHours | -5            | >= 0                                      | Zod min(0)    |
| NEG-S20 | code             | (duplicate)   | Code already exists                       | Service check |

## B2. Shift Creation -- Must Reject at API Level

| Neg ID    | Scenario                           | Expected                                   |
| --------- | ---------------------------------- | ------------------------------------------ |
| NEG-API01 | No auth header                     | 401 Unauthorized                           |
| NEG-API02 | Missing shifts:create permission   | 403 Forbidden (E4030)                      |
| NEG-API03 | Empty JSON body {}                 | Validation error (missing required fields) |
| NEG-API04 | Non-JSON body                      | Parse error                                |
| NEG-API05 | Invalid tenantId injection attempt | tenantId ignored (from session)            |

## B3. Roster -- Must Fail

| Neg ID  | Scenario                              | Expected Error                                        |
| ------- | ------------------------------------- | ----------------------------------------------------- |
| NEG-R01 | Duplicate employee+date               | "Employee {id} already has a roster entry for {date}" |
| NEG-R02 | Invalid shiftId (non-existent)        | Foreign key error or not found                        |
| NEG-R03 | Invalid employeeId                    | Foreign key error or not found                        |
| NEG-R04 | rosterDate is not a valid date string | Parse error                                           |
| NEG-R05 | Missing employeeId                    | Validation error                                      |
| NEG-R06 | Missing shiftId                       | Validation error                                      |
| NEG-R07 | Missing rosterDate                    | Validation error                                      |

## B4. Assignment -- Must Fail

| Neg ID  | Scenario                                            | Expected                                  |
| ------- | --------------------------------------------------- | ----------------------------------------- |
| NEG-A01 | Duplicate active assignment for same employee+shift | Verify behavior (may auto-deactivate old) |
| NEG-A02 | Missing employeeId                                  | Validation error                          |
| NEG-A03 | Missing shiftId                                     | Validation error                          |
| NEG-A04 | Missing effectiveFrom                               | Validation error                          |
| NEG-A05 | effectiveTo before effectiveFrom                    | Verify behavior (may be accepted)         |

## B5. Swap -- Must Fail

| Neg ID  | Scenario                      | Expected Error                         |
| ------- | ----------------------------- | -------------------------------------- |
| NEG-W01 | Edit existing swap            | "Swap requests cannot be edited" toast |
| NEG-W02 | Peer approve wrong user       | "Unauthorized"                         |
| NEG-W03 | Manager approve without peer  | "Peer approval required first"         |
| NEG-W04 | Reject with empty reason      | "Please provide a rejection reason"    |
| NEG-W05 | Reject with whitespace only   | "Please provide a rejection reason"    |
| NEG-W06 | Peer approve already rejected | Verify error                           |
| NEG-W07 | Missing requestorId           | Validation error                       |
| NEG-W08 | Missing reason                | Validation error                       |
| NEG-W09 | Missing swapWithId            | Validation error                       |

## B6. Delete -- Must Fail

| Neg ID  | Scenario                               | Expected Error                                    |
| ------- | -------------------------------------- | ------------------------------------------------- |
| NEG-D01 | Delete shift with active assignments   | "Cannot delete shift that has active assignments" |
| NEG-D02 | Delete non-existent shift (invalid ID) | 404: Shift not found                              |
| NEG-D03 | Delete non-existent assignment         | 404: Assignment not found                         |
| NEG-D04 | Delete non-existent roster             | 404: Roster not found                             |
| NEG-D05 | Delete without permission              | 403: Forbidden                                    |

---

================================================================================
PART C: REGRESSION DATASET (Verify existing functionality not broken)
================================================================================

## C1. CRUD Lifecycle Regression

| Reg ID  | Scenario                 | Steps                                                                        | Expected                                     |
| ------- | ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------- |
| REG-C01 | Full shift lifecycle     | Create -> Edit -> Set Default -> Delete                                      | All operations succeed in sequence           |
| REG-C02 | Assignment lifecycle     | Create assignment -> Create another (auto-deactivate) -> Delete              | Previous auto-deactivated; delete succeeds   |
| REG-C03 | Roster lifecycle         | Create entry -> Edit (cell modal) -> Delete                                  | All operations succeed                       |
| REG-C04 | Swap full lifecycle      | Create -> Peer approve -> Manager approve                                    | Status reaches APPROVED_BY_MANAGER           |
| REG-C05 | Swap rejection lifecycle | Create -> Reject                                                             | Status reaches REJECTED with reason          |
| REG-C06 | Template to usage        | Apply template from Templates page -> Return to main -> Verify in Shifts tab | Shift created from template appears in table |

## C2. Cross-Tab Regression

| Reg ID  | Scenario                           | Steps                                                    | Expected                                             |
| ------- | ---------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| REG-T01 | Shift deletion affects assignments | Create shift -> Create assignment for it -> Delete shift | Shift deleted; assignment count may be affected      |
| REG-T02 | Assignment affects stats           | Create assignment -> Check stat card                     | Active assignments stat increments                   |
| REG-T03 | Swap affects stats                 | Create swap -> Check stat card                           | Pending swaps stat increments                        |
| REG-T04 | Tab switching preserves data       | Switch between Shifts/Assignments/Rosters/Swaps tabs     | Each tab loads its data; previous tab data preserved |
| REG-T05 | Lazy tab loading                   | First visit -> Click each tab                            | Data loads on first click only (lazy)                |

## C3. Search + Filter Regression

| Reg ID  | Scenario                       | Steps                                                        | Expected                                       |
| ------- | ------------------------------ | ------------------------------------------------------------ | ---------------------------------------------- |
| REG-S01 | Search after create            | Create shift with code "REGTEST" -> Search "REGTEST"         | Found immediately                              |
| REG-S02 | Search after delete            | Delete shift -> Search for its code                          | Not found                                      |
| REG-S03 | Search persistence across tabs | Search in Shifts tab -> Switch to Assignments -> Switch back | Shifts search is preserved or cleared (verify) |
| REG-S04 | Roster grid filter persistence | Apply filter -> Navigate week -> Navigate back               | Filter state preserved                         |

## C4. API + Error Handling Regression

| Reg ID  | Scenario                 | Steps                    | Expected                                                               |
| ------- | ------------------------ | ------------------------ | ---------------------------------------------------------------------- |
| REG-E01 | Bilingual error messages | Trigger 403 error        | Response includes both message and messageAr fields                    |
| REG-E02 | Server error handling    | Simulate network failure | Toast shows error; no crash                                            |
| REG-E03 | Response structure       | Any API call             | Response has { success: true/false, data/error }                       |
| REG-E04 | Stats endpoint           | GET /api/v1/shifts/stats | Returns { totalShifts, activeShifts, activeAssignments, pendingSwaps } |
| REG-E05 | Pagination response      | GET with page/limit      | Returns { data: [], pagination: { total, page, limit, totalPages } }   |

## C5. UI + Navigation Regression

| Reg ID  | Scenario                      | Steps                                   | Expected                         |
| ------- | ----------------------------- | --------------------------------------- | -------------------------------- |
| REG-U01 | Template page back link       | Templates -> Click back                 | Returns to main shift management |
| REG-U02 | Ramadan page back link        | Ramadan -> Click back                   | Returns to main shift management |
| REG-U03 | Roster grid link from header  | Main page -> Click "Roster planner"     | Navigates to roster-assignment   |
| REG-U04 | Shift swapping page loads     | Navigate to shift-swapping              | Page loads without errors        |
| REG-U05 | Toast auto-dismiss            | Trigger any success toast               | Toast disappears after timeout   |
| REG-U06 | Confirm dialog Escape key     | Open delete confirm -> Press Escape     | Dialog closes; no action taken   |
| REG-U07 | Confirm dialog backdrop click | Open delete confirm -> Click outside    | Dialog closes; no action taken   |
| REG-U08 | Reject dialog Escape key      | Open reject swap dialog -> Press Escape | Dialog closes; swap unchanged    |
| REG-U09 | Reject dialog focus trap      | Open reject dialog -> Tab through       | Focus stays within dialog        |

## C6. Permission Regression

| Reg ID  | Scenario                        | Steps                              | Expected                               |
| ------- | ------------------------------- | ---------------------------------- | -------------------------------------- |
| REG-P01 | Full permission access          | Login as admin                     | All CRUD operations available          |
| REG-P02 | Read-only access                | Login with shifts:read only        | Can view but not create/edit/delete    |
| REG-P03 | Create only                     | Login with shifts:create only      | Can create but not view list? (Verify) |
| REG-P04 | Assignment permission isolation | Login without shift-assignments:\* | Assignment tab shows 403 errors        |

## C7. Data Integrity Regression

| Reg ID  | Scenario                   | Steps                                           | Expected                                           |
| ------- | -------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| REG-I01 | Tenant isolation           | Create shift in tenant A -> Query from tenant B | Shift not visible in tenant B                      |
| REG-I02 | Created/updated timestamps | Create shift -> Edit shift                      | createdAt unchanged; updatedAt updated             |
| REG-I03 | isDefault uniqueness       | Set default on 3 shifts sequentially            | Only the last one has isDefault=true               |
| REG-I04 | Auto-deactivate assignment | Create 2 assignments for same employee          | First has isActive=false; second has isActive=true |
| REG-I05 | Roster unique constraint   | Create 2 rosters for same employee+date         | Second fails with conflict error                   |
| REG-I06 | Soft delete fields         | Verify shift has deletedAt/isDeleted fields     | Fields exist in DB (not exposed in UI currently)   |

## C8. Ramadan-Specific Regression

| Reg ID  | Scenario                       | Steps                                        | Expected                                        |
| ------- | ------------------------------ | -------------------------------------------- | ----------------------------------------------- |
| REG-R01 | Country switch updates display | Change country dropdown                      | Status cards update with country-specific hours |
| REG-R02 | Mapping persistence            | Save mapping -> Reload page -> Check mapping | Mapping loaded from server                      |
| REG-R03 | Toggle persistence             | Toggle ON -> Reload -> Check                 | Toggle state preserved                          |
| REG-R04 | Working hours calculator       | Select AE -> Calculate daily hours           | Returns UAE-standard hours                      |
| REG-R05 | Overtime calculator math       | Actual=10, Shift=8, Rate=100                 | OT=2, pay=2*rate*multiplier                     |
| REG-R06 | Compliance check               | Hours=12, OT=4                               | Non-compliant with violations                   |

## C9. Roster Grid Regression

| Reg ID  | Scenario                   | Steps                                                     | Expected                                   |
| ------- | -------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| REG-G01 | Week navigation loads data | Click next/prev week                                      | New roster data loaded for displayed week  |
| REG-G02 | Today button resets        | Navigate away -> Click Today                              | Returns to current week                    |
| REG-G03 | Cell click opens modal     | Click any cell                                            | Modal opens with correct date and employee |
| REG-G04 | Modal mode switching       | Open modal -> Switch between Shift/Week Off/Holiday/Clear | Correct UI shown for each mode             |
| REG-G05 | Shift color coding         | Assign different shifts to cells                          | Each shift type has distinct color         |
| REG-G06 | Hours calculation          | Assign shifts across week                                 | Hours column shows correct total           |
| REG-G07 | Weekend highlighting       | View grid with Sat/Sun columns                            | Weekend columns highlighted in rose color  |
| REG-G08 | Employee search            | Type employee name                                        | Grid filters in real-time                  |

## C10. Shift Swapping ESS Regression

| Reg ID  | Scenario                     | Steps                            | Expected                                 |
| ------- | ---------------------------- | -------------------------------- | ---------------------------------------- |
| REG-E01 | My Shifts loads              | Navigate to page                 | Shift cards displayed with correct info  |
| REG-E02 | Request swap flow            | Click Request Swap -> Confirm    | Toast success; status badge changes      |
| REG-E03 | Pending state disable button | After requesting swap            | Button disabled; shows "Swap Pending"    |
| REG-E04 | Marketplace loads            | Click Marketplace tab            | Available swaps shown                    |
| REG-E05 | Accept swap flow             | Click Accept Swap                | Toast success; card removed              |
| REG-E06 | View Full Roster link        | Click link                       | Navigates to roster-assignment           |
| REG-E07 | Empty states                 | Employee with no shifts assigned | "No shifts assigned" shown               |
| REG-E08 | Empty marketplace            | No pending swaps                 | "No shifts available in the marketplace" |

================================================================================
DATASET SUMMARY
================================================================================

| Dataset                       | Record Count                                     | Purpose                           |
| ----------------------------- | ------------------------------------------------ | --------------------------------- |
| Edge Case (Part A)            | 60+ scenarios                                    | Boundary validation               |
| Negative (Part B)             | 40+ scenarios                                    | Error rejection verification      |
| Regression (Part C)           | 55+ scenarios                                    | Existing functionality protection |
| Bulk Data (from BULK-DATA.md) | 55 shifts + 5 assignments + 35 rosters + 5 swaps | Volume testing                    |

TOTAL: 160+ test scenarios across all datasets.
