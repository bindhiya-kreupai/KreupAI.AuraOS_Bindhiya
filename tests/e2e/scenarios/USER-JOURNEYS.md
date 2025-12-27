# E2E User Journey Test Scenarios
**Owner:** Dev B (QA Specialist) - PRIMARY OWNER
**Phase:** Weeks 5-8 (E2E Testing)
**Last Updated:** December 27, 2024

---

## Purpose

This document defines comprehensive user journey scenarios for E2E testing of critical AuraOS HCM flows:
- Leave Management
- Recruitment
- Performance Management

Each scenario represents a real-world user workflow from start to finish.

---

## Leave Management User Journeys

### Journey 1: Employee Applies for Annual Leave (Happy Path)

**Persona:** John Doe, Employee
**Goal:** Apply for 5 days of annual leave for a vacation

**Steps:**
1. **Login** as employee (john.doe@company.com)
2. **Navigate** to Leave Management module
3. **Verify** leave balance shows available annual leave (>= 5 days)
4. **Click** "Apply for Leave" button
5. **Fill** leave application form:
   - Leave Type: Annual Leave
   - Start Date: 2025-03-15
   - End Date: 2025-03-19
   - Reason: "Family vacation"
   - Contact Number: +1-234-567-8900
6. **Submit** leave application
7. **Verify** success message appears
8. **Verify** leave appears in "My Leave Requests" with status "Pending"
9. **Verify** leave balance is updated (reduced by 5 days)

**Expected Outcome:**
- Leave request submitted successfully
- Status: Pending approval
- Email notification sent to manager

---

### Journey 2: Manager Approves Leave Request (Happy Path)

**Persona:** Jane Manager, HR Manager
**Goal:** Review and approve employee leave request

**Steps:**
1. **Login** as manager (jane.manager@company.com)
2. **Navigate** to Leave Management module
3. **Navigate** to "Team Leave Requests" or "Pending Approvals"
4. **Verify** John's leave request appears with status "Pending"
5. **Click** on John's leave request to view details
6. **Review** leave details (dates, reason, leave balance)
7. **Click** "Approve" button
8. **Add** approval comments: "Approved. Enjoy your vacation!"
9. **Click** "Confirm"
10. **Verify** success message appears
11. **Verify** leave status changed to "Approved"

**Expected Outcome:**
- Leave request approved
- John receives approval notification email
- Team calendar updated with John's absence

---

### Journey 3: Employee Cancels Approved Leave (Edge Case)

**Persona:** John Doe, Employee
**Goal:** Cancel previously approved leave due to urgent project

**Precondition:** John has an approved leave request

**Steps:**
1. **Login** as employee
2. **Navigate** to Leave Management
3. **Navigate** to "My Leave Requests"
4. **Filter** by status "Approved"
5. **Click** on the approved leave request
6. **Click** "Cancel Leave" button
7. **Fill** cancellation reason: "Urgent project requires my presence"
8. **Click** "Confirm Cancellation"
9. **Verify** success message
10. **Verify** leave status changed to "Cancelled"
11. **Verify** leave balance restored

**Expected Outcome:**
- Leave cancelled successfully
- Leave balance restored (+5 days)
- Manager receives cancellation notification

---

### Journey 4: Leave Rejection Flow (Negative Path)

**Persona:** Jane Manager, HR Manager
**Goal:** Reject leave request due to staffing constraints

**Steps:**
1. **Login** as manager
2. **Navigate** to pending leave approvals
3. **Click** on pending leave request
4. **Click** "Reject" button
5. **Fill** rejection reason: "We're understaffed during this period. Please consider alternative dates."
6. **Click** "Confirm"
7. **Verify** success message
8. **Verify** status changed to "Rejected"

**Expected Outcome:**
- Leave rejected
- Employee receives rejection notification with reason
- Leave balance NOT deducted

---

## Recruitment User Journeys

### Journey 5: HR Posts New Job Opening (Happy Path)

**Persona:** Sarah HR, HR Manager
**Goal:** Post a new job opening for Senior Software Engineer

**Steps:**
1. **Login** as HR Manager (sarah.hr@company.com)
2. **Navigate** to Recruitment module
3. **Click** "Post New Job" button
4. **Fill** job posting form:
   - Job Title: "Senior Software Engineer"
   - Department: "Engineering"
   - Location: "San Francisco, CA"
   - Job Type: "Full-time"
   - Experience Level: "Senior"
   - Salary Range: "$120,000 - $160,000"
   - Description: "We are seeking an experienced software engineer..."
   - Requirements: "5+ years of experience in backend development..."
   - Benefits: "Health insurance, 401k, flexible hours..."
