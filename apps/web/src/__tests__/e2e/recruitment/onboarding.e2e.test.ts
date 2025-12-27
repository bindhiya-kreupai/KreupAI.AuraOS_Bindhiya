/**
 * Onboarding E2E Tests
 * Plan D - Week 7, Day 35
 *
 * Tests offer management, onboarding workflows, and new hire process
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';
const HIRING_MANAGER_EMAIL = 'manager@e2etest.com';
const HIRING_MANAGER_PASSWORD = 'Test@1234';
const NEW_HIRE_EMAIL = 'newhire@e2etest.com';
const NEW_HIRE_PASSWORD = 'Test@1234';

let hrToken: string;
let managerToken: string;
let newHireToken: string;
let offerId: number;

test.describe('Onboarding E2E', () => {
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

  test.describe('Offer Generation & Management (HR)', () => {
    test('should generate offer letter', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/candidates`);

      // Select candidate after successful interviews
      const candidate = page.locator('table tbody tr:has-text("Interview Completed"):first-child');
      await candidate.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Generate Offer")');

      // Offer generation form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Generate Offer Letter")')).toBeVisible();

      // Position Details
      await page.fill('input[name="designation"]', 'Senior Software Engineer');
      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });
      await page.selectOption('select[name="employmentType"]', 'full_time');

      // Compensation
      await page.fill('input[name="annualCTC"]', '2000000');
      await page.fill('input[name="basicSalary"]', '1200000');
      await page.fill('input[name="hra"]', '480000');
      await page.fill('input[name="specialAllowance"]', '320000');

      // Variable Pay
      await page.fill('input[name="performanceBonus"]', '200000');

      // Other Benefits
      await page.check('input[value="health_insurance"]');
      await page.check('input[value="meal_vouchers"]');
      await page.check('input[value="transport_allowance"]');

      // Joining Details
      await page.fill('input[name="expectedJoiningDate"]', '2024-03-01');
      await page.fill('input[name="reportingManager"]', 'John Manager');

      // Work Location
      await page.selectOption('select[name="workLocation"]', 'bangalore');

      // Probation
      await page.fill('input[name="probationPeriod"]', '3');

      // Notice Period
      await page.fill('input[name="noticePeriod"]', '60');

      // Offer Validity
      await page.fill('input[name="offerValidTill"]', '2024-02-29');

      // Additional Terms
      await page.fill('textarea[name="additionalTerms"]', 'Background verification mandatory before joining');

      // Generate Offer
      await page.click('button[type="submit"]:has-text("Generate Offer")');

      await expect(page.locator('.toast-success')).toContainText('Offer letter generated');
    });

    test('should preview offer letter before sending', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      // Find draft offer
      const offer = page.locator('table tbody tr:has-text("Draft"):first-child');
      await offer.locator('button:has-text("Preview")').click();

      // Offer preview modal
      await expect(page.locator('[data-testid="offer-preview"]')).toBeVisible();

      // Should show formatted offer letter
      await expect(page.locator('text=Offer of Employment')).toBeVisible();
      await expect(page.locator('text=Annual CTC')).toBeVisible();
      await expect(page.locator('text=Joining Date')).toBeVisible();

      // Download PDF option
      await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
    });

    test('should send offer letter to candidate', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const offer = page.locator('table tbody tr:has-text("Draft"):first-child');
      await offer.locator('button:has-text("Send Offer")').click();

      // Send confirmation
      await expect(page.locator('text=Send Offer Letter')).toBeVisible();

      // Verify recipient email
      await expect(page.locator('input[name="recipientEmail"]')).not.toBeEmpty();

      // CC
      await page.fill('input[name="cc"]', 'manager@company.com');

      // Email message
      await page.fill('textarea[name="message"]', 'Congratulations! Please find attached your offer letter.');

      // Send
      await page.click('button:has-text("Send Offer")');

      await expect(page.locator('.toast-success')).toContainText('Offer sent');

      // Status should change
      await expect(offer).toContainText('Sent');
    });

    test('should track offer acceptance', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      // Find sent offer
      const offer = page.locator('table tbody tr:has-text("Sent"):first-child');
      await offer.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Mark as Accepted")');

      // Acceptance details
      await page.fill('input[name="acceptanceDate"]', '2024-02-25');
      await page.fill('input[name="joiningDate"]', '2024-03-01');

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Offer accepted');

      // Status update
      await expect(offer).toContainText('Accepted');
    });

    test('should track offer rejection', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const offer = page.locator('table tbody tr:has-text("Sent"):first-child');
      await offer.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Mark as Rejected")');

      // Rejection details
      await page.selectOption('select[name="rejectionReason"]', 'compensation');
      await page.fill('textarea[name="rejectionNotes"]', 'Candidate received better offer from another company');

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Offer rejected');
    });

    test('should revoke offer', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const offer = page.locator('table tbody tr:has-text("Sent"):first-child');
      await offer.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Revoke Offer")');

      // Revocation reason
      await page.selectOption('select[name="revocationReason"]', 'budget_constraints');
      await page.fill('textarea[name="revocationNotes"]', 'Position cancelled due to budget freeze');

      await page.click('button:has-text("Revoke Offer")');

      await expect(page.locator('.toast-success')).toContainText('Offer revoked');
    });

    test('should extend offer validity', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const offer = page.locator('table tbody tr:has-text("Sent"):first-child');
      await offer.locator('button[aria-label="Actions"]').click();

      await page.click('button:has-text("Extend Validity")');

      // New expiry date
      await page.fill('input[name="newExpiryDate"]', '2024-03-15');
      await page.fill('textarea[name="reason"]', 'Candidate requested more time to consider');

      await page.click('button:has-text("Extend")');

      await expect(page.locator('.toast-success')).toContainText('Validity extended');
    });

    test('should amend offer terms', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const offer = page.locator('table tbody tr:has-text("Sent"):first-child');
      await offer.locator('button:has-text("Edit")').click();

      // Update compensation
      await page.fill('input[name="annualCTC"]', '2200000');

      // Add amendment note
      await page.fill('textarea[name="amendmentNote"]', 'Salary increased after negotiation');

      await page.click('button:has-text("Save & Send Revised Offer")');

      await expect(page.locator('.toast-success')).toContainText('Revised offer sent');
    });
  });

  test.describe('Pre-Onboarding Workflow (HR)', () => {
    test('should initiate pre-onboarding for accepted offer', async ({ page }) => {
      await page.goto(`${BASE_URL}/recruitment/offers`);

      const acceptedOffer = page.locator('table tbody tr:has-text("Accepted"):first-child');
      await acceptedOffer.locator('button:has-text("Start Onboarding")').click();

      // Onboarding initiation
      await expect(page.locator('text=Initiate Onboarding')).toBeVisible();

      // Assign onboarding buddy
      await page.fill('input[placeholder*="Search buddy"]', 'Sarah');
      await page.waitForTimeout(500);
      await page.click('li:has-text("Sarah Mentor")');

      // IT setup request
      await page.check('input[value="laptop"]');
      await page.check('input[value="email_account"]');
      await page.check('input[value="access_card"]');

      // Send welcome email
      await page.check('input[name="sendWelcomeEmail"]');

      // Initiate
      await page.click('button:has-text("Initiate Onboarding")');

      await expect(page.locator('.toast-success')).toContainText('Onboarding initiated');

      // Should redirect to onboarding dashboard
      await expect(page).toHaveURL(/.*onboarding/);
    });

    test('should configure onboarding checklist', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/onboarding-checklist`);

      // Add checklist item
      await page.click('button:has-text("Add Item")');

      await page.fill('input[name="itemName"]', 'Complete background verification');
      await page.selectOption('select[name="category"]', 'pre_joining');
      await page.selectOption('select[name="assignedTo"]', 'hr');
      await page.fill('input[name="dueBeforeDays"]', '7');

      await page.click('button:has-text("Save Item")');

      await expect(page.locator('.toast-success')).toContainText('Item added');
    });

    test('should send document collection request to new hire', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      const newHire = page.locator('table tbody tr:first-child');
      await newHire.locator('button:has-text("Request Documents")').click();

      // Document request dialog
      await expect(page.locator('text=Request Documents')).toBeVisible();

      // Select required documents
      await page.check('input[value="aadhar"]');
      await page.check('input[value="pan"]');
      await page.check('input[value="education_certificates"]');
      await page.check('input[value="previous_employer_documents"]');
      await page.check('input[value="passport_photo"]');

      // Additional instructions
      await page.fill('textarea[name="instructions"]', 'Please upload scanned copies of all documents');

      // Send request
      await page.click('button:has-text("Send Request")');

      await expect(page.locator('.toast-success')).toContainText('Document request sent');
    });

    test('should track document submission status', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      // Documents tab
      await page.click('button:has-text("Documents")');

      // Document checklist
      await expect(page.locator('[data-testid="document-checklist"]')).toBeVisible();

      // Status indicators
      await expect(page.locator('.document-item:has-text("Submitted")')).toBeVisible();
      await expect(page.locator('.document-item:has-text("Pending")')).toBeVisible();
    });

    test('should verify submitted documents', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Documents")');

      // Find submitted document
      const doc = page.locator('.document-item:has-text("Submitted"):first-child');
      await doc.locator('button:has-text("Verify")').click();

      // Document verification
      await expect(page.locator('[data-testid="document-viewer"]')).toBeVisible();

      // Approve
      await page.click('button:has-text("Approve")');
      await page.fill('textarea[name="verificationNotes"]', 'Document verified - details match');

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Document approved');
    });

    test('should reject invalid document', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      await page.click('table tbody tr:first-child button:has-text("View")');
      await page.click('button:has-text("Documents")');

      const doc = page.locator('.document-item:has-text("Submitted"):first-child');
      await doc.locator('button:has-text("Verify")').click();

      // Reject
      await page.click('button:has-text("Reject")');
      await page.fill('textarea[name="rejectionReason"]', 'Document not clear - please upload better quality scan');

      await page.click('button:has-text("Reject Document")');

      await expect(page.locator('.toast-success')).toContainText('Document rejected');
    });
  });

  test.describe('New Hire Portal', () => {
    test('should view onboarding dashboard as new hire', async ({ page }) => {
      // Simulate new hire login
      await page.goto(`${BASE_URL}/onboarding/portal`);

      // Use onboarding portal link sent via email
      const onboardingToken = 'sample_onboarding_token_123';
      await page.goto(`${BASE_URL}/onboarding/portal?token=${onboardingToken}`);

      // Onboarding welcome screen
      await expect(page.locator('text=Welcome to')).toBeVisible();
      await expect(page.locator('[data-testid="onboarding-dashboard"]')).toBeVisible();

      // Key sections
      await expect(page.locator('text=Your Joining Date')).toBeVisible();
      await expect(page.locator('text=Pending Tasks')).toBeVisible();
      await expect(page.locator('text=Required Documents')).toBeVisible();
    });

    test('should upload required documents', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/portal?token=sample_token`);

      // Go to documents section
      await page.click('button:has-text("Upload Documents")');

      // Upload Aadhar
      const aadharInput = page.locator('input[data-document-type="aadhar"]');
      await aadharInput.setInputFiles(path.join(__dirname, 'test-assets', 'aadhar.pdf'));

      await expect(page.locator('.toast-success')).toContainText('Aadhar uploaded');

      // Upload PAN
      const panInput = page.locator('input[data-document-type="pan"]');
      await panInput.setInputFiles(path.join(__dirname, 'test-assets', 'pan.pdf'));

      await expect(page.locator('.toast-success')).toContainText('PAN uploaded');
    });

    test('should fill personal information form', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/portal?token=sample_token`);

      await page.click('button:has-text("Personal Information")');

      // Emergency Contact
      await page.fill('input[name="emergencyContactName"]', 'Jane Doe');
      await page.fill('input[name="emergencyContactRelation"]', 'Spouse');
      await page.fill('input[name="emergencyContactPhone"]', '+91-9876543210');

      // Bank Details
      await page.fill('input[name="bankName"]', 'HDFC Bank');
      await page.fill('input[name="accountNumber"]', '12345678901234');
      await page.fill('input[name="ifscCode"]', 'HDFC0001234');

      // Upload cancelled cheque
      const chequeInput = page.locator('input[type="file"][name="cancelledCheque"]');
      await chequeInput.setInputFiles(path.join(__dirname, 'test-assets', 'cheque.pdf'));

      // T-shirt size for uniform
      await page.selectOption('select[name="tshirtSize"]', 'L');

      // Save
      await page.click('button:has-text("Save Information")');

      await expect(page.locator('.toast-success')).toContainText('Information saved');
    });

    test('should view company policies and acknowledge', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/portal?token=sample_token`);

      await page.click('button:has-text("Company Policies")');

      // List of policies
      await expect(page.locator('text=Code of Conduct')).toBeVisible();
      await expect(page.locator('text=IT Policy')).toBeVisible();
      await expect(page.locator('text=Leave Policy')).toBeVisible();

      // Read policy
      await page.click('a:has-text("Code of Conduct")');

      // Policy document viewer
      await expect(page.locator('[data-testid="policy-viewer"]')).toBeVisible();

      // Acknowledge
      await page.check('input[name="acknowledge"]');
      await page.click('button:has-text("I Acknowledge")');

      await expect(page.locator('.toast-success')).toContainText('Policy acknowledged');
    });

    test('should track onboarding progress', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/portal?token=sample_token`);

      // Progress tracker
      await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();

      // Progress percentage
      await expect(page.locator('text=/%/')).toBeVisible();

      // Checklist with status
      await expect(page.locator('.checklist-item.completed').first()).toBeVisible();
      await expect(page.locator('.checklist-item.pending').first()).toBeVisible();
    });
  });

  test.describe('Joining Day Process (HR)', () => {
    test('should mark new hire as joined', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      // Filter by joining today
      await page.selectOption('select[name="filter"]', 'joining_today');

      const newHire = page.locator('table tbody tr:first-child');
      await newHire.locator('button:has-text("Mark as Joined")').click();

      // Joining confirmation
      await expect(page.locator('text=Confirm Joining')).toBeVisible();

      await page.fill('input[name="actualJoiningDate"]', '2024-03-01');
      await page.fill('input[name="employeeId"]', 'EMP-2024-001');

      // Create employee account
      await page.check('input[name="createEmployeeAccount"]');

      // Confirm
      await page.click('button:has-text("Confirm Joining")');

      await expect(page.locator('.toast-success')).toContainText('Employee joined successfully');
    });

    test('should assign assets to new employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/recent-joiners`);

      await page.click('table tbody tr:first-child button:has-text("Assign Assets")');

      // Asset assignment form
      await expect(page.locator('text=Assign Assets')).toBeVisible();

      // Laptop
      await page.selectOption('select[name="laptop"]', { label: 'Dell Latitude 5520 - #LAP-001' });

      // Mobile
      await page.selectOption('select[name="mobile"]', { label: 'iPhone 13 - #MOB-045' });

      // Access Card
      await page.fill('input[name="accessCardNumber"]', 'ACC-2024-001');

      // ID Card
      await page.fill('input[name="idCardNumber"]', 'ID-2024-001');

      // Assign
      await page.click('button:has-text("Assign Assets")');

      await expect(page.locator('.toast-success')).toContainText('Assets assigned');
    });

    test('should configure system access for new employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/recent-joiners`);

      await page.click('table tbody tr:first-child button:has-text("Configure Access")');

      // Access configuration
      await expect(page.locator('text=System Access Configuration')).toBeVisible();

      // Email account
      await page.fill('input[name="emailUsername"]', 'john.doe');
      await page.selectOption('select[name="emailDomain"]', '@company.com');

      // Software access
      await page.check('input[value="jira"]');
      await page.check('input[value="slack"]');
      await page.check('input[value="github"]');

      // Role-based access
      await page.selectOption('select[name="role"]', 'developer');

      // Submit
      await page.click('button:has-text("Configure Access")');

      await expect(page.locator('.toast-success')).toContainText('Access configured');
    });
  });

  test.describe('Onboarding Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should view onboarding pipeline', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/dashboard`);

      // Pipeline stages
      await expect(page.locator('text=Offers Accepted')).toBeVisible();
      await expect(page.locator('text=Pre-onboarding')).toBeVisible();
      await expect(page.locator('text=Joining This Week')).toBeVisible();
      await expect(page.locator('text=Recently Joined')).toBeVisible();

      // Counts for each stage
      await expect(page.locator('[data-testid="pipeline-metrics"]')).toBeVisible();
    });

    test('should view onboarding completion rate', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/onboarding/completion-rate`);

      // Select date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Metrics
      await expect(page.locator('text=Average Completion Time')).toBeVisible();
      await expect(page.locator('text=On-time Completion Rate')).toBeVisible();
      await expect(page.locator('text=Document Verification Time')).toBeVisible();
    });

    test('should export onboarding data', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding/pending`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('onboarding');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });

    test('should view offer acceptance rate', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/recruitment/offer-metrics`);

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Metrics
      await expect(page.locator('text=Offers Made')).toBeVisible();
      await expect(page.locator('text=Offers Accepted')).toBeVisible();
      await expect(page.locator('text=Acceptance Rate')).toBeVisible();
      await expect(page.locator('text=Avg Time to Accept')).toBeVisible();
    });

    test('should view drop-off analysis', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/onboarding/drop-off`);

      // Drop-off funnel
      await expect(page.locator('[data-testid="drop-off-funnel"]')).toBeVisible();

      // Stages
      await expect(page.locator('text=Offer Sent to Accepted')).toBeVisible();
      await expect(page.locator('text=Accepted to Joined')).toBeVisible();
      await expect(page.locator('text=No-show Rate')).toBeVisible();
    });
  });
});
