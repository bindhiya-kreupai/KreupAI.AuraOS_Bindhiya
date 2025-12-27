/**
 * Candidate Management E2E Tests
 * Plan D - Week 7, Day 34
 *
 * Tests candidate applications, tracking, evaluation, and pipeline management
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';
const HIRING_MANAGER_EMAIL = 'manager@e2etest.com';
const HIRING_MANAGER_PASSWORD = 'Test@1234';

let hrToken: string;
let managerToken: string;
let candidateId: number;
let applicationId: number;

test.describe('Candidate Management E2E', () => {
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

  test.describe('Job Application (Public)', () => {
    test('should submit job application via career portal', async ({ page }) => {
      // No authentication - public application
      await page.goto(`${BASE_URL}/careers`);

      // Click on a job
      await page.click('.job-card:first-child');

      // Click Apply Now
      await page.click('button:has-text("Apply Now")');

      // Application form
      await expect(page.locator('[data-testid="application-form"]')).toBeVisible();

      // Personal Information
      await page.fill('input[name="firstName"]', 'Jane');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="email"]', 'jane.doe@example.com');
      await page.fill('input[name="phone"]', '+91-9876543210');

      // Current Details
      await page.fill('input[name="currentCompany"]', 'Tech Corp');
      await page.fill('input[name="currentDesignation"]', 'Software Engineer');
      await page.fill('input[name="totalExperience"]', '5');

      // Education
      await page.selectOption('select[name="highestQualification"]', 'bachelors');
      await page.fill('input[name="fieldOfStudy"]', 'Computer Science');

      // Upload Resume
      const resumeInput = page.locator('input[type="file"][name="resume"]');
      await resumeInput.setInputFiles(path.join(__dirname, 'test-assets', 'resume.pdf'));

      // Cover Letter (optional)
      await page.fill('textarea[name="coverLetter"]', 'I am excited to apply for this position...');

      // Expected Salary
      await page.fill('input[name="expectedSalary"]', '2000000');
      await page.fill('input[name="noticePeriod"]', '30');

      // Source
      await page.selectOption('select[name="source"]', 'job_portal');

      // Agree to terms
      await page.check('input[name="agreeToTerms"]');

      // Submit Application
      await page.click('button[type="submit"]:has-text("Submit Application")');

      // Success message
      await expect(page.locator('.toast-success')).toContainText('Application submitted successfully');

      // Confirmation page
      await expect(page.locator('text=Thank you for your application')).toBeVisible();
      await expect(page.locator('text=/Application ID:.*/')).toBeVisible();
    });

    test('should validate application form fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');
      await page.click('button:has-text("Apply Now")');

      // Try to submit without required fields
      await page.click('button[type="submit"]');

      // Validation errors
      await expect(page.locator('text=/First name is required/')).toBeVisible();
      await expect(page.locator('text=/Email is required/')).toBeVisible();
      await expect(page.locator('text=/Phone is required/')).toBeVisible();
      await expect(page.locator('text=/Resume is required/')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');
      await page.click('button:has-text("Apply Now")');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/Invalid email format/')).toBeVisible();
    });

    test('should prevent duplicate application', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');
      await page.click('button:has-text("Apply Now")');

      // Fill with email that already applied
      await page.fill('input[name="firstName"]', 'Jane');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="email"]', 'existing@example.com'); // Already applied
      await page.fill('input[name="phone"]', '+91-9876543210');

      const resumeInput = page.locator('input[type="file"][name="resume"]');
      await resumeInput.setInputFiles(path.join(__dirname, 'test-assets', 'resume.pdf'));

      await page.check('input[name="agreeToTerms"]');
      await page.click('button[type="submit"]');

      // Should show duplicate error
      await expect(page.locator('text=/already applied for this position/')).toBeVisible();
    });

    test('should save application as draft', async ({ page }) => {
      await page.goto(`${BASE_URL}/careers`);

      await page.click('.job-card:first-child');
      await page.click('button:has-text("Apply Now")');

      // Partial fill
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Smith');
      await page.fill('input[name="email"]', 'john.smith@example.com');

      // Save draft
      await page.click('button:has-text("Save Draft")');

      await expect(page.locator('.toast-success')).toContainText('Draft saved');
    });
  });

  test.describe('Candidate List & Search (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view all candidates', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Candidates list
      await expect(page.locator('h1:has-text("Candidates")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Table columns
      await expect(page.locator('table thead th:has-text("Name")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Applied For")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Status")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Applied Date")')).toBeVisible();
    });

    test('should search candidates by name', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.fill('input[placeholder*="Search"]', 'Jane');

      await page.waitForTimeout(500);

      // Results should contain Jane
      const firstRow = page.locator('table tbody tr:first-child');
      await expect(firstRow).toContainText('Jane');
    });

    test('should filter candidates by job', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Filter by job
      await page.selectOption('select[name="jobId"]', { index: 1 });

      await page.waitForTimeout(500);

      // All candidates should be for selected job
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should filter candidates by status', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Filter by status
      await page.selectOption('select[name="status"]', 'in_review');

      await page.waitForTimeout(500);

      // All visible candidates should be in review
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('In Review');
      }
    });

    test('should filter candidates by source', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.selectOption('select[name="source"]', 'referral');

      await page.waitForTimeout(500);

      // Should show only referral candidates
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should filter candidates by experience range', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.fill('input[name="minExperience"]', '3');
      await page.fill('input[name="maxExperience"]', '7');

      await page.click('button:has-text("Apply Filters")');

      await page.waitForTimeout(500);

      // Should show filtered results
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should view candidate profile', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Click on first candidate
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Candidate profile page
      await expect(page.locator('[data-testid="candidate-profile"]')).toBeVisible();

      // Profile sections
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Professional Experience')).toBeVisible();
      await expect(page.locator('text=Education')).toBeVisible();
      await expect(page.locator('text=Application Details')).toBeVisible();
      await expect(page.locator('text=Resume')).toBeVisible();
    });

    test('should download candidate resume', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Download resume
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download Resume")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('resume');
      expect(download.suggestedFilename()).toMatch(/\.(pdf|doc|docx)$/);
    });

    test('should add notes to candidate profile', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Go to notes tab
      await page.click('button:has-text("Notes")');

      // Add note
      await page.fill('textarea[name="note"]', 'Strong technical skills. Good communication.');
      await page.click('button:has-text("Add Note")');

      await expect(page.locator('.toast-success')).toContainText('Note added');

      // Note should appear
      await expect(page.locator('.note-item')).toContainText('Strong technical skills');
    });

    test('should tag candidates', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Add tags
      await page.click('button:has-text("Add Tag")');

      await page.fill('input[placeholder*="tag"]', 'React Expert');
      await page.press('input[placeholder*="tag"]', 'Enter');

      await page.fill('input[placeholder*="tag"]', 'Good Culture Fit');
      await page.press('input[placeholder*="tag"]', 'Enter');

      await expect(page.locator('.tag:has-text("React Expert")')).toBeVisible();
      await expect(page.locator('.tag:has-text("Good Culture Fit")')).toBeVisible();
    });

    test('should rate candidate', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Rating section
      await page.click('[data-testid="star-rating"] button:nth-child(4)'); // 4 stars

      await expect(page.locator('.toast-success')).toContainText('Rating saved');
    });
  });

  test.describe('Application Status Management (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should move candidate to screening', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Find new application
      const newApp = page.locator('table tbody tr:has-text("New"):first-child');
      await newApp.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Move to Screening")');

      await expect(page.locator('.toast-success')).toContainText('Status updated');

      // Status should change
      await expect(newApp).toContainText('Screening');
    });

    test('should shortlist candidate', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      const candidate = page.locator('table tbody tr:has-text("Screening"):first-child');
      await candidate.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Shortlist")');

      // Shortlist confirmation
      await page.fill('textarea[name="reason"]', 'Strong background in required technologies');
      await page.click('button:has-text("Shortlist Candidate")');

      await expect(page.locator('.toast-success')).toContainText('Candidate shortlisted');
    });

    test('should reject candidate with reason', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      const candidate = page.locator('table tbody tr:first-child');
      await candidate.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Reject")');

      // Rejection dialog
      await expect(page.locator('text=Reject Candidate')).toBeVisible();

      await page.selectOption('select[name="rejectionReason"]', 'insufficient_experience');
      await page.fill('textarea[name="rejectionNotes"]', 'Required 5+ years but candidate has only 2 years');

      // Send rejection email
      await page.check('input[name="sendRejectionEmail"]');

      await page.click('button:has-text("Reject Candidate")');

      await expect(page.locator('.toast-success')).toContainText('Candidate rejected');
    });

    test('should put candidate on hold', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      const candidate = page.locator('table tbody tr:first-child');
      await candidate.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Put on Hold")');

      await page.fill('textarea[name="holdReason"]', 'Waiting for budget approval');
      await page.click('button:has-text("Put on Hold")');

      await expect(page.locator('.toast-success')).toContainText('Candidate put on hold');
    });

    test('should bulk update candidate status', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Select multiple candidates
      await page.check('table tbody tr:nth-child(1) input[type="checkbox"]');
      await page.check('table tbody tr:nth-child(2) input[type="checkbox"]');

      // Bulk action
      await page.click('button:has-text("Bulk Actions")');
      await page.click('button:has-text("Move to Screening")');

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText(/updated.*candidates/);
    });
  });

  test.describe('Candidate Pipeline View (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view recruitment pipeline kanban board', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/pipeline`);

      // Kanban board view
      await expect(page.locator('[data-testid="pipeline-board"]')).toBeVisible();

      // Pipeline stages
      await expect(page.locator('.pipeline-stage:has-text("New Applications")')).toBeVisible();
      await expect(page.locator('.pipeline-stage:has-text("Screening")')).toBeVisible();
      await expect(page.locator('.pipeline-stage:has-text("Interview")')).toBeVisible();
      await expect(page.locator('.pipeline-stage:has-text("Offer")')).toBeVisible();
      await expect(page.locator('.pipeline-stage:has-text("Hired")')).toBeVisible();
    });

    test('should drag and drop candidate between stages', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/pipeline`);

      // Get first candidate card from "New Applications"
      const candidateCard = page.locator('.pipeline-stage:has-text("New Applications") .candidate-card').first();

      // Drag to "Screening" stage
      const screeningStage = page.locator('.pipeline-stage:has-text("Screening")');

      await candidateCard.dragTo(screeningStage);

      await expect(page.locator('.toast-success')).toContainText('Status updated');
    });

    test('should filter pipeline by job', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/pipeline`);

      await page.selectOption('select[name="jobFilter"]', { index: 1 });

      await page.waitForTimeout(500);

      // Pipeline should update with filtered candidates
      await expect(page.locator('.candidate-card').first()).toBeVisible();
    });

    test('should view candidate quick preview from pipeline', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/pipeline`);

      // Click on candidate card
      await page.click('.candidate-card:first-child');

      // Quick preview modal
      await expect(page.locator('[data-testid="candidate-quick-view"]')).toBeVisible();

      // Should show key information
      await expect(page.locator('text=Experience')).toBeVisible();
      await expect(page.locator('text=Education')).toBeVisible();
      await expect(page.locator('button:has-text("Full Profile")')).toBeVisible();
    });
  });

  test.describe('Candidate Communication (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should send email to candidate', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Communication tab
      await page.click('button:has-text("Communication")');

      // Send email button
      await page.click('button:has-text("Send Email")');

      // Email form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Select template
      await page.selectOption('select[name="emailTemplate"]', 'interview_invitation');

      // Customize subject and body
      await page.fill('input[name="subject"]', 'Interview Invitation - Software Engineer Position');
      await page.fill('textarea[name="body"]', 'Dear Candidate,\n\nWe would like to invite you for an interview...');

      // Send
      await page.click('button:has-text("Send Email")');

      await expect(page.locator('.toast-success')).toContainText('Email sent');

      // Email should appear in communication history
      await expect(page.locator('.communication-item')).toContainText('Interview Invitation');
    });

    test('should view communication history', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Communication")');

      // Communication timeline
      await expect(page.locator('[data-testid="communication-timeline"]')).toBeVisible();

      // Should show all communications
      await expect(page.locator('.communication-item').first()).toBeVisible();
    });

    test('should schedule follow-up reminder', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Set reminder
      await page.click('button:has-text("Set Reminder")');

      await page.fill('input[name="reminderDate"]', '2024-02-15');
      await page.fill('textarea[name="reminderNote"]', 'Follow up on interview availability');

      await page.click('button:has-text("Save Reminder")');

      await expect(page.locator('.toast-success')).toContainText('Reminder set');
    });
  });

  test.describe('Manager Candidate View', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view candidates for manager job openings', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-candidates`);

      // Should see candidates for jobs where manager is hiring manager
      await expect(page.locator('h1:has-text("Candidates")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should review shortlisted candidates', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-candidates`);

      // Filter shortlisted
      await page.selectOption('select[name="status"]', 'shortlisted');

      await page.waitForTimeout(500);

      // View candidate
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Should see candidate profile
      await expect(page.locator('[data-testid="candidate-profile"]')).toBeVisible();
    });

    test('should provide feedback on candidate', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/my-candidates`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Add feedback
      await page.click('button:has-text("Add Feedback")');

      await page.fill('textarea[name="feedback"]', 'Excellent technical skills. Strong problem-solving ability.');

      // Rating
      await page.click('[data-testid="rating"] button:nth-child(5)'); // 5 stars

      // Recommendation
      await page.selectOption('select[name="recommendation"]', 'proceed');

      await page.click('button:has-text("Submit Feedback")');

      await expect(page.locator('.toast-success')).toContainText('Feedback submitted');
    });
  });

  test.describe('Candidate Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view recruitment funnel report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/funnel`);

      // Funnel visualization
      await expect(page.locator('[data-testid="recruitment-funnel"]')).toBeVisible();

      // Stages with counts
      await expect(page.locator('text=Applications Received')).toBeVisible();
      await expect(page.locator('text=Screened')).toBeVisible();
      await expect(page.locator('text=Interviewed')).toBeVisible();
      await expect(page.locator('text=Offered')).toBeVisible();
      await expect(page.locator('text=Hired')).toBeVisible();
    });

    test('should export candidate data to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('candidates');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });
});