5. **Click** "Publish Job"
6. **Verify** success message
7. **Verify** job appears in active jobs list
8. **Verify** job status is "Active"

**Expected Outcome:**
- Job posted successfully
- Job appears on career page
- Applications can be received

---

### Journey 6: Recruiter Reviews Applications and Shortlists Candidates (Happy Path)

**Persona:** Sarah HR, HR Manager
**Goal:** Review applications and shortlist top candidates

**Precondition:** Job has received 10 applications

**Steps:**
1. **Login** as HR Manager
2. **Navigate** to Recruitment module
3. **Navigate** to "Applications" tab
4. **Filter** by job: "Senior Software Engineer"
5. **Click** on first application to review
6. **Review** candidate profile:
   - Name, email, phone
   - Resume
   - Cover letter
7. **Download** resume for detailed review
8. **Click** "Shortlist" button
9. **Verify** candidate moved to "Shortlisted" status
10. **Repeat** for 3-4 more candidates
11. **Verify** shortlisted count updated

**Expected Outcome:**
- 4 candidates shortlisted
- Candidates receive shortlist notification
- Ready for interview scheduling

---

### Journey 7: Schedule Interview for Shortlisted Candidate (Happy Path)

**Persona:** Sarah HR, HR Manager
**Goal:** Schedule first-round interview

**Precondition:** Candidate is shortlisted

**Steps:**
1. **Login** as HR Manager
2. **Navigate** to shortlisted applications
3. **Click** on candidate
4. **Click** "Schedule Interview" button
5. **Fill** interview details:
   - Date: "2025-02-01"
   - Time: "10:00 AM"
   - Interview Type: "Video"
   - Interviewers: "John Tech Lead, Jane Engineering Manager"
   - Duration: "60 minutes"
   - Agenda: "Technical assessment and cultural fit"
6. **Click** "Confirm"
7. **Verify** success message
8. **Verify** interview appears in calendar
9. **Verify** candidate status updated to "Interview Scheduled"

**Expected Outcome:**
- Interview scheduled
- Calendar invites sent to interviewers and candidate
- Candidate receives interview details email

---

### Journey 8: Make Offer to Successful Candidate (Happy Path)

**Persona:** Sarah HR, HR Manager
**Goal:** Send offer letter to selected candidate

**Precondition:** Candidate cleared all interview rounds

**Steps:**
1. **Login** as HR Manager
2. **Navigate** to candidate who passed interviews
3. **Click** "Make Offer" button
4. **Fill** offer details:
   - Position: "Senior Software Engineer"
   - Salary: "$140,000"
   - Start Date: "2025-03-01"
   - Benefits: [Health Insurance, 401k, Stock Options, PTO]
   - Offer Expiry: "2025-02-15"
   - Additional Terms: "Sign-on bonus of $10,000"
5. **Click** "Send Offer"
6. **Verify** success message
7. **Verify** candidate status changed to "Offer Extended"

**Expected Outcome:**
- Offer letter sent to candidate
- Offer details logged in system
- Awaiting candidate response

---

### Journey 9: Reject Unsuitable Candidate (Negative Path)

**Persona:** Sarah HR, HR Manager
**Goal:** Reject candidate who doesn't meet requirements

**Steps:**
1. **Login** as HR Manager
2. **Navigate** to Applications
3. **Click** on candidate to review
4. **Review** application
5. **Click** "Reject" button
6. **Fill** rejection reason: "Experience level doesn't match requirements"
7. **Click** "Confirm"
8. **Verify** success message
9. **Verify** candidate status changed to "Rejected"

**Expected Outcome:**
- Candidate rejected
- Polite rejection email sent
- Candidate removed from active pipeline

---

## Performance Management User Journeys

### Journey 10: Employee Creates Performance Goals (Happy Path)

**Persona:** Alex Employee, Software Engineer
**Goal:** Set quarterly performance goals

**Steps:**
1. **Login** as employee (alex.employee@company.com)
2. **Navigate** to Performance Management module
3. **Click** "Create Goal" button
4. **Fill** goal form:
   - Title: "Improve API response time by 30%"
   - Description: "Optimize database queries and implement caching"
   - Category: "Individual"
   - Priority: "High"
   - Due Date: "2025-06-30"
   - Key Results:
     - "Reduce average response time from 500ms to 350ms"
     - "Implement Redis caching for frequently accessed data"
     - "Optimize top 10 slowest queries"
5. **Click** "Save Goal"
6. **Verify** success message
7. **Verify** goal appears in goals list

