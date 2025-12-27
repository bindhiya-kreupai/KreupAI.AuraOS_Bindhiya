/**
 * Exit Management & Offboarding E2E Tests
 * Plan D - Week 7, Day 39
 *
 * Tests resignation, exit process, clearance, and offboarding workflows
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

test.describe('Exit Management E2E', () => {
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

    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: HR_EMAIL, password: HR_PASSWORD },
    });
    hrToken = (await hrResponse.json()).data.accessToken;
  });

  test.describe('Resignation Submission (Employee)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should submit resignation', async ({ page }) => {
      await page.goto(`${BASE_URL}/my-profile`);

      await page.click('button:has-text("Submit Resignation")');

      // Resignation form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Submit Resignation")')).toBeVisible();

      // Resignation details
      await page.fill('input[name="resignationDate"]', '2024-02-01');

      // Calculate last working day based on notice period
      await expect(page.locator('text=/Last Working Day:/i')).toBeVisible();

      // Reason for leaving
      await page.selectOption('select[name="resignationReason"]', 'better_opportunity');

      // Detailed reason (optional)
      await page.fill('textarea[name="detailedReason"]', 'Accepted position with better career growth opportunities');

      // Serving notice period
      await page.check('input[name="servingNoticePeriod"]');

      // Request early release (optional)
      // await page.check('input[name="requestEarlyRelease"]');
      // await page.fill('input[name="requestedLastDay"]', '2024-02-15');

      // Submit resignation
      await page.click('button:has-text("Submit Resignation")');

      // Confirmation dialog
      await expect(page.locator('text=Are you sure')).toBeVisible();
      await page.click('button:has-text("Confirm Resignation")');

      await expect(page.locator('.toast-success')).toContainText('Resignation submitted');
    });

    test('should view resignation status', async ({ page }) => {
      await page.goto(`${BASE_URL}/my-profile/resignation`);

      // Resignation details
      await expect(page.locator('[data-testid="resignation-status"]')).toBeVisible();

      // Status information
      await expect(page.locator('text=Resignation Date')).toBeVisible();
      await expect(page.locator('text=Last Working Day')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
      await expect(page.locator('text=Notice Period')).toBeVisible();
    });

    test('should withdraw resignation before acceptance', async ({ page }) => {
      await page.goto(`${BASE_URL}/my-profile/resignation`);

      // Withdraw button (only if not accepted)
      await page.click('button:has-text("Withdraw Resignation")');

      // Confirmation
      await expect(page.locator('text=Withdraw your resignation')).toBeVisible();

      await page.fill('textarea[name="withdrawalReason"]', 'Received counter offer from current company');

      await page.click('button:has-text("Confirm Withdrawal")');

      await expect(page.locator('.toast-success')).toContainText('Resignation withdrawn');
    });

    test('should view exit checklist', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/my-checklist`);

      // Exit checklist
      await expect(page.locator('[data-testid="exit-checklist"]')).toBeVisible();

      // Checklist items
      await expect(page.locator('.checklist-item').first()).toBeVisible();

      // Categories
      await expect(page.locator('text=Knowledge Transfer')).toBeVisible();
      await expect(page.locator('text=Asset Return')).toBeVisible();
      await expect(page.locator('text=Documentation')).toBeVisible();
    });

    test('should complete checklist items', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/my-checklist`);

      // Mark item as complete
      const item = page.locator('.checklist-item:first-child');
      await item.locator('button:has-text("Mark Complete")').click();

      // Upload proof if required
      if (await page.locator('text=Upload proof').isVisible()) {
        // Handle file upload
        await page.fill('textarea[name="completionNotes"]', 'Completed knowledge transfer session');
        await page.click('button:has-text("Submit")');
      }

      await expect(page.locator('.toast-success')).toContainText('Item marked as complete');
    });
  });

  test.describe('Resignation Approval (Manager)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view pending resignations', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/resignations`);

      // Pending resignations
      await expect(page.locator('h1:has-text("Team Resignations")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should accept resignation', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/resignations`);

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Resignation review
      await expect(page.locator('[data-testid="resignation-review"]')).toBeVisible();

      // View resignation details
      await expect(page.locator('text=Resignation Reason')).toBeVisible();

      // Accept resignation
      await page.click('button:has-text("Accept")');

      // Accept confirmation
      await page.fill('input[name="lastWorkingDay"]', '2024-02-28');

      await page.fill('textarea[name="managerComments"]', 'Resignation accepted. Best wishes for future endeavors.');

      await page.click('button:has-text("Confirm Acceptance")');

      await expect(page.locator('.toast-success')).toContainText('Resignation accepted');
    });

    test('should retain employee with counter offer', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/resignations`);

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Offer retention
      await page.click('button:has-text("Retention Attempt")');

      // Counter offer details
      await page.selectOption('select[name="retentionType"]', 'compensation');

      await page.fill('input[name="proposedSalaryIncrease"]', '20');

      await page.fill('textarea[name="retentionOffer"]', 'Proposed 20% salary increase and promotion to Senior Engineer');

      await page.click('button:has-text("Submit Counter Offer")');

      await expect(page.locator('.toast-success')).toContainText('Counter offer submitted');
    });

    test('should initiate knowledge transfer', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/resignations`);

      await page.click('table tbody tr:first-child');

      // Knowledge transfer tab
      await page.click('button:has-text("Knowledge Transfer")');

      // Create KT plan
      await page.click('button:has-text("Create KT Plan")');

      // KT plan form
      await page.fill('textarea[name="criticalKnowledge"]', '- Customer onboarding process\n- API integration details\n- Database schema documentation');

      // Assign replacement
      await page.fill('input[placeholder*="Select employee"]', 'John');
      await page.waitForTimeout(500);
      await page.click('li:has-text("John Replacement")');

      // KT schedule
      await page.fill('input[name="ktStartDate"]', '2024-02-05');
      await page.fill('input[name="ktEndDate"]', '2024-02-25');

      await page.click('button:has-text("Create Plan")');

      await expect(page.locator('.toast-success')).toContainText('KT plan created');
    });
  });

  test.describe('Exit Interview (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should schedule exit interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/exit-interviews`);

      await page.click('table tbody tr:first-child button:has-text("Schedule")');

      // Schedule form
      await page.fill('input[name="interviewDate"]', '2024-02-20');
      await page.fill('input[name="startTime"]', '14:00');
      await page.fill('input[name="endTime"]', '15:00');

      await page.selectOption('select[name="mode"]', 'video_call');

      await page.fill('input[name="meetingLink"]', 'https://meet.google.com/exit-interview');

      await page.click('button:has-text("Schedule Interview")');

      await expect(page.locator('.toast-success')).toContainText('Exit interview scheduled');
    });

    test('should conduct exit interview', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/exit-interviews`);

      await page.click('table tbody tr:first-child button:has-text("Conduct Interview")');

      // Exit interview questionnaire
      await expect(page.locator('[data-testid="exit-interview-form"]')).toBeVisible();

      // Reason for leaving
      await page.selectOption('select[name="primaryReason"]', 'career_growth');

      // Detailed feedback
      await page.fill('textarea[name="reasonDetails"]', 'Limited opportunities for advancement in current role');

      // Satisfaction ratings
      await page.selectOption('select[name="jobSatisfaction"]', '3');
      await page.selectOption('select[name="managerRelationship"]', '4');
      await page.selectOption('select[name="workEnvironment"]', '4');
      await page.selectOption('select[name="compensationSatisfaction"]', '3');
      await page.selectOption('select[name="workLifeBalance"]', '4');

      // What did you like most
      await page.fill('textarea[name="likedMost"]', 'Great team culture and supportive colleagues');

      // Areas for improvement
      await page.fill('textarea[name="areasForImprovement"]', 'Better career progression paths and learning opportunities');

      // Would you recommend company
      await page.selectOption('select[name="recommendCompany"]', 'yes');

      // Would you consider rejoining
      await page.selectOption('select[name="considerRejoining"]', 'maybe');

      // Any other feedback
      await page.fill('textarea[name="additionalFeedback"]', 'Overall positive experience. Thank you for the opportunity.');

      // Submit interview
      await page.click('button:has-text("Submit Interview")');

      await expect(page.locator('.toast-success')).toContainText('Exit interview completed');
    });

    test('should view exit interview insights', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/offboarding/exit-insights`);

      // Exit reasons dashboard
      await expect(page.locator('[data-testid="exit-insights-dashboard"]')).toBeVisible();

      // Top exit reasons
      await expect(page.locator('text=Top Reasons for Leaving')).toBeVisible();

      // Trend chart
      await expect(page.locator('[data-testid="exit-trends-chart"]')).toBeVisible();

      // Department-wise analysis
      await expect(page.locator('text=Department-wise Attrition')).toBeVisible();
    });
  });

  test.describe('Full & Final Settlement', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should calculate F&F settlement', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/settlements`);

      await page.click('table tbody tr:first-child button:has-text("Calculate")');

      // F&F calculation form
      await expect(page.locator('[data-testid="fnf-calculator"]')).toBeVisible();

      // Last working day
      await page.fill('input[name="lastWorkingDay"]', '2024-02-28');

      // Calculate button
      await page.click('button:has-text("Calculate Settlement")');

      // Settlement breakdown
      await expect(page.locator('[data-testid="settlement-breakdown"]')).toBeVisible();

      // Components
      await expect(page.locator('text=Salary for Working Days')).toBeVisible();
      await expect(page.locator('text=Earned Leave Encashment')).toBeVisible();
      await expect(page.locator('text=Bonus (Prorated)')).toBeVisible();
      await expect(page.locator('text=Notice Period Recovery')).toBeVisible();
      await expect(page.locator('text=Net Payable')).toBeVisible();
    });

    test('should approve F&F settlement', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/settlements`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Approve settlement
      await page.click('button:has-text("Approve Settlement")');

      // Payment details
      await page.fill('input[name="paymentDate"]', '2024-03-05');

      await page.fill('textarea[name="approvalComments"]', 'Settlement approved. Payment will be processed on mentioned date.');

      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('Settlement approved');
    });

    test('should generate F&F letter', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/settlements`);

      await page.click('table tbody tr:first-child');

      // Generate letter
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Generate F&F Letter")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('settlement');
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('Asset & Access Clearance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should manage asset return', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/clearances`);

      await page.click('table tbody tr:first-child button:has-text("Manage Clearance")');

      // Assets tab
      await page.click('button:has-text("Assets")');

      // List of assigned assets
      await expect(page.locator('[data-testid="assigned-assets"]')).toBeVisible();

      // Mark laptop as returned
      const laptop = page.locator('[data-asset-type="laptop"]');
      await laptop.locator('button:has-text("Mark Returned")').click();

      await page.fill('input[name="returnDate"]', '2024-02-27');
      await page.selectOption('select[name="condition"]', 'good');
      await page.fill('textarea[name="notes"]', 'Laptop returned in good condition');

      await page.click('button:has-text("Confirm Return")');

      await expect(page.locator('.toast-success')).toContainText('Asset return recorded');
    });

    test('should process system access revocation', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/clearances`);

      await page.click('table tbody tr:first-child button:has-text("Manage Clearance")');

      // Access tab
      await page.click('button:has-text("System Access")');

      // List of active access
      await expect(page.locator('[data-testid="active-access"]')).toBeVisible();

      // Revoke all access
      await page.click('button:has-text("Revoke All Access")');

      // Confirmation
      await page.fill('input[name="revocationDate"]', '2024-02-28');

      await page.click('button:has-text("Confirm Revocation")');

      await expect(page.locator('.toast-success')).toContainText('Access revoked');
    });

    test('should complete clearance checklist', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/clearances`);

      await page.click('table tbody tr:first-child button:has-text("Manage Clearance")');

      // Clearance checklist
      await expect(page.locator('[data-testid="clearance-checklist"]')).toBeVisible();

      // HR clearance
      await page.check('input[name="hr-clearance"]');

      // IT clearance
      await page.check('input[name="it-clearance"]');

      // Finance clearance
      await page.check('input[name="finance-clearance"]');

      // Admin clearance
      await page.check('input[name="admin-clearance"]');

      // Complete clearance
      await page.click('button:has-text("Complete Clearance")');

      await expect(page.locator('.toast-success')).toContainText('Clearance completed');
    });
  });

  test.describe('Experience & Relieving Letters', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should generate relieving letter', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/letters`);

      await page.click('table tbody tr:first-child button:has-text("Generate Relieving Letter")');

      // Letter details
      await page.fill('input[name="lastWorkingDay"]', '2024-02-28');

      // Letter content preview
      await expect(page.locator('[data-testid="letter-preview"]')).toBeVisible();

      // Generate
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Generate & Download")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('relieving');
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should generate experience certificate', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/letters`);

      await page.click('table tbody tr:first-child button:has-text("Generate Experience Certificate")');

      // Certificate details
      await page.fill('input[name="joiningDate"]', '2021-03-01');
      await page.fill('input[name="relievingDate"]', '2024-02-28');

      await page.fill('input[name="designation"]', 'Software Engineer');

      // Generate
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Generate Certificate")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('experience');
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('Offboarding Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view attrition dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/offboarding/attrition`);

      // Attrition metrics
      await expect(page.locator('[data-testid="attrition-dashboard"]')).toBeVisible();

      // KPIs
      await expect(page.locator('text=Attrition Rate')).toBeVisible();
      await expect(page.locator('text=Voluntary Exits')).toBeVisible();
      await expect(page.locator('text=Involuntary Exits')).toBeVisible();
      await expect(page.locator('text=Average Tenure')).toBeVisible();
    });

    test('should view department-wise attrition', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/offboarding/attrition`);

      // Department breakdown
      await page.selectOption('select[name="groupBy"]', 'department');

      // Chart should update
      await expect(page.locator('[data-testid="department-attrition-chart"]')).toBeVisible();
    });

    test('should generate resignation trends report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/offboarding/trends`);

      // Select time period
      await page.selectOption('select[name="period"]', 'last_12_months');

      await page.click('button:has-text("Generate Report")');

      // Trends visualization
      await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();

      // Month-over-month data
      await expect(page.locator('text=Monthly Resignations')).toBeVisible();
    });

    test('should export offboarding data', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/dashboard`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Data")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('offboarding');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });

  test.describe('Rehire Eligibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should mark employee as eligible for rehire', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/clearances`);

      await page.click('table tbody tr:first-child button:has-text("Manage Clearance")');

      // Rehire eligibility section
      await page.click('button:has-text("Rehire Eligibility")');

      // Mark as eligible
      await page.check('input[name="eligibleForRehire"]');

      await page.fill('textarea[name="rehireNotes"]', 'Excellent performer. Left for personal reasons. Eligible for rehire.');

      await page.click('button:has-text("Save Eligibility")');

      await expect(page.locator('.toast-success')).toContainText('Eligibility status saved');
    });

    test('should view alumni directory', async ({ page }) => {
      await page.goto(`${BASE_URL}/offboarding/alumni`);

      // Alumni list
      await expect(page.locator('h1:has-text("Alumni Directory")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Filter by rehire eligible
      await page.check('input[name="rehireEligible"]');

      await page.waitForTimeout(500);

      // Should show only eligible employees
      await expect(page.locator('.badge-eligible').first()).toBeVisible();
    });
  });
});
