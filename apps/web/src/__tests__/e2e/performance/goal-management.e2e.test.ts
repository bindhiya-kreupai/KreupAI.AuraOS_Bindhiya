/**
 * Goal Management E2E Tests
 * Plan D - Week 7, Day 36
 *
 * Tests goal setting, tracking, and achievement workflows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const MANAGER_EMAIL = 'manager@e2etest.com';
const MANAGER_PASSWORD = 'Test@1234';
const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';

let employeeToken: string;
let managerToken: string;
let hrToken: string;
let goalId: number;

test.describe('Goal Management E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Employee login
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      },
    });

    const empData = await empResponse.json();
    employeeToken = empData.data.accessToken;

    // Manager login
    const mgrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: MANAGER_EMAIL,
        password: MANAGER_PASSWORD,
      },
    });

    const mgrData = await mgrResponse.json();
    managerToken = mgrData.data.accessToken;

    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: HR_EMAIL,
        password: HR_PASSWORD,
      },
    });

    const hrData = await hrResponse.json();
    hrToken = hrData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test.describe('Goal Creation (Employee)', () => {
    test('should create individual goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      // Click Create Goal
      await page.click('button:has-text("Create Goal")');

      // Goal creation form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Create Goal")')).toBeVisible();

      // Goal details
      await page.fill('input[name="goalTitle"]', 'Improve API Response Time');
      await page.fill('textarea[name="description"]', 'Optimize backend APIs to reduce average response time by 30%');

      // Goal type
      await page.selectOption('select[name="goalType"]', 'individual');

      // Category
      await page.selectOption('select[name="category"]', 'technical');

      // Priority
      await page.selectOption('select[name="priority"]', 'high');

      // Timeline
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="targetDate"]', '2024-03-31');

      // Measurement criteria
      await page.fill('textarea[name="successCriteria"]', '- Reduce avg API response time from 500ms to 350ms\n- All critical APIs under 200ms');

      // Weight (for performance calculation)
      await page.fill('input[name="weight"]', '30');

      // Aligned to company objective (optional)
      await page.selectOption('select[name="alignedObjective"]', { index: 1 });

      // Submit
      await page.click('button[type="submit"]:has-text("Create Goal")');

      await expect(page.locator('.toast-success')).toContainText('Goal created');

      // Should appear in goals list
      await expect(page.locator('table tbody tr:has-text("Improve API Response Time")')).toBeVisible();
    });

    test('should create SMART goal with key results', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('button:has-text("Create Goal")');

      await page.fill('input[name="goalTitle"]', 'Increase Test Coverage');
      await page.fill('textarea[name="description"]', 'Improve overall test coverage for the platform');

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="targetDate"]', '2024-06-30');

      // Add key results (OKR style)
      await page.click('button:has-text("Add Key Result")');

      await page.fill('input[name="keyResult1"]', 'Achieve 80% unit test coverage');
      await page.fill('input[name="keyResult1Target"]', '80');

      await page.click('button:has-text("Add Key Result")');

      await page.fill('input[name="keyResult2"]', 'Implement E2E tests for all critical flows');
      await page.fill('input[name="keyResult2Target"]', '100');

      await page.click('button[type="submit"]:has-text("Create Goal")');

      await expect(page.locator('.toast-success')).toContainText('Goal created');
    });

    test('should create goal from template', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('button:has-text("Create from Template")');

      // Template selection dialog
      await expect(page.locator('text=Choose Goal Template')).toBeVisible();

      // Select template
      await page.click('.template-card:has-text("Code Quality Improvement")');

      // Template pre-fills form
      await expect(page.locator('input[name="goalTitle"]')).not.toBeEmpty();
      await expect(page.locator('textarea[name="description"]')).not.toBeEmpty();

      // Customize if needed
      await page.fill('input[name="targetDate"]', '2024-12-31');

      await page.click('button[type="submit"]:has-text("Create Goal")');

      await expect(page.locator('.toast-success')).toContainText('Goal created');
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('button:has-text("Create Goal")');

      // Try to submit without required fields
      await page.click('button[type="submit"]');

      // Validation errors
      await expect(page.locator('text=/Goal title is required/')).toBeVisible();
      await expect(page.locator('text=/Target date is required/')).toBeVisible();
    });

    test('should save goal as draft', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('button:has-text("Create Goal")');

      // Partial fill
      await page.fill('input[name="goalTitle"]', 'Learn New Technology');

      // Save draft
      await page.click('button:has-text("Save as Draft")');

      await expect(page.locator('.toast-success')).toContainText('Draft saved');

      // Should show with draft status
      await expect(page.locator('table tbody tr:has-text("Learn New Technology") .status-draft')).toBeVisible();
    });
  });

  test.describe('Goal Approval Workflow (Manager)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view pending goal approvals', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      // Pending approvals tab
      await page.click('button:has-text("Pending Approval")');

      // Should see goals awaiting approval
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should approve team member goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      await page.click('button:has-text("Pending Approval")');

      // View goal details
      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Goal review modal
      await expect(page.locator('[data-testid="goal-review"]')).toBeVisible();

      // Review details
      await expect(page.locator('text=Goal Title')).toBeVisible();
      await expect(page.locator('text=Success Criteria')).toBeVisible();

      // Approve
      await page.click('button:has-text("Approve")');

      // Optional feedback
      await page.fill('textarea[name="approvalComments"]', 'Great goal. Aligned with team objectives.');

      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('Goal approved');
    });

    test('should request changes to goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      await page.click('button:has-text("Pending Approval")');

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Request changes
      await page.click('button:has-text("Request Changes")');

      // Feedback required
      await page.fill('textarea[name="changeRequest"]', 'Please make the success criteria more specific and measurable. Add timeline milestones.');

      await page.click('button:has-text("Send Feedback")');

      await expect(page.locator('.toast-success')).toContainText('Feedback sent');
    });

    test('should reject goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      await page.click('button:has-text("Pending Approval")');

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Reject
      await page.click('button:has-text("Reject")');

      // Rejection reason
      await page.fill('textarea[name="rejectionReason"]', 'This goal is not aligned with team priorities for this quarter.');

      await page.click('button:has-text("Reject Goal")');

      await expect(page.locator('.toast-success')).toContainText('Goal rejected');
    });

    test('should cascade team goal to members', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      // Create team goal
      await page.click('button:has-text("Create Team Goal")');

      await page.fill('input[name="goalTitle"]', 'Reduce Customer Support Response Time');
      await page.fill('textarea[name="description"]', 'Team objective to improve customer satisfaction');

      await page.selectOption('select[name="goalType"]', 'team');

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="targetDate"]', '2024-06-30');

      // Cascade to team members
      await page.check('input[name="cascadeToTeam"]');

      // Select members
      await page.check('input[value="employee1"]');
      await page.check('input[value="employee2"]');

      await page.click('button[type="submit"]:has-text("Create Goal")');

      await expect(page.locator('.toast-success')).toContainText(/Goal created and cascaded/);
    });
  });

  test.describe('Goal Progress Tracking (Employee)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should update goal progress', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      // Click on active goal
      await page.click('table tbody tr:has-text("Active"):first-child');

      // Update progress
      await page.click('button:has-text("Update Progress")');

      // Progress update form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Update percentage
      await page.fill('input[name="progressPercentage"]', '45');

      // Progress note
      await page.fill('textarea[name="progressNote"]', 'Completed API optimization for 3 out of 7 critical endpoints. On track to meet Q1 target.');

      // Evidence/artifacts (optional)
      await page.fill('input[name="evidenceLink"]', 'https://jira.company.com/browse/PERF-123');

      // Update
      await page.click('button:has-text("Update Progress")');

      await expect(page.locator('.toast-success')).toContainText('Progress updated');

      // Progress bar should update
      await expect(page.locator('[data-testid="progress-bar"]')).toContainText('45%');
    });

    test('should add milestone to goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('table tbody tr:first-child');

      // Add milestone
      await page.click('button:has-text("Add Milestone")');

      await page.fill('input[name="milestoneName"]', 'Phase 1 Optimization Complete');
      await page.fill('input[name="targetDate"]', '2024-02-15');
      await page.fill('textarea[name="description"]', 'Optimize core APIs for read operations');

      await page.click('button:has-text("Add Milestone")');

      await expect(page.locator('.toast-success')).toContainText('Milestone added');

      // Milestone should appear in timeline
      await expect(page.locator('.milestone-item:has-text("Phase 1 Optimization Complete")')).toBeVisible();
    });

    test('should mark milestone as complete', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('table tbody tr:first-child');

      // Find pending milestone
      const milestone = page.locator('.milestone-item:has-text("Pending"):first-child');
      await milestone.locator('button:has-text("Mark Complete")').click();

      // Completion details
      await page.fill('input[name="completionDate"]', '2024-02-14');
      await page.fill('textarea[name="completionNotes"]', 'All core APIs now respond in under 200ms');

      await page.click('button:has-text("Mark as Complete")');

      await expect(page.locator('.toast-success')).toContainText('Milestone completed');
    });

    test('should view goal progress history', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('table tbody tr:first-child');

      // Progress tab
      await page.click('button:has-text("Progress History")');

      // Timeline of updates
      await expect(page.locator('[data-testid="progress-timeline"]')).toBeVisible();

      // Each update entry
      await expect(page.locator('.progress-entry').first()).toBeVisible();
    });

    test('should edit active goal', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.click('table tbody tr:first-child button[aria-label="Edit"]');

      // Edit form
      await page.fill('textarea[name="description"]', 'Updated description with more details');

      // Update target date
      await page.fill('input[name="targetDate"]', '2024-04-30');

      await page.click('button:has-text("Save Changes")');

      await expect(page.locator('.toast-success')).toContainText('Goal updated');
    });

    test('should mark goal as completed', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      const goal = page.locator('table tbody tr:has-text("Active"):first-child');
      await goal.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Mark as Completed")');

      // Completion form
      await expect(page.locator('text=Mark Goal as Completed')).toBeVisible();

      await page.fill('input[name="completionDate"]', '2024-03-30');

      // Achievement percentage
      await page.fill('input[name="achievementPercentage"]', '95');

      // Completion summary
      await page.fill('textarea[name="completionSummary"]', 'Successfully reduced API response time by 32%. All critical endpoints now respond in under 200ms.');

      // Evidence
      await page.fill('input[name="evidenceLink"]', 'https://grafana.company.com/dashboard/api-performance');

      await page.click('button:has-text("Mark as Completed")');

      await expect(page.locator('.toast-success')).toContainText('Goal marked as completed');
    });

    test('should abandon goal with reason', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      const goal = page.locator('table tbody tr:has-text("Active"):first-child');
      await goal.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Abandon Goal")');

      // Abandonment reason
      await page.selectOption('select[name="abandonmentReason"]', 'priorities_changed');
      await page.fill('textarea[name="abandonmentNotes"]', 'Project cancelled due to business priority shift');

      await page.click('button:has-text("Abandon Goal")');

      await expect(page.locator('.toast-success')).toContainText('Goal abandoned');
    });
  });

  test.describe('Goal Analytics & Reporting', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should view personal goal dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/goal-dashboard`);

      // Dashboard metrics
      await expect(page.locator('[data-testid="goal-dashboard"]')).toBeVisible();

      // KPIs
      await expect(page.locator('text=Active Goals')).toBeVisible();
      await expect(page.locator('text=Completed Goals')).toBeVisible();
      await expect(page.locator('text=Average Progress')).toBeVisible();
      await expect(page.locator('text=On Track')).toBeVisible();
      await expect(page.locator('text=At Risk')).toBeVisible();
    });

    test('should view goal completion chart', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/goal-dashboard`);

      // Completion trend chart
      await expect(page.locator('[data-testid="completion-chart"]')).toBeVisible();

      // Filter by time period
      await page.selectOption('select[name="period"]', 'last_6_months');

      await page.waitForTimeout(500);

      // Chart should update
      await expect(page.locator('[data-testid="completion-chart"]')).toBeVisible();
    });

    test('should filter goals by status', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      // Filter completed
      await page.selectOption('select[name="status"]', 'completed');

      await page.waitForTimeout(500);

      // All visible goals should be completed
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Completed');
      }
    });

    test('should filter goals by category', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      await page.selectOption('select[name="category"]', 'technical');

      await page.waitForTimeout(500);

      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should export goals to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/my-goals`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('goals');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });

  test.describe('Team Goals Management (Manager)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view team goals overview', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      // Team goals dashboard
      await expect(page.locator('h1:has-text("Team Goals")')).toBeVisible();

      // Metrics
      await expect(page.locator('text=Team Members')).toBeVisible();
      await expect(page.locator('text=Total Goals')).toBeVisible();
      await expect(page.locator('text=Average Progress')).toBeVisible();
    });

    test('should view individual member goals', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      // Team members tab
      await page.click('button:has-text("Team Members")');

      // Click on a team member
      await page.click('table tbody tr:first-child');

      // Member's goals
      await expect(page.locator('[data-testid="member-goals"]')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should identify at-risk goals', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/team-goals`);

      // At Risk tab
      await page.click('button:has-text("At Risk")');

      // Should show goals that are behind schedule
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Risk indicators
      await expect(page.locator('.risk-badge-high').first()).toBeVisible();
    });

    test('should generate team goals report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/performance/team-goals`);

      // Select quarter
      await page.selectOption('select[name="quarter"]', 'Q1');
      await page.selectOption('select[name="year"]', '2024');

      await page.click('button:has-text("Generate Report")');

      // Report should load
      await expect(page.locator('[data-testid="team-goals-report"]')).toBeVisible();

      // Metrics
      await expect(page.locator('text=Goal Completion Rate')).toBeVisible();
      await expect(page.locator('text=Average Achievement')).toBeVisible();
    });
  });

  test.describe('Company Objectives (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should create company objective', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/company-objectives`);

      await page.click('button:has-text("Create Objective")');

      // Objective form
      await page.fill('input[name="objectiveTitle"]', 'Increase Revenue by 30%');
      await page.fill('textarea[name="description"]', 'Company-wide objective for FY 2024');

      await page.selectOption('select[name="timeframe"]', 'annual');

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-12-31');

      // Key results
      await page.fill('input[name="keyResult1"]', 'Acquire 1000 new customers');
      await page.fill('input[name="keyResult2"]', 'Increase average deal size by 20%');

      await page.click('button[type="submit"]:has-text("Create Objective")');

      await expect(page.locator('.toast-success')).toContainText('Objective created');
    });

    test('should view objective alignment', async ({ page }) => {
      await page.goto(`${BASE_URL}/performance/objective-alignment`);

      // Alignment tree visualization
      await expect(page.locator('[data-testid="alignment-tree"]')).toBeVisible();

      // Company objectives at top
      await expect(page.locator('.objective-level-company').first()).toBeVisible();

      // Department objectives
      await expect(page.locator('.objective-level-department').first()).toBeVisible();

      // Individual goals
      await expect(page.locator('.objective-level-individual').first()).toBeVisible();
    });

    test('should track objective progress across organization', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/performance/objective-progress`);

      // Select objective
      await page.selectOption('select[name="objectiveId"]', { index: 1 });

      // Progress rollup from all aligned goals
      await expect(page.locator('text=Overall Progress')).toBeVisible();
      await expect(page.locator('text=Contributing Goals')).toBeVisible();
      await expect(page.locator('text=Departments Involved')).toBeVisible();
    });
  });
});
