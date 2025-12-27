/**
 * Performance Review E2E Tests
 * Plan D - Week 7, Day 37
 *
 * Tests performance review cycles, 360 feedback, ratings, and promotion workflows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const MANAGER_EMAIL = 'manager@e2etest.com';
const MANAGER_PASSWORD = 'Test@1234';
const PEER_EMAIL = 'peer@e2etest.com';
const PEER_PASSWORD = 'Test@1234';
const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';

let employeeToken: string;
let managerToken: string;
let peerToken: string;
let hrToken: string;
let reviewCycleId: number;

test.describe('Performance Review E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Employee login
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD },
    });
    employeeToken = (await empResponse.json()).data.accessToken;

    // Manager login
    const mgrResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: MANAGER_EMAIL, password: MANAGER_PASSWORD },
    });
    managerToken = (await mgrResponse.json()).data.accessToken;

    // Peer login
    const peerResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: PEER_EMAIL, password: PEER_PASSWORD },
    });
    peerToken = (await peerResponse.json()).data.accessToken;

    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: HR_EMAIL, password: HR_PASSWORD },
    });
    hrToken = (await hrResponse.json()).data.accessToken;
  });

  test.describe('Review Cycle Setup (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should create annual review cycle', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/review-cycles`);

      await page.click('button:has-text("Create Review Cycle")');

      // Review cycle form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      await page.fill('input[name="cycleName"]', 'Annual Performance Review 2024');
      await page.selectOption('select[name="cycleType"]', 'annual');

      // Review period
      await page.fill('input[name="reviewPeriodStart"]', '2024-01-01');
      await page.fill('input[name="reviewPeriodEnd"]', '2024-12-31');

      // Timeline
      await page.fill('input[name="selfReviewStart"]', '2025-01-01');
      await page.fill('input[name="selfReviewEnd"]', '2025-01-15');

      await page.fill('input[name="managerReviewStart"]', '2025-01-16');
      await page.fill('input[name="managerReviewEnd"]', '2025-01-31');

      // 360 feedback
      await page.check('input[name="enable360Feedback"]');

      await page.fill('input[name="peerFeedbackStart"]', '2025-01-01');
      await page.fill('input[name="peerFeedbackEnd"]', '2025-01-20');

      // Rating scale
      await page.selectOption('select[name="ratingScale"]', '5_point');

      // Participants
      await page.selectOption('select[name="eligibility"]', 'all_employees');

      // Create cycle
      await page.click('button[type="submit"]:has-text("Create Cycle")');

      await expect(page.locator('.toast-success')).toContainText('Review cycle created');
    });

    test('should launch review cycle', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/review-cycles`);

      const cycle = page.locator('table tbody tr:has-text("Draft"):first-child');
      await cycle.locator('button:has-text("Launch")').click();

      // Launch confirmation
      await expect(page.locator('text=Launch Review Cycle')).toBeVisible();
      await expect(page.locator('text=/will be notified/')).toBeVisible();

      await page.click('button:has-text("Launch Cycle")');

      await expect(page.locator('.toast-success')).toContainText('Review cycle launched');

      // Status should change
      await expect(cycle).toContainText('Active');
    });

    test('should view review cycle dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/review-cycles`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Cycle dashboard
      await expect(page.locator('[data-testid="cycle-dashboard"]')).toBeVisible();

      // Metrics
      await expect(page.locator('text=Total Participants')).toBeVisible();
      await expect(page.locator('text=Self Reviews Completed')).toBeVisible();
      await expect(page.locator('text=Manager Reviews Completed')).toBeVisible();
      await expect(page.locator('text=Completion Rate')).toBeVisible();
    });
  });

  test.describe('Self Review (Employee)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should view pending self review', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-reviews`);

      // Pending reviews
      await expect(page.locator('[data-testid="pending-reviews"]')).toBeVisible();

      // Review card
      await expect(page.locator('.review-card:has-text("Pending")')).toBeVisible();
    });

    test('should complete self review', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-reviews`);

      await page.click('.review-card:has-text("Pending") button:has-text("Start Review")');

      // Self review form
      await expect(page.locator('[data-testid="self-review-form"]')).toBeVisible();

      // Section 1: Goal Achievement
      await page.click('button:has-text("Goal Achievement")');

      // Goals are pre-populated
      const goal1 = page.locator('[data-testid="goal-review-1"]');
      await goal1.locator('select[name="achievementRating"]').selectOption('4');
      await goal1.locator('textarea[name="achievementComments"]').fill('Successfully achieved 95% of goal targets. All API optimizations completed.');

      // Section 2: Competencies
      await page.click('button:has-text("Competencies")');

      await page.selectOption('select[name="competency-technical"]', '4');
      await page.selectOption('select[name="competency-communication"]', '4');
      await page.selectOption('select[name="competency-teamwork"]', '5');
      await page.selectOption('select[name="competency-leadership"]', '3');

      // Section 3: Achievements
      await page.click('button:has-text("Achievements")');

      await page.fill('textarea[name="keyAchievements"]', '- Led API optimization project\n- Mentored 2 junior developers\n- Reduced system downtime by 40%');

      // Section 4: Challenges
      await page.fill('textarea[name="challenges"]', 'Faced resource constraints during Q3. Managed with help from team.');

      // Section 5: Development Areas
      await page.fill('textarea[name="developmentAreas"]', 'Want to improve system design skills and cloud architecture knowledge');

      // Section 6: Future Goals
      await page.fill('textarea[name="futureGoals"]', 'Lead microservices migration project. Achieve AWS certification.');

      // Overall self rating
      await page.selectOption('select[name="overallSelfRating"]', '4');

      // Save draft
      await page.click('button:has-text("Save Draft")');
      await expect(page.locator('.toast-success')).toContainText('Draft saved');

      // Submit review
      await page.click('button:has-text("Submit Review")');

      // Confirmation
      await expect(page.locator('text=Submit Self Review')).toBeVisible();
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Self review submitted');
    });

    test('should view review status', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-reviews`);

      // Review status indicator
      await expect(page.locator('text=Self Review: Completed')).toBeVisible();
      await expect(page.locator('text=Manager Review: Pending')).toBeVisible();
    });
  });

  test.describe('360 Degree Feedback (Peer)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, peerToken);
    });

    test('should view peer feedback requests', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/peer-feedback`);

      // Pending feedback requests
      await expect(page.locator('h1:has-text("Peer Feedback Requests")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should submit peer feedback', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/peer-feedback`);

      await page.click('table tbody tr:first-child button:has-text("Provide Feedback")');

      // Peer feedback form
      await expect(page.locator('[data-testid="peer-feedback-form"]')).toBeVisible();

      // Working relationship
      await page.selectOption('select[name="workingRelationship"]', 'collaborated_on_projects');

      // Competency ratings
      await page.selectOption('select[name="technical-skills"]', '4');
      await page.fill('textarea[name="technical-skills-comments"]', 'Strong technical expertise. Always delivers quality code.');

      await page.selectOption('select[name="communication"]', '5');
      await page.fill('textarea[name="communication-comments"]', 'Excellent communicator. Explains complex concepts clearly.');

      await page.selectOption('select[name="collaboration"]', '4');
      await page.fill('textarea[name="collaboration-comments"]', 'Great team player. Always willing to help others.');

      // Strengths
      await page.fill('textarea[name="strengths"]', 'Problem-solving ability, mentorship, code quality');

      // Areas for improvement
      await page.fill('textarea[name="improvements"]', 'Could benefit from more focus on documentation');

      // Additional comments
      await page.fill('textarea[name="additionalComments"]', 'Pleasure to work with. Valuable team member.');

      // Submit
      await page.click('button:has-text("Submit Feedback")');

      await expect(page.locator('.toast-success')).toContainText('Feedback submitted');
    });

    test('should submit anonymous feedback', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/peer-feedback`);

      await page.click('table tbody tr:first-child button:has-text("Provide Feedback")');

      // Check anonymous option
      await page.check('input[name="submitAnonymously"]');

      // Fill feedback
      await page.selectOption('select[name="technical-skills"]', '3');
      await page.fill('textarea[name="improvements"]', 'Needs to work on time management');

      await page.click('button:has-text("Submit Feedback")');

      await expect(page.locator('.toast-success')).toContainText('Anonymous feedback submitted');
    });
  });

  test.describe('Manager Review', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view team members pending review', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      // Team review dashboard
      await expect(page.locator('[data-testid="team-reviews-dashboard"]')).toBeVisible();

      // Pending reviews
      await expect(page.locator('text=Pending Reviews')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should review employee with peer feedback', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      await page.click('table tbody tr:first-child button:has-text("Conduct Review")');

      // Manager review form
      await expect(page.locator('[data-testid="manager-review-form"]')).toBeVisible();

      // View employee self review
      await page.click('button:has-text("View Self Review")');
      await expect(page.locator('[data-testid="self-review-summary"]')).toBeVisible();
      await page.click('button:has-text("Close")');

      // View peer feedback
      await page.click('button:has-text("View Peer Feedback")');
      await expect(page.locator('[data-testid="peer-feedback-summary"]')).toBeVisible();
      await expect(page.locator('.feedback-item').first()).toBeVisible();
      await page.click('button:has-text("Close")');

      // Goal review
      const goal1 = page.locator('[data-testid="goal-manager-review-1"]');
      await goal1.locator('select[name="managerRating"]').selectOption('4');
      await goal1.locator('textarea[name="managerComments"]').fill('Excellent execution. Met all objectives.');

      // Competency ratings
      await page.selectOption('select[name="competency-technical"]', '4');
      await page.selectOption('select[name="competency-communication"]', '4');
      await page.selectOption('select[name="competency-teamwork"]', '5');
      await page.selectOption('select[name="competency-leadership"]', '3');

      // Overall performance
      await page.selectOption('select[name="overallRating"]', '4');

      // Performance summary
      await page.fill('textarea[name="performanceSummary"]', 'Strong performer. Consistently delivers high-quality work. Key contributor to team success.');

      // Strengths
      await page.fill('textarea[name="strengths"]', 'Technical expertise, mentorship, problem-solving');

      // Development areas
      await page.fill('textarea[name="developmentAreas"]', 'System design, cloud architecture');

      // Recommendations
      await page.check('input[name="recommendPromotion"]');
      await page.fill('input[name="salaryIncreaseRecommendation"]', '12');

      // Development plan
      await page.fill('textarea[name="developmentPlan"]', 'Enroll in AWS Solution Architect course. Lead system design discussions.');

      // Submit review
      await page.click('button:has-text("Submit Review")');

      await expect(page.locator('.toast-success')).toContainText('Review submitted');
    });

    test('should normalize ratings if enabled', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      // After completing all team reviews
      await page.click('button:has-text("Normalize Ratings")');

      // Rating distribution view
      await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();

      // Bell curve visualization
      await expect(page.locator('[data-testid="distribution-chart"]')).toBeVisible();

      // Adjust if needed
      const employee = page.locator('[data-testid="rating-adjustment"] table tbody tr:first-child');
      await employee.locator('select[name="adjustedRating"]').selectOption('4');

      await page.click('button:has-text("Save Adjustments")');

      await expect(page.locator('.toast-success')).toContainText('Ratings normalized');
    });
  });

  test.describe('Review Discussion & Calibration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should schedule review discussion', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      const review = page.locator('table tbody tr:has-text("Review Completed"):first-child');
      await review.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Schedule Discussion")');

      // Discussion scheduling
      await page.fill('input[name="discussionDate"]', '2025-02-05');
      await page.fill('input[name="startTime"]', '14:00');
      await page.fill('input[name="endTime"]', '15:00');

      await page.selectOption('select[name="mode"]', 'in_person');
      await page.fill('input[name="location"]', 'Meeting Room 201');

      // Send calendar invite
      await page.check('input[name="sendInvite"]');

      await page.click('button:has-text("Schedule")');

      await expect(page.locator('.toast-success')).toContainText('Discussion scheduled');
    });

    test('should conduct review discussion and get employee acknowledgment', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Mark discussion as completed
      await page.click('button:has-text("Discussion Completed")');

      // Discussion notes
      await page.fill('textarea[name="discussionNotes"]', 'Discussed performance, goals for next year, and career development plan.');

      // Employee acknowledgment - send to employee
      await page.check('input[name="requestAcknowledgment"]');

      await page.click('button:has-text("Complete Discussion")');

      await expect(page.locator('.toast-success')).toContainText('Discussion completed');
    });
  });

  test.describe('Employee Review Acknowledgment', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should acknowledge review', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-reviews`);

      // Find review pending acknowledgment
      const review = page.locator('.review-card:has-text("Pending Acknowledgment")');
      await review.locator('button:has-text("View Review")').click();

      // Review details
      await expect(page.locator('[data-testid="review-details"]')).toBeVisible();

      // View manager rating and feedback
      await expect(page.locator('text=Manager Rating')).toBeVisible();
      await expect(page.locator('text=Performance Summary')).toBeVisible();

      // Employee comments (optional)
      await page.fill('textarea[name="employeeComments"]', 'Thank you for the feedback. I look forward to working on the development areas identified.');

      // Acknowledge
      await page.check('input[name="acknowledgeReview"]');

      await page.click('button:has-text("Acknowledge Review")');

      await expect(page.locator('.toast-success')).toContainText('Review acknowledged');
    });

    test('should raise concern about review', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-reviews`);

      const review = page.locator('.review-card:has-text("Pending Acknowledgment")');
      await review.locator('button:has-text("View Review")').click();

      // Raise concern
      await page.click('button:has-text("Raise Concern")');

      // Concern details
      await page.selectOption('select[name="concernType"]', 'rating_disagreement');
      await page.fill('textarea[name="concernDetails"]', 'I believe my contributions to the project were not fully reflected in the rating.');

      await page.click('button:has-text("Submit Concern")');

      await expect(page.locator('.toast-success')).toContainText('Concern submitted');
    });
  });

  test.describe('Performance Improvement Plan (PIP)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should create PIP for underperforming employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-reviews`);

      const employee = page.locator('table tbody tr:first-child');
      await employee.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Create PIP")');

      // PIP form
      await expect(page.locator('h2:has-text("Performance Improvement Plan")')).toBeVisible();

      // PIP duration
      await page.fill('input[name="pipDuration"]', '90');

      // Performance issues
      await page.fill('textarea[name="performanceIssues"]', '- Missed deadlines on 3 projects\n- Code quality below standards\n- Communication gaps with team');

      // Improvement goals
      await page.fill('textarea[name="improvementGoals"]', '1. Meet all deadlines\n2. Achieve 80%+ code review approval rate\n3. Attend daily standups regularly');

      // Action plan
      await page.fill('textarea[name="actionPlan"]', '- Weekly 1:1s with manager\n- Pair programming sessions\n- Time management training');

      // Success criteria
      await page.fill('textarea[name="successCriteria"]', 'All goals met for 2 consecutive months');

      // Review frequency
      await page.selectOption('select[name="reviewFrequency"]', 'weekly');

      // Create PIP
      await page.click('button:has-text("Create PIP")');

      await expect(page.locator('.toast-success')).toContainText('PIP created');
    });

    test('should track PIP progress', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/pip-tracking`);

      // Active PIPs
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      await page.click('table tbody tr:first-child button:has-text("View")');

      // PIP dashboard
      await expect(page.locator('[data-testid="pip-dashboard"]')).toBeVisible();

      // Progress timeline
      await expect(page.locator('text=Week 1')).toBeVisible();

      // Add weekly update
      await page.click('button:has-text("Add Update")');

      await page.fill('textarea[name="progressUpdate"]', 'Employee showing improvement. Met all deadlines this week.');

      await page.selectOption('select[name="progressStatus"]', 'on_track');

      await page.click('button:has-text("Save Update")');

      await expect(page.locator('.toast-success')).toContainText('Update added');
    });

    test('should close PIP successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/pip-tracking`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      await page.click('button:has-text("Close PIP")');

      // Closure details
      await page.selectOption('select[name="closureOutcome"]', 'successful');

      await page.fill('textarea[name="closureSummary"]', 'Employee successfully met all improvement goals. Performance back to expected standards.');

      await page.click('button:has-text("Close PIP")');

      await expect(page.locator('.toast-success')).toContainText('PIP closed successfully');
    });
  });

  test.describe('Promotions & Rewards', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view promotion recommendations', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/promotions`);

      // Promotion recommendations from reviews
      await expect(page.locator('h1:has-text("Promotion Recommendations")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should process promotion', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/promotions`);

      await page.click('table tbody tr:first-child button:has-text("Process")');

      // Promotion details
      await page.selectOption('select[name="newDesignation"]', { label: 'Senior Software Engineer' });
      await page.selectOption('select[name="newGrade"]', 'L5');

      await page.fill('input[name="effectiveDate"]', '2025-04-01');

      // Salary adjustment
      await page.fill('input[name="salaryIncreasePercentage"]', '15');

      // Justification
      await page.fill('textarea[name="justification"]', 'Consistent high performance. Ready for next level responsibilities.');

      // Approve promotion
      await page.click('button:has-text("Approve Promotion")');

      await expect(page.locator('.toast-success')).toContainText('Promotion approved');
    });

    test('should configure rewards and recognition', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/rewards`);

      await page.click('button:has-text("Add Reward")');

      // Reward details
      await page.selectOption('select[name="employeeId"]', { index: 1 });

      await page.selectOption('select[name="rewardType"]', 'spot_award');

      await page.fill('input[name="amount"]', '10000');

      await page.fill('textarea[name="reason"]', 'Exceptional performance in Q4. Led successful product launch.');

      await page.click('button:has-text("Grant Reward")');

      await expect(page.locator('.toast-success')).toContainText('Reward granted');
    });
  });

  test.describe('9-Box Grid & Talent Matrix', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view 9-box grid', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/9-box-grid`);

      // 9-box visualization
      await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

      // Grid cells
      await expect(page.locator('.grid-cell-high-high')).toBeVisible(); // Stars
      await expect(page.locator('.grid-cell-high-medium')).toBeVisible(); // High performers
      await expect(page.locator('.grid-cell-low-low')).toBeVisible(); // Action needed

      // Employee dots on grid
      await expect(page.locator('.employee-dot').first()).toBeVisible();
    });

    test('should view employee details from 9-box', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/9-box-grid`);

      // Click on employee
      await page.click('.employee-dot:first-child');

      // Employee details popup
      await expect(page.locator('[data-testid="employee-quick-view"]')).toBeVisible();
      await expect(page.locator('text=Performance Rating')).toBeVisible();
      await expect(page.locator('text=Potential Rating')).toBeVisible();
    });

    test('should export 9-box report', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/9-box-grid`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Report")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('9-box');
      expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx)$/);
    });
  });

  test.describe('Performance Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view performance distribution report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/performance/distribution`);

      // Rating distribution chart
      await expect(page.locator('[data-testid="rating-distribution-chart"]')).toBeVisible();

      // By department
      await page.selectOption('select[name="groupBy"]', 'department');

      await expect(page.locator('[data-testid="department-chart"]')).toBeVisible();
    });

    test('should generate performance trends report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/performance/trends`);

      // Select period
      await page.selectOption('select[name="period"]', 'last_3_years');

      await page.click('button:has-text("Generate Report")');

      // Trend chart
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

      // Year-over-year comparison
      await expect(page.locator('text=YoY Performance Change')).toBeVisible();
    });

    test('should export performance data', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/review-cycles`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Export cycle data
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Data")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('performance');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });
});
