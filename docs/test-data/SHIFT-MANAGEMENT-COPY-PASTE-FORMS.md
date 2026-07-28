# SHIFT MANAGEMENT -- COPY-PASTE FORM VALUES

# One block per form. Copy each field value directly into the UI.

# Fields marked [SELECT] need to be chosen from a dropdown.

# Fields marked [CHECKBOX] need to be toggled.

================================================================================
FORM 1: CREATE SHIFT (Main Page -> Shifts Tab -> Add Shift)
================================================================================

--- 1A: Standard Morning Shift ---
Shift Code: MORN-01
Name: Morning Shift
Description: Standard morning shift for office operations
Start Time (HH:MM): 06:00
End Time (HH:MM): 14:00
Work Hours: 8
Grace In (min): 10
Grace Out (min): 10
Break Duration (min): 60
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

--- 1B: Night Shift with Overtime ---
Shift Code: NIGHT-01
Name: Night Operations Shift
Description: Overnight shift for facility security and maintenance
Start Time (HH:MM): 22:00
End Time (HH:MM): 06:00
Work Hours: 8
Grace In (min): 15
Grace Out (min): 15
Break Duration (min): 45
Overtime Allowed: [CHECKED]
Max Overtime Hours: 4

--- 1C: Half-Day Shift ---
Shift Code: HALF-01
Name: Half Day Shift
Description: Part-time half-day morning shift
Start Time (HH:MM): 08:00
End Time (HH:MM): 12:00
Work Hours: 4
Grace In (min): 10
Grace Out (min): 5
Break Duration (min): 0
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

--- 1D: Flexible Shift ---
Shift Code: FLEX-01
Name: Flexible Hours
Description: Flexible shift with large grace window
Start Time (HH:MM): 08:00
End Time (HH:MM): 17:00
Work Hours: 8
Grace In (min): 120
Grace Out (min): 120
Break Duration (min): 60
Overtime Allowed: [CHECKED]
Max Overtime Hours: 4

--- 1E: Compressed 10-Hour Day ---
Shift Code: COMP-01
Name: Compressed Work Week
Description: 4-day work week with 10-hour days
Start Time (HH:MM): 07:00
End Time (HH:MM): 17:30
Work Hours: 10
Grace In (min): 15
Grace Out (min): 15
Break Duration (min): 60
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

--- 1F: Edge -- Earliest Valid ---
Shift Code: EDGE-01
Name: Earliest Shift
Description: Testing earliest valid time boundary
Start Time (HH:MM): 00:00
End Time (HH:MM): 00:01
Work Hours: 0.5
Grace In (min): 0
Grace Out (min): 0
Break Duration (min): 0
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

--- 1G: Edge -- Latest Valid ---
Shift Code: EDGE-02
Name: Latest Shift
Description: Testing latest valid time boundary
Start Time (HH:MM): 23:58
End Time (HH:MM): 23:59
Work Hours: 0.5
Grace In (min): 0
Grace Out (min): 0
Break Duration (min): 0
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

--- 1H: Unicode Name ---
Shift Code: UNI-01
Name: 夜間シフト
Description: Japanese night shift for testing
Start Time (HH:MM): 21:00
End Time (HH:MM): 05:00
Work Hours: 8
Grace In (min): 10
Grace Out (min): 10
Break Duration (min): 30
Overtime Allowed: [CHECKED]
Max Overtime Hours: 3

--- 1I: XSS Test ---
Shift Code: XSS-01
Name: <img src=x onerror=alert(1)>
Description: '; DROP TABLE aura_shift; --
Start Time (HH:MM): 09:00
End Time (HH:MM): 17:00
Work Hours: 8
Grace In (min): 0
Grace Out (min): 0
Break Duration (min): 0
Overtime Allowed: [UNCHECKED]
Max Overtime Hours: 0

================================================================================
FORM 2: EDIT SHIFT (Click edit on any shift row)
================================================================================

--- 2A: Update Name Only ---
Name: Updated Morning Shift

--- 2B: Update Times ---
Start Time (HH:MM): 07:00
End Time (HH:MM): 15:00

--- 2C: Update Description to Empty ---
Description: (leave blank)

--- 2D: Toggle Overtime ---
Overtime Allowed: [CHECKED]
Max Overtime Hours: 6

================================================================================
FORM 3: CREATE ASSIGNMENT (Main Page -> Assignments Tab -> Assign Shift)
================================================================================

--- 3A: Standard Assignment ---
Employee ID: emp-001
Shift ID: (select from dropdown)
Effective From: 2026-07-16
Effective To: (leave empty)
Reason: New hire orientation

--- 3B: Temporary Assignment ---
Employee ID: emp-002
Shift ID: (select from dropdown)
Effective From: 2026-08-01
Effective To: 2026-12-31
Reason: Temporary project assignment

--- 3C: No Reason ---
Employee ID: emp-003
Shift ID: (select from dropdown)
Effective From: 2026-07-20
Effective To: (leave empty)
Reason: (leave blank)

