/**
 * Interview Management E2E Tests
 * Plan D - Week 7, Day 35
 *
 * Tests interview scheduling, feedback collection, and evaluation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';
const INTERVIEWER_EMAIL = 'interviewer@e2etest.com';
const INTERVIEWER_PASSWORD = 'Test@1234';
const CANDIDATE_EMAIL = 'candidate@e2etest.com';
const CANDIDATE_PASSWORD = 'Test@1234';

let hrToken: string;
let interviewerToken: string;
let candidateToken: string;
let interviewId: number;

test.describe('Interview Management E2E', () => {
  test.beforeAll(async ({ request }) => {
    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: HR_EMAIL,
        password: HR_PASSWORD,
      },
    });

    const hrData = await hrResponse.json();
    hrToken = hrData.data.accessToken;

    // Interviewer login
    const interviewerResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: INTERVIEWER_EMAIL,
        password: INTERVIEWER_PASSWORD,
      },
    });

    const interviewerData = await interviewerResponse.json();
    interviewerToken = interviewerData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, hrToken);
  });

  test.describe('Interview Scheduling (HR)', () => {
    test('should schedule technical interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Select shortlisted candidate
      await page.click('table tbody tr:has-text("Shortlisted"):first-child button:has-text("View")');

      // Schedule interview button
      await page.click('button:has-text("Schedule Interview")');

      // Interview scheduling form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Schedule Interview")')).toBeVisible();

      // Interview type
      await page.selectOption('select[name="interviewType"]', 'technical');

      // Interview round
      await page.selectOption('select[name="round"]', '1');

      // Date and time
      await page.fill('input[name="interviewDate"]', '2024-02-20');
      await page.fill('input[name="startTime"]', '10:00');
      await page.fill('input[name="endTime"]', '11:30');

      // Interview mode
      await page.selectOption('select[name="mode"]', 'video_call');

      // Meeting link
      await page.fill('input[name="meetingLink"]', 'https://meet.google.com/abc-defg-hij');

      // Add interviewers
      await page.fill('input[placeholder*="Search interviewers"]', 'John');
      await page.waitForTimeout(500);
      await page.click('li:has-text("John Technical")');

      await page.fill('input[placeholder*="Search interviewers"]', 'Sarah');
      await page.waitForTimeout(500);
      await page.click('li:has-text("Sarah Engineer")');

      // Interview instructions
      await page.fill('textarea[name="instructions"]', 'Focus on data structures and algorithms. Assess problem-solving skills.');

      // Send calendar invite
      await page.check('input[name="sendCalendarInvite"]');

      // Schedule
      await page.click('button[type="submit"]:has-text("Schedule Interview")');

      await expect(page.locator('.toast-success')).toContainText('Interview scheduled');

      // Interview should appear in timeline
      await expect(page.locator('.timeline-item:has-text("Technical Interview")')).toBeVisible();
    });

    test('should schedule HR interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Schedule Interview")');

      await page.selectOption('select[name="interviewType"]', 'hr');
      await page.fill('input[name="interviewDate"]', '2024-02-15');
      await page.fill('input[name="startTime"]', '14:00');
      await page.fill('input[name="endTime"]', '15:00');

      await page.selectOption('select[name="mode"]', 'in_person');
      await page.fill('input[name="location"]', 'Conference Room A, 3rd Floor');

      await page.fill('input[placeholder*="Search interviewers"]', 'HR Manager');
      await page.waitForTimeout(500);
      await page.click('li:has-text("HR Manager")');

      await page.click('button[type="submit"]:has-text("Schedule Interview")');

      await expect(page.locator('.toast-success')).toContainText('Interview scheduled');
    });

    test('should schedule panel interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Schedule Interview")');

      await page.selectOption('select[name="interviewType"]', 'panel');
      await page.fill('input[name="interviewDate"]', '2024-02-22');
      await page.fill('input[name="startTime"]', '15:00');
      await page.fill('input[name="endTime"]', '17:00');

      // Add multiple panel members
      const interviewers = ['Tech Lead', 'Senior Engineer', 'Architect'];

      for (const interviewer of interviewers) {
        await page.fill('input[placeholder*="Search interviewers"]', interviewer);
        await page.waitForTimeout(500);
        await page.click(`li:has-text("${interviewer}")`);
      }

      await page.click('button[type="submit"]:has-text("Schedule Interview")');

      await expect(page.locator('.toast-success')).toContainText('Interview scheduled');
    });

    test('should validate interview scheduling conflicts', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Schedule Interview")');

      // Try to schedule at time when interviewer is busy
      await page.fill('input[name="interviewDate"]', '2024-02-20');
      await page.fill('input[name="startTime"]', '10:00');
      await page.fill('input[name="endTime"]', '11:00');

      await page.fill('input[placeholder*="Search interviewers"]', 'Busy Person');
      await page.waitForTimeout(500);
      await page.click('li:has-text("Busy Person")');

      await page.click('button[type="submit"]');

      // Should show conflict warning
      await expect(page.locator('text=/Interviewer has a conflict/')).toBeVisible();
    });

    test('should reschedule interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      // Find scheduled interview
      const interview = page.locator('table tbody tr:has-text("Scheduled"):first-child');
      await interview.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Reschedule")');

      // Update date/time
      await page.fill('input[name="interviewDate"]', '2024-02-21');
      await page.fill('input[name="startTime"]', '11:00');

      // Reschedule reason
      await page.fill('textarea[name="rescheduleReason"]', 'Interviewer unavailable due to emergency');

      // Notify participants
      await page.check('input[name="notifyParticipants"]');

      await page.click('button:has-text("Reschedule")');

      await expect(page.locator('.toast-success')).toContainText('Interview rescheduled');
    });

    test('should cancel interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      const interview = page.locator('table tbody tr:has-text("Scheduled"):first-child');
      await interview.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Cancel")');

      // Cancellation dialog
      await expect(page.locator('text=Cancel Interview')).toBeVisible();

      await page.selectOption('select[name="cancellationReason"]', 'candidate_withdrew');
      await page.fill('textarea[name="notes"]', 'Candidate accepted offer from another company');

      // Notify participants
      await page.check('input[name="notifyParticipants"]');

      await page.click('button:has-text("Cancel Interview")');

      await expect(page.locator('.toast-success')).toContainText('Interview cancelled');
    });

    test('should view interview calendar', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interview-calendar`);

      // Calendar view
      await expect(page.locator('[data-testid="interview-calendar"]')).toBeVisible();

      // Should show scheduled interviews
      await expect(page.locator('.calendar-event').first()).toBeVisible();

      // Click on interview to view details
      await page.click('.calendar-event:first-child');

      // Quick view modal
      await expect(page.locator('[data-testid="interview-quick-view"]')).toBeVisible();
    });

    test('should bulk schedule interviews', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Select multiple shortlisted candidates
      await page.check('table tbody tr:has-text("Shortlisted"):nth-child(1) input[type="checkbox"]');
      await page.check('table tbody tr:has-text("Shortlisted"):nth-child(2) input[type="checkbox"]');

      // Bulk actions
      await page.click('button:has-text("Bulk Actions")');
      await page.click('button:has-text("Schedule Interviews")');

      // Bulk scheduling form
      await page.selectOption('select[name="interviewType"]', 'technical');
      await page.fill('input[name="startDate"]', '2024-02-20');

      // Time slots
      await page.fill('input[name="slotDuration"]', '90'); // 90 minutes per interview
      await page.fill('input[name="breakBetween"]', '30'); // 30 min break

      await page.click('button:has-text("Generate Schedule")');

      await expect(page.locator('.toast-success')).toContainText(/scheduled.*interviews/);
    });
  });

  test.describe('Interview Feedback (Interviewer)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, interviewerToken);
    });

    test('should view assigned interviews', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      // Should see interviews where logged in user is interviewer
      await expect(page.locator('h1:has-text("My Interviews")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Upcoming and past tabs
      await expect(page.locator('button:has-text("Upcoming")')).toBeVisible();
      await expect(page.locator('button:has-text("Past")')).toBeVisible();
    });

    test('should view interview details', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Interview details page
      await expect(page.locator('[data-testid="interview-details"]')).toBeVisible();

      // Candidate information
      await expect(page.locator('text=Candidate Profile')).toBeVisible();
      await expect(page.locator('text=Resume')).toBeVisible();

      // Interview information
      await expect(page.locator('text=Interview Date')).toBeVisible();
      await expect(page.locator('text=Interview Type')).toBeVisible();
      await expect(page.locator('text=Instructions')).toBeVisible();

      // Join meeting button (if video call)
      await expect(page.locator('button:has-text("Join Meeting")')).toBeVisible();
    });

    test('should submit interview feedback', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      // Go to completed interviews
      await page.click('button:has-text("Past")');

      // Find interview pending feedback
      const interview = page.locator('table tbody tr:has-text("Pending Feedback"):first-child');
      await interview.locator('button:has-text("Submit Feedback")').click();

      // Feedback form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Interview Feedback")')).toBeVisible();

      // Overall rating
      await page.click('[data-testid="overall-rating"] button:nth-child(4)'); // 4/5

      // Skill ratings
      await page.click('[data-testid="rating-technical-skills"] button:nth-child(5)');
      await page.click('[data-testid="rating-communication"] button:nth-child(4)');
      await page.click('[data-testid="rating-problem-solving"] button:nth-child(4)');
      await page.click('[data-testid="rating-cultural-fit"] button:nth-child(3)');

      // Strengths
      await page.fill('textarea[name="strengths"]', '- Strong in algorithms\n- Good problem-solving approach\n- Clear communication');

      // Areas for improvement
      await page.fill('textarea[name="areasOfImprovement"]', '- Could improve system design knowledge\n- More practice with distributed systems');

      // Detailed feedback
      await page.fill('textarea[name="detailedFeedback"]', 'Candidate performed well overall. Strong technical foundation...');

      // Recommendation
      await page.selectOption('select[name="recommendation"]', 'strong_yes');

      // Submit
      await page.click('button[type="submit"]:has-text("Submit Feedback")');

      await expect(page.locator('.toast-success')).toContainText('Feedback submitted');
    });

    test('should save feedback as draft', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      await page.click('button:has-text("Past")');

      const interview = page.locator('table tbody tr:has-text("Pending Feedback"):first-child');
      await interview.locator('button:has-text("Submit Feedback")').click();

      // Partial fill
      await page.click('[data-testid="overall-rating"] button:nth-child(4)');
      await page.fill('textarea[name="strengths"]', 'Good technical skills');

      // Save draft
      await page.click('button:has-text("Save Draft")');

      await expect(page.locator('.toast-success')).toContainText('Draft saved');
    });

    test('should mark candidate as no-show', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      await page.click('button:has-text("Upcoming")');

      const interview = page.locator('table tbody tr:first-child');
      await interview.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Mark as No-show")');

      // Confirmation
      await page.fill('textarea[name="notes"]', 'Candidate did not join the meeting');
      await page.click('button:has-text("Mark as No-show")');

      await expect(page.locator('.toast-success')).toContainText('Marked as no-show');
    });

    test('should request feedback reminder', async ({ page }) => {
      await page.goto(`${BASE_URL}/interviews/my-interviews`);

      await page.click('button:has-text("Past")');

      // Find completed interview
      const interview = page.locator('table tbody tr:has-text("Completed"):first-child');

      // Should show reminder indicator if feedback overdue
      await expect(interview.locator('.feedback-overdue-badge')).toBeVisible();
    });
  });

  test.describe('Interview Coordination (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view all interviews dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      // Interviews list
      await expect(page.locator('h1:has-text("Interviews")')).toBeVisible();

      // Filters
      await expect(page.locator('button:has-text("Scheduled")')).toBeVisible();
      await expect(page.locator('button:has-text("Completed")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancelled")')).toBeVisible();

      // Table with interviews
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should filter interviews by status', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      await page.click('button:has-text("Completed")');

      await page.waitForTimeout(500);

      // All visible interviews should be completed
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Completed');
      }
    });

    test('should filter interviews by interviewer', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      await page.selectOption('select[name="interviewerId"]', { index: 1 });

      await page.waitForTimeout(500);

      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should view consolidated interview feedback', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      // Find completed interview
      const interview = page.locator('table tbody tr:has-text("Completed"):first-child');
      await interview.locator('button:has-text("View Feedback")').click();

      // Consolidated feedback page
      await expect(page.locator('[data-testid="consolidated-feedback"]')).toBeVisible();

      // Should show all interviewer feedback
      await expect(page.locator('.feedback-card').first()).toBeVisible();

      // Average ratings
      await expect(page.locator('text=Average Rating')).toBeVisible();

      // Individual feedback from each interviewer
      await expect(page.locator('.interviewer-feedback').first()).toBeVisible();
    });

    test('should send feedback reminder to interviewer', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      // Find interview with pending feedback
      const interview = page.locator('table tbody tr:has-text("Pending Feedback"):first-child');
      await interview.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Send Reminder")');

      await expect(page.locator('.toast-success')).toContainText('Reminder sent');
    });

    test('should export interviews to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/interviews`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('interviews');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });

  test.describe('Interview Analytics & Reports', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view interview metrics dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/interview-metrics`);

      // Metrics cards
      await expect(page.locator('[data-testid="interview-metrics"]')).toBeVisible();

      // KPIs
      await expect(page.locator('text=Total Interviews Conducted')).toBeVisible();
      await expect(page.locator('text=Average Interview Rating')).toBeVisible();
      await expect(page.locator('text=Feedback Completion Rate')).toBeVisible();
      await expect(page.locator('text=No-show Rate')).toBeVisible();
    });

    test('should view interviewer performance report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/interviewer-performance`);

      // Select date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Report table
      await expect(page.locator('table thead th:has-text("Interviewer")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Interviews Conducted")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Avg Rating Given")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Feedback Timeliness")')).toBeVisible();
    });

    test('should view interview-to-hire conversion rate', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/conversion-rates`);

      // Conversion funnel
      await expect(page.locator('[data-testid="conversion-funnel"]')).toBeVisible();

      // Metrics
      await expect(page.locator('text=Interview Scheduled to Completed')).toBeVisible();
      await expect(page.locator('text=Interview to Offer')).toBeVisible();
      await expect(page.locator('text=Offer to Acceptance')).toBeVisible();
    });
  });

  test.describe('Interview Templates & Standards', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should create interview template', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/interview-templates`);

      await page.click('button:has-text("Create Template")');

      // Template form
      await page.fill('input[name="templateName"]', 'Technical Interview - Backend');
      await page.selectOption('select[name="interviewType"]', 'technical');

      // Duration
      await page.fill('input[name="duration"]', '90');

      // Evaluation criteria
      await page.fill('textarea[name="criteria"]', '1. Data Structures & Algorithms\n2. System Design\n3. Coding Standards\n4. Problem Solving');

      // Sample questions
      await page.fill('textarea[name="sampleQuestions"]', '1. Design a URL shortener\n2. Implement LRU cache\n3. Database optimization techniques');

      // Save template
      await page.click('button:has-text("Save Template")');

      await expect(page.locator('.toast-success')).toContainText('Template created');
    });

    test('should use template when scheduling interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Schedule Interview")');

      // Select template
      await page.selectOption('select[name="template"]', { label: 'Technical Interview - Backend' });

      // Template details should auto-populate
      await expect(page.locator('input[name="duration"]')).toHaveValue('90');
      await expect(page.locator('textarea[name="instructions"]')).not.toBeEmpty();
    });

    test('should configure interview scorecard', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/interview-scorecard`);

      // Add evaluation parameter
      await page.click('button:has-text("Add Parameter")');

      await page.fill('input[name="parameterName"]', 'Technical Skills');
      await page.fill('input[name="weight"]', '40');
      await page.fill('textarea[name="description"]', 'Assessment of coding and technical knowledge');

      await page.click('button:has-text("Save")');

      await expect(page.locator('.toast-success')).toContainText('Parameter added');
    });
  });

  test.describe('Candidate Interview Experience', () => {
    test('should receive interview invitation email', async ({ page }) => {
      // This would typically be tested with email testing tools
      // For E2E, we can verify the confirmation page after scheduling

      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);

      await page.goto(`${BASE_URL}/recruitment/candidates`);
      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Schedule Interview")');

      // Schedule with email notification
      await page.selectOption('select[name="interviewType"]', 'technical');
      await page.fill('input[name="interviewDate"]', '2024-02-20');
      await page.fill('input[name="startTime"]', '10:00');
      await page.fill('input[name="endTime"]', '11:30');
      await page.check('input[name="sendCalendarInvite"]');

      await page.click('button[type="submit"]:has-text("Schedule Interview")');

      // Verify notification was sent
      await expect(page.locator('.toast-success')).toContainText('Interview scheduled');
      await expect(page.locator('text=/invitation sent/i')).toBeVisible();
    });
  });
});