**Expected Outcome:**
- Goal created successfully
- Manager notified of new goal
- Goal tracked for quarterly review

---

### Journey 11: Manager Schedules 1-on-1 Meeting (Happy Path)

**Persona:** Jane Manager, Engineering Manager
**Goal:** Schedule weekly 1-on-1 with direct report

**Steps:**
1. **Login** as manager (jane.manager@company.com)
2. **Navigate** to Performance Management
3. **Navigate** to "1-on-1 Meetings" tab
4. **Click** "Schedule Meeting" button
5. **Fill** meeting details:
   - Title: "Weekly 1-on-1 with Alex"
   - Employee: "Alex Employee"
   - Date: "2025-02-05"
   - Time: "2:00 PM"
   - Duration: "30 minutes"
   - Meeting Type: "One-on-one"
   - Agenda: "Progress update, roadblock discussion, goal review"
   - Location: "Conference Room A"
6. **Click** "Confirm"
7. **Verify** success message
8. **Verify** meeting appears in upcoming meetings

**Expected Outcome:**
- Meeting scheduled
- Calendar invite sent to Alex
- Meeting reminder 1 day before

---

### Journey 12: Manager Completes 1-on-1 and Adds Notes (Happy Path)

**Persona:** Jane Manager, Engineering Manager
**Goal:** Complete meeting and document discussion

**Precondition:** Meeting time has passed

**Steps:**
1. **Login** as manager
2. **Navigate** to "1-on-1 Meetings"
3. **Navigate** to "Past Meetings"
4. **Click** on completed meeting with Alex
5. **Fill** meeting notes:
   - Notes: "Discussed API optimization progress. Alex is on track with caching implementation. Needs help with database query optimization."
   - Action Items: "1. Schedule DB optimization training, 2. Pair Alex with senior engineer for query review"
6. **Click** "Complete Meeting"
7. **Verify** success message
8. **Verify** meeting marked as completed

**Expected Outcome:**
- Meeting notes saved
- Action items tracked
- Notes accessible for future reference

---

### Journey 13: Manager Submits Performance Review (Happy Path)

**Persona:** Jane Manager, Engineering Manager
**Goal:** Submit quarterly performance review for Alex

**Precondition:** Quarter has ended

**Steps:**
1. **Login** as manager
2. **Navigate** to Performance Management
3. **Navigate** to "Reviews" tab
4. **Click** "Start Review" button
5. **Select** employee: "Alex Employee"
6. **Select** review period: "Q1 2025"
7. **Fill** performance review:
   - Overall Rating: 4 (out of 5)
   - Strengths: "Strong technical skills, proactive problem-solver, good collaboration"
   - Areas for Improvement: "Could improve code documentation, time management on large projects"
   - Achievements: "Successfully optimized API reducing response time by 35%, mentored junior developer"
   - Future Goals: "Lead next major feature development, improve system design skills"
   - Comments: "Alex has shown excellent growth this quarter and is ready for more responsibilities"
8. **Click** "Submit Review"
9. **Verify** success message
10. **Verify** review appears in completed reviews

**Expected Outcome:**
- Review submitted
- Alex receives review notification
- HR receives review for records
- Review discussion scheduled

---

### Journey 14: Employee Views Performance Review (Happy Path)

**Persona:** Alex Employee, Software Engineer
**Goal:** View quarterly performance review from manager

**Precondition:** Manager has submitted review

**Steps:**
1. **Login** as employee
2. **Navigate** to Performance Management
3. **Navigate** to "My Reviews" tab
4. **Verify** new review notification/badge
5. **Click** on latest review (Q1 2025)
6. **Review** all sections:
   - Overall rating
   - Strengths
   - Areas for improvement
   - Achievements
   - Future goals
   - Manager comments
7. **Add** employee comments: "Thank you for the feedback. I agree with the areas for improvement and will focus on documentation."
8. **Click** "Acknowledge Review"
9. **Verify** success message

**Expected Outcome:**
- Review acknowledged
- Manager notified of acknowledgment
- Review discussion can be scheduled

---

## Cross-Module User Journey

### Journey 15: End-to-End New Employee Workflow

**Personas:** Multiple (HR Manager, Hiring Manager, New Employee, Manager)
**Goal:** Complete full employee lifecycle from recruitment to performance management

**Steps:**

**Phase 1: Recruitment (Week 1)**
1. HR posts job opening
2. Candidates apply
3. HR shortlists candidates
4. Interviews scheduled and conducted
5. Offer made and accepted

**Phase 2: Onboarding (Week 2)**
1. New employee record created
2. Onboarding tasks assigned
3. System access provisioned
4. Employee completes onboarding

