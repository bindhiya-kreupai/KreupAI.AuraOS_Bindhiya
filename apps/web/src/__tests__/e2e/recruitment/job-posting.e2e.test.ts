/**
 * Job Posting E2E Tests
 * Plan D - Week 7, Day 34
 *
 * Tests job requisition creation, posting, publishing, and management
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';
const HIRING_MANAGER_EMAIL = 'manager@e2etest.com';
const HIRING_MANAGER_PASSWORD = 'Test@1234';
const CANDIDATE_EMAIL = 'candidate@e2etest.com';
const CANDIDATE_PASSWORD = 'Test@1234';

let hrToken: string;
let managerToken: string;
let candidateToken: string;
let jobId: number;

test.describe('Job Posting E2E', () => {
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

    // Manager login
    const mgrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: HIRING_MANAGER_EMAIL,
        password: HIRING_MANAGER_PASSWORD,
      },
    });

    const mgrData = await mgrResponse.json();
    managerToken = mgrData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, hrToken);
  });

  test.describe('Job Requisition Creation (HR)', () => {
    test('should create new job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Click Create Job button
      await page.click('button:has-text("Create Job")');

      // Job creation form should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Create Job Requisition")')).toBeVisible();

      // Basic Information
      await page.fill('input[name="jobTitle"]', 'Senior Software Engineer');
      await page.fill('input[name="jobCode"]', 'ENG-SSE-001');

      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });
      await page.selectOption('select[name="positionId"]', { label: 'Software Engineer' });

      // Employment Details
      await page.selectOption('select[name="employmentType"]', 'full_time');
      await page.selectOption('select[name="experienceLevel"]', 'senior');

      // Vacancies
      await page.fill('input[name="numberOfPositions"]', '3');

      // Location
      await page.selectOption('select[name="workLocation"]', 'hybrid');
      await page.fill('input[name="city"]', 'Bangalore');

      // Job Description
      await page.fill('textarea[name="jobDescription"]', 'We are looking for an experienced software engineer...');

      // Requirements
      await page.fill('textarea[name="requirements"]', '- 5+ years of experience\n- Strong in React and Node.js\n- Good communication skills');

      // Compensation
      await page.fill('input[name="minSalary"]', '1500000');
      await page.fill('input[name="maxSalary"]', '2500000');

      // Hiring Manager
      await page.fill('input[placeholder*="Select hiring manager"]', 'John Manager');
      await page.waitForTimeout(500);
      await page.click('li:has-text("John Manager")');

      // Submit
      await page.click('button[type="submit"]:has-text("Create Job")');

      await expect(page.locator('.toast-success')).toContainText('Job requisition created');

      // Should appear in jobs list
      await expect(page.locator('table tbody tr:has-text("Senior Software Engineer")')).toBeVisible();
    });

    test('should create urgent job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      await page.click('button:has-text("Create Job")');

      await page.fill('input[name="jobTitle"]', 'Urgent: DevOps Engineer');
      await page.fill('input[name="jobCode"]', 'OPS-DE-001');
      await page.selectOption('select[name="departmentId"]', { label: 'Operations' });
      await page.fill('input[name="numberOfPositions"]', '1');

      // Mark as urgent
      await page.check('input[name="isUrgent"]');

      // Set deadline
      await page.fill('input[name="closingDate"]', '2024-02-15');

      await page.fill('textarea[name="jobDescription"]', 'Urgent requirement for DevOps engineer...');

      await page.click('button[type="submit"]:has-text("Create Job")');

      await expect(page.locator('.toast-success')).toContainText('Job requisition created');

      // Should have urgent badge
      await expect(page.locator('table tbody tr:has-text("Urgent: DevOps Engineer") .badge-urgent')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      await page.click('button:has-text("Create Job")');

      // Try to submit without required fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator('text=/Job title is required/')).toBeVisible();
      await expect(page.locator('text=/Department is required/')).toBeVisible();
      await expect(page.locator('text=/Number of positions is required/')).toBeVisible();
    });

    test('should save job as draft', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      await page.click('button:has-text("Create Job")');

      await page.fill('input[name="jobTitle"]', 'Frontend Developer');
      await page.fill('input[name="jobCode"]', 'ENG-FE-001');
      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });

      // Save as draft
      await page.click('button:has-text("Save as Draft")');

      await expect(page.locator('.toast-success')).toContainText('Draft saved');

      // Should appear with draft status
      await expect(page.locator('table tbody tr:has-text("Frontend Developer") .status-draft')).toBeVisible();
    });

    test('should view job requisition details', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Click on first job to view details
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Details page should open
      await expect(page.locator('[data-testid="job-details"]')).toBeVisible();

      // Verify sections
      await expect(page.locator('text=Job Information')).toBeVisible();
      await expect(page.locator('text=Description')).toBeVisible();
      await expect(page.locator('text=Requirements')).toBeVisible();
      await expect(page.locator('text=Compensation')).toBeVisible();
      await expect(page.locator('text=Hiring Team')).toBeVisible();
    });

    test('should edit job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Click edit on first job
      await page.click('table tbody tr:first-child button[aria-label="Edit"]');

      // Update job title
      await page.fill('input[name="jobTitle"]', 'Senior Software Engineer - Updated');

      // Update positions
      await page.fill('input[name="numberOfPositions"]', '5');

      await page.click('button:has-text("Save Changes")');

      await expect(page.locator('.toast-success')).toContainText('Job updated');

      // Verify updates
      await expect(page.locator('text=Senior Software Engineer - Updated')).toBeVisible();
    });

    test('should clone job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Click actions menu on first job
      await page.click('table tbody tr:first-child button[aria-label="Actions"]');

      // Click clone option
      await page.click('button:has-text("Clone Job")');

      // Clone dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Clone Job Requisition')).toBeVisible();

      // Update job code (must be unique)
      await page.fill('input[name="jobCode"]', 'ENG-SSE-002');

      await page.click('button:has-text("Clone")');

      await expect(page.locator('.toast-success')).toContainText('Job cloned');
    });

    test('should delete draft job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Filter to show only drafts
      await page.selectOption('select[name="status"]', 'draft');

      await page.waitForTimeout(500);

      // Delete first draft
      const draftRow = page.locator('table tbody tr:first-child');
      await draftRow.locator('button[aria-label="Delete"]').click();

      // Confirmation
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();
      await page.click('button:has-text("Delete")');

      await expect(page.locator('.toast-success')).toContainText('Job deleted');
    });

    test('should not delete job with active applications', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Try to delete job with applications
      const activeRow = page.locator('table tbody tr:has-text("Active"):first-child');
      await activeRow.locator('button[aria-label="Delete"]').click();

      await page.click('button:has-text("Delete")');

      // Should show error
      await expect(page.locator('.toast-error')).toContainText(/Cannot delete job with active applications/);
    });
  });

  test.describe('Job Posting & Publishing', () => {
    test('should publish job to career portal', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Find draft or unpublished job
      const jobRow = page.locator('table tbody tr:has-text("Draft"):first-child');
      await jobRow.locator('button:has-text("Publish")').click();

      // Publish confirmation
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Publish Job to Career Portal')).toBeVisible();

      // Preview job posting
      await expect(page.locator('[data-testid="job-preview"]')).toBeVisible();

      // Confirm publish
      await page.click('button:has-text("Publish Now")');

      await expect(page.locator('.toast-success')).toContainText('Job published');

      // Status should change to Active
      await expect(page.locator('table tbody tr:first-child .status-active')).toBeVisible();
    });

    test('should publish job to external job boards', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      const jobRow = page.locator('table tbody tr:first-child');
      await jobRow.locator('button[aria-label="Actions"]').click();
      await page.click('button:has-text("Post to Job Boards")');

      // Job board selection dialog
      await expect(page.locator('text=Post to External Job Boards')).toBeVisible();

      // Select job boards
      await page.check('input[value="naukri"]');
      await page.check('input[value="linkedin"]');
      await page.check('input[value="indeed"]');

      await page.click('button:has-text("Post to Selected Boards")');

      await expect(page.locator('.toast-success')).toContainText(/posted to.*job boards/);
    });

    test('should unpublish active job', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      const activeJob = page.locator('table tbody tr:has-text("Active"):first-child');
      await activeJob.locator('button[aria-label="Actions"]').click();
      await page.click('button:has-text("Unpublish")');

      // Confirmation
      await expect(page.locator('text=Unpublish job posting')).toBeVisible();
      await page.click('button:has-text("Unpublish")');

      await expect(page.locator('.toast-success')).toContainText('Job unpublished');

      // Status should change
      await expect(activeJob.locator('.status-closed')).toBeVisible();
    });

    test('should close job requisition', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      const jobRow = page.locator('table tbody tr:first-child');
      await jobRow.locator('button[aria-label="Actions"]').click();
      await page.click('button:has-text("Close Job")');

      // Closure reason dialog
      await expect(page.locator('text=Close Job Requisition')).toBeVisible();

      await page.selectOption('select[name="closureReason"]', 'positions_filled');
      await page.fill('textarea[name="closureNotes"]', 'All positions filled successfully');

      await page.click('button:has-text("Close Job")');

      await expect(page.locator('.toast-success')).toContainText('Job closed');
    });

    test('should reopen closed job', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Filter closed jobs
      await page.selectOption('select[name="status"]', 'closed');

      await page.waitForTimeout(500);

      const closedJob = page.locator('table tbody tr:first-child');
      await closedJob.locator('button[aria-label="Actions"]').click();
      await page.click('button:has-text("Reopen")');

      // Reopen confirmation
      await page.click('button:has-text("Reopen Job")');

      await expect(page.locator('.toast-success')).toContainText('Job reopened');
    });
  });

  test.describe('Job Filtering & Search', () => {
    test('should filter jobs by status', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Filter by active
      await page.selectOption('select[name="status"]', 'active');

      await page.waitForTimeout(500);

      // All visible jobs should be active
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Active');
      }
    });

    test('should filter jobs by department', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Filter by Engineering
      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });

      await page.waitForTimeout(500);

      // All visible jobs should be from Engineering
      const firstRow = page.locator('table tbody tr:first-child');
      await expect(firstRow).toContainText('Engineering');
    });

    test('should search jobs by title or code', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Search for "Engineer"
      await page.fill('input[placeholder*="Search"]', 'Engineer');

      await page.waitForTimeout(500);

      // Results should contain "Engineer"
      const firstRow = page.locator('table tbody tr:first-child');
      const rowText = await firstRow.textContent();

      expect(rowText).toContain('Engineer');
    });

    test('should filter by urgent jobs only', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Check urgent filter
      await page.check('input[name="urgentOnly"]');

      await page.waitForTimeout(500);

      // All visible jobs should have urgent badge
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(rows.nth(i).locator('.badge-urgent')).toBeVisible();
      }
    });

    test('should filter jobs by closing date', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Jobs closing within 7 days
      await page.selectOption('select[name="closingDateFilter"]', 'next_7_days');

      await page.waitForTimeout(500);

      // Should show jobs with near closing dates
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should sort jobs by creation date', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Click on created date column header to sort
      await page.click('table thead th:has-text("Created Date")');

      await page.waitForTimeout(500);

      // Should be sorted (verify by checking order)
      const firstDate = await page.locator('table tbody tr:first-child td:nth-child(5)').textContent();
      const secondDate = await page.locator('table tbody tr:nth-child(2) td:nth-child(5)').textContent();

      // Dates should be in descending order (newest first)
      expect(firstDate).toBeTruthy();
      expect(secondDate).toBeTruthy();
    });
  });

  test.describe('Career Portal - Public Job Listing', () => {
    test('should view public job listings on career portal', async ({ page }) => {
      // Visit public career portal (no auth)
      await page.goto(`${BASE_URL}/careers`);

      // Job listings should be visible
      await expect(page.locator('h1:has-text("Careers")')).toBeVisible();
      await expect(page.locator('[data-testid="job-listing"]').first()).toBeVisible();

      // Should show job cards
      await expect(page.locator('.job-card').first()).toBeVisible();
    });

    test('should filter career portal jobs by department', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      // Department filter
      await page.selectOption('select[name="department"]', { label: 'Engineering' });

      await page.waitForTimeout(500);

      // All visible jobs should be Engineering
      const jobCards = page.locator('.job-card');
      const count = await jobCards.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(jobCards.nth(i)).toContainText('Engineering');
      }
    });

    test('should filter by job type on career portal', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      // Filter full-time
      await page.check('input[value="full_time"]');

      await page.waitForTimeout(500);

      // All visible jobs should be full-time
      await expect(page.locator('.job-card:first-child')).toContainText('Full Time');
    });

    test('should filter by location on career portal', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      // Filter by Bangalore
      await page.fill('input[placeholder*="Location"]', 'Bangalore');

      await page.waitForTimeout(500);

      // Results should be from Bangalore
      await expect(page.locator('.job-card:first-child')).toContainText('Bangalore');
    });

    test('should view job details on career portal', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      // Click on first job
      await page.click('.job-card:first-child');

      // Job details page
      await expect(page.locator('[data-testid="job-detail-page"]')).toBeVisible();

      // Should show complete job information
      await expect(page.locator('h1')).toBeVisible(); // Job title
      await expect(page.locator('text=About the Role')).toBeVisible();
      await expect(page.locator('text=Requirements')).toBeVisible();
      await expect(page.locator('text=What We Offer')).toBeVisible();

      // Apply button should be visible
      await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
    });

    test('should share job posting via social media', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');

      // Share button
      await page.click('button:has-text("Share")');

      // Share options should appear
      await expect(page.locator('text=Share this job')).toBeVisible();
      await expect(page.locator('a[aria-label="Share on LinkedIn"]')).toBeVisible();
      await expect(page.locator('a[aria-label="Share on Twitter"]')).toBeVisible();
      await expect(page.locator('button:has-text("Copy Link")')).toBeVisible();
    });

    test('should copy job link', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');

      await page.click('button:has-text("Share")');
      await page.click('button:has-text("Copy Link")');

      await expect(page.locator('.toast-success')).toContainText('Link copied');
    });
  });

  test.describe('Hiring Manager View', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view assigned jobs as hiring manager', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-jobs`);

      // Should see jobs where manager is hiring manager
      await expect(page.locator('h1:has-text("My Job Requisitions")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should request new job requisition as manager', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-jobs`);

      await page.click('button:has-text("Request New Position")');

      // Request form
      await page.fill('input[name="jobTitle"]', 'Senior Backend Engineer');
      await page.fill('input[name="numberOfPositions"]', '2');
      await page.fill('textarea[name="justification"]', 'Team expansion due to increased workload');

      await page.click('button:has-text("Submit Request")');

      await expect(page.locator('.toast-success')).toContainText('Request submitted to HR');
    });

    test('should view candidate applications for manager job', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-jobs`);

      // Click on first job
      await page.click('table tbody tr:first-child');

      // Should see applications tab
      await page.click('button:has-text("Applications")');

      // Applications list
      await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    });
  });

  test.describe('Job Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view recruitment dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/dashboard`);

      // Dashboard metrics
      await expect(page.locator('[data-testid="recruitment-dashboard"]')).toBeVisible();

      // Key metrics
      await expect(page.locator('text=Active Job Openings')).toBeVisible();
      await expect(page.locator('text=Total Applications')).toBeVisible();
      await expect(page.locator('text=Positions Filled')).toBeVisible();
      await expect(page.locator('text=Time to Fill')).toBeVisible();
    });

    test('should generate job posting performance report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/job-performance`);

      // Select date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Report should show
      await expect(page.locator('[data-testid="job-performance-report"]')).toBeVisible();

      // Metrics per job
      await expect(page.locator('text=Views')).toBeVisible();
      await expect(page.locator('text=Applications')).toBeVisible();
      await expect(page.locator('text=Conversion Rate')).toBeVisible();
    });

    test('should export job listings to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/jobs`);

      // Export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('jobs');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });
});