================================================================================
FORM 4: CREATE ROSTER ENTRY (Main Page -> Rosters Tab -> Add Roster Entry)
================================================================================

--- 4A: Standard Roster ---
Employee ID: emp-001
Shift ID: (select from dropdown)
Date: 2026-07-17
Custom Start (HH:MM): (leave blank)
Custom End (HH:MM): (leave blank)
Week Off: [UNCHECKED]
Holiday: [UNCHECKED]

--- 4B: Week Off ---
Employee ID: emp-001
Shift ID: (select any shift)
Date: 2026-07-19
Custom Start (HH:MM): (leave blank)
Custom End (HH:MM): (leave blank)
Week Off: [CHECKED]
Holiday: [UNCHECKED]

--- 4C: Holiday ---
Employee ID: emp-002
Shift ID: (select any shift)
Date: 2026-08-15
Custom Start (HH:MM): (leave blank)
Custom End (HH:MM): (leave blank)
Week Off: [UNCHECKED]
Holiday: [CHECKED]

--- 4D: Custom Times ---
Employee ID: emp-003
Shift ID: (select from dropdown)
Date: 2026-07-18
Custom Start (HH:MM): 07:30
Custom End (HH:MM): 16:30
Week Off: [UNCHECKED]
Holiday: [UNCHECKED]

================================================================================
FORM 5: CREATE SWAP REQUEST (Main Page -> Swaps Tab -> Add Swap Request)
================================================================================

--- 5A: Standard Swap ---
Your Employee ID: emp-001
Your Shift ID: (select from dropdown)
Your Shift Date: 2026-07-20
Swap With (ID): emp-002
Their Shift ID: (select from dropdown)
Their Shift Date: 2026-07-21
Reason: Family appointment

--- 5B: Minimal Reason ---
Your Employee ID: emp-003
Your Shift ID: (select from dropdown)
Your Shift Date: 2026-07-22
Swap With (ID): emp-004
Their Shift ID: (select from dropdown)
Their Shift Date: 2026-07-23
Reason: Personal

--- 5C: Arabic Reason ---
Your Employee ID: emp-005
Your Shift ID: (select from dropdown)
Your Shift Date: 2026-07-24
Swap With (ID): emp-001
Their Shift ID: (select from dropdown)
Their Shift Date: 2026-07-25
Reason: موعد طبي - تم تغيير الموعد

================================================================================
FORM 6: REJECT SWAP (Click Reject on a pending swap row)
================================================================================

--- 6A: Valid Rejection ---
Rejection Reason: Schedule conflict with project deadline

--- 6B: Arabic Rejection ---
Rejection Reason: تم رفض الطلب - لا يوجد توفر في هذا التاريخ

--- 6C: Long Rejection ---
Rejection Reason: I regret that I cannot approve this swap request due to the overlapping project deadline that requires my presence on the requested date. Additionally, the replacement schedule has already been finalized and any changes would disrupt the team workflow significantly.

================================================================================
FORM 7: ROSTER GRID CELL MODAL (Click any cell in weekly grid)
================================================================================

--- 7A: Assign Shift ---
Mode: [SHIFT]
Shift: (select from dropdown)

--- 7B: Set Week Off ---
Mode: [WEEK OFF]
(no additional fields)

--- 7C: Set Holiday ---
Mode: [HOLIDAY]
(no additional fields)

--- 7D: Clear Cell ---
Mode: [CLEAR]
(no additional fields)

================================================================================
FORM 8: RAMADAN PAGE (Working Hours Calculators)
================================================================================

--- 8A: Daily Hours Calculator ---
Date: 2026-07-17

--- 8B: Overtime Calculator ---
Actual Hours: 10
Shift Hours: 8
Hourly Rate: 100

--- 8C: Overtime Calculator (edge) ---
Actual Hours: 0
Shift Hours: 8
Hourly Rate: 100

--- 8D: Compliance Validator ---
Hours Worked: 8
Overtime Hours: 0

--- 8E: Compliance Validator (non-compliant) ---
Hours Worked: 12
Overtime Hours: 4

--- 8F: Friday Compensation ---
Hours Worked: 8
Monthly Base Salary: 5000

================================================================================
FORM 9: SEARCH INPUTS (Type into search boxes)
================================================================================

--- Shifts Tab Searches ---
Search 1: MORN
Search 2: 09:00
Search 3: night
Search 4: ZZZZNOTEXIST
Search 5: <script>alert(1)</script>
Search 6: ' OR 1=1 --
Search 7: (200 chars of 'a': aaaaaaa...aaaa)

--- Assignments Tab Searches ---
Search 8: emp-001
Search 9: Morning

--- Rosters Tab Searches ---
Search 10: emp-002
Search 11: SCHEDULED

--- Swaps Tab Searches ---
Search 12: emp-001
Search 13: PENDING
Search 14: REJECTED

--- Roster Grid Searches ---
Search 15: Ahmed
Search 16: Supervisor