**Phase 3: Goal Setting (Week 3)**
1. Manager schedules 1-on-1
2. Employee and manager set 90-day goals
3. Goals documented in system

**Phase 4: Leave Request (Week 8)**
1. Employee requests time off
2. Manager approves
3. Leave tracked in system

**Phase 5: Performance Review (Week 12)**
1. Manager submits 90-day review
2. Employee reviews and acknowledges
3. Performance discussion held
4. Next quarter goals set

**Expected Outcome:**
- Complete employee lifecycle tracked
- All modules integrated correctly
- Data flows seamlessly between modules

---

## Test Data Requirements

### Leave Management Test Data

| Data Type | Required Values | Notes |
|-----------|----------------|-------|
| Employees | 10 employees | Various departments |
| Managers | 3 managers | With direct reports |
| Leave Types | Annual, Sick, Casual | With balances |
| Leave Policies | Standard policy | 20 annual, 10 sick, 5 casual |

### Recruitment Test Data

| Data Type | Required Values | Notes |
|-----------|----------------|-------|
| Job Postings | 5 active jobs | Various departments |
| Applications | 50 applications | 10 per job |
| Candidates | 30 unique candidates | With resumes |
| Interviewers | 5 interviewers | Various roles |

### Performance Test Data

| Data Type | Required Values | Notes |
|-----------|----------------|-------|
| Employees | 10 employees | Same as leave |
| Goals | 20 goals | Individual and team |
| Reviews | 5 completed reviews | Various ratings |
| Meetings | 10 meetings | Upcoming and past |

---

## Exploratory Testing Scenarios

### Leave Management Exploratory Tests

1. **Boundary Testing:**
   - Apply for leave with 0 balance
   - Apply for more days than available
   - Apply for leave in the past
   - Apply for leave spanning multiple years

2. **Workflow Variations:**
   - Apply for half-day leave
   - Apply for overlapping leave requests
   - Cancel leave on the leave date itself
   - Modify approved leave dates

3. **Multi-user Scenarios:**
   - Multiple employees apply for same dates
   - Manager approves/rejects in bulk
   - Employee applies while manager is on leave

### Recruitment Exploratory Tests

1. **Workflow Variations:**
   - Post job without salary range
   - Schedule interview with unavailable interviewer
   - Make offer to rejected candidate
   - Close job with pending applications

2. **Edge Cases:**
   - Duplicate application from same candidate
   - Interview reschedule multiple times
   - Offer acceptance after expiry date
   - Candidate withdraws after offer

### Performance Exploratory Tests

1. **Goal Management:**
   - Create goal with past due date
   - Goal with 10+ key results
   - Reassign goal to different employee
   - Mark goal complete before due date

2. **Review Scenarios:**
   - Submit review for employee who left
   - Review without prior 1-on-1s
   - Employee disputes review
   - Review for multiple periods

---

## Non-Functional Test Scenarios

### Performance Testing
- Load test: 100 concurrent leave applications
- Load test: Job posting with 1000 views/day
- Load test: 50 simultaneous performance reviews

### Security Testing
- Test tenant isolation in leave requests
- Test unauthorized access to other employees' reviews
- Test SQL injection in search fields
- Test XSS in free-text fields

### Accessibility Testing
- Screen reader navigation through leave form
- Keyboard-only navigation for job posting
- Color contrast in performance dashboard
- ARIA labels for all interactive elements

---

## Test Execution Guidelines

### Pre-requisites
1. Test database seeded with required data
2. Test users created with appropriate roles
3. Email notifications configured for test environment
4. Calendar integration tested

### Test Environment
- **URL:** `https://staging.auraos.com`
- **Database:** Isolated test database
- **Email:** Test email server (Mailtrap/SendGrid Sandbox)

### Test Data Refresh
- Reset test data after each test suite
- Use factories to generate consistent test data
- Maintain data isolation between test runs

---

## Success Criteria

### Leave Management
- ✅ All 4 leave journeys complete successfully
- ✅ Leave balance calculations accurate
- ✅ Email notifications sent at each step
- ✅ No data leakage between tenants

### Recruitment
- ✅ All 5 recruitment journeys complete successfully
- ✅ Application workflow from posting to offer works
- ✅ Interview scheduling integrates with calendar
- ✅ Offer generation accurate

### Performance Management
- ✅ All 5 performance journeys complete successfully
- ✅ Goals track progress correctly
- ✅ 1-on-1 meetings scheduled and documented
- ✅ Reviews submitted and acknowledged

---

**End of User Journeys Document**

*This document will be used to create actual E2E test specs in Playwright during Weeks 5-8.*
