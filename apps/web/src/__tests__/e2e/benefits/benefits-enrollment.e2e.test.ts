/**
 * Benefits Enrollment E2E Tests
 * Plan D - Week 7, Day 38
 *
 * Tests benefits enrollment, insurance, loans, reimbursements
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';

let employeeToken: string;
let hrToken: string;

test.describe('Benefits Enrollment E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Employee login
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD },
    });
    employeeToken = (await empResponse.json()).data.accessToken;

    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: HR_EMAIL, password: HR_PASSWORD },
    });
    hrToken = (await hrResponse.json()).data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test.describe('Health Insurance Enrollment', () => {
    test('should view available insurance plans', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/health-insurance`);

      // Insurance plans
      await expect(page.locator('h1:has-text("Health Insurance")')).toBeVisible();
      await expect(page.locator('.plan-card').first()).toBeVisible();

      // Plan details
      await expect(page.locator('text=Coverage Amount')).toBeVisible();
      await expect(page.locator('text=Premium')).toBeVisible();
      await expect(page.locator('text=Network Hospitals')).toBeVisible();
    });

    test('should enroll in health insurance', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/health-insurance`);

      // Select plan
      await page.click('.plan-card:has-text("Premium Plan") button:has-text("Enroll")');

      // Enrollment form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Coverage type
      await page.selectOption('select[name="coverageType"]', 'family');

      // Add dependents
      await page.click('button:has-text("Add Dependent")');

      await page.fill('input[name="dependentName"]', 'Jane Doe');
      await page.selectOption('select[name="relationship"]', 'spouse');
      await page.fill('input[name="dateOfBirth"]', '1990-05-15');

      await page.click('button:has-text("Add Dependent")');

      await page.fill('input[name="dependentName2"]', 'John Doe Jr');
      await page.selectOption('select[name="relationship2"]', 'child');
      await page.fill('input[name="dateOfBirth2"]', '2015-08-20');

      // Nominee details
      await page.fill('input[name="nomineeName"]', 'Jane Doe');
      await page.selectOption('select[name="nomineeRelationship"]', 'spouse');

      // Pre-existing conditions declaration
      await page.check('input[name="declarePEC"]');
      await page.fill('textarea[name="pecDetails"]', 'Diabetes - Type 2 (controlled)');

      // Submit enrollment
      await page.click('button:has-text("Submit Enrollment")');

      await expect(page.locator('.toast-success')).toContainText('Enrollment submitted');
    });

    test('should view insurance card', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/health-insurance`);

      // My Insurance tab
      await page.click('button:has-text("My Insurance")');

      // View card
      await page.click('button:has-text("View Card")');

      // Digital insurance card
      await expect(page.locator('[data-testid="insurance-card"]')).toBeVisible();
      await expect(page.locator('text=Policy Number')).toBeVisible();
      await expect(page.locator('text=Valid Until')).toBeVisible();

      // Download card
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download Card")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('insurance-card');
    });

    test('should add dependent to existing policy', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/health-insurance`);

      await page.click('button:has-text("My Insurance")');

      await page.click('button:has-text("Add Dependent")');

      await page.fill('input[name="dependentName"]', 'New Baby Doe');
      await page.selectOption('select[name="relationship"]', 'child');
      await page.fill('input[name="dateOfBirth"]', '2024-01-10');

      // Upload birth certificate
      const birthCertInput = page.locator('input[type="file"][name="birthCertificate"]');
      await birthCertInput.setInputFiles(path.join(__dirname, 'test-assets', 'birth-cert.pdf'));

      await page.click('button:has-text("Add to Policy")');

      await expect(page.locator('.toast-success')).toContainText('Dependent added');
    });

    test('should file insurance claim', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/insurance-claims`);

      await page.click('button:has-text("File New Claim")');

      // Claim details
      await page.selectOption('select[name="claimType"]', 'hospitalization');

      await page.fill('input[name="hospitalName"]', 'Apollo Hospital');
      await page.fill('input[name="admissionDate"]', '2024-01-15');
      await page.fill('input[name="dischargeDate"]', '2024-01-20');

      await page.fill('input[name="claimAmount"]', '150000');

      await page.fill('textarea[name="ailmentDescription"]', 'Surgery - Appendectomy');

      // Upload documents
      const billsInput = page.locator('input[type="file"][name="hospitalBills"]');
      await billsInput.setInputFiles(path.join(__dirname, 'test-assets', 'hospital-bill.pdf'));

      const dischargeInput = page.locator('input[type="file"][name="dischargeSummary"]');
      await dischargeInput.setInputFiles(path.join(__dirname, 'test-assets', 'discharge.pdf'));

      // Submit claim
      await page.click('button:has-text("Submit Claim")');

      await expect(page.locator('.toast-success')).toContainText('Claim submitted');
    });

    test('should track claim status', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/insurance-claims`);

      // Claims list
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // View claim details
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Claim status timeline
      await expect(page.locator('[data-testid="claim-timeline"]')).toBeVisible();
      await expect(page.locator('text=Submitted')).toBeVisible();
    });
  });

  test.describe('Employee Loans', () => {
    test('should view available loan types', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/loans`);

      // Loan types
      await expect(page.locator('h1:has-text("Employee Loans")')).toBeVisible();
      await expect(page.locator('.loan-type-card').first()).toBeVisible();

      // Loan details
      await expect(page.locator('text=Maximum Amount')).toBeVisible();
      await expect(page.locator('text=Interest Rate')).toBeVisible();
      await expect(page.locator('text=Tenure')).toBeVisible();
    });

    test('should apply for personal loan', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/loans`);

      await page.click('.loan-type-card:has-text("Personal Loan") button:has-text("Apply")');

      // Loan application form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      await page.fill('input[name="loanAmount"]', '200000');
      await page.selectOption('select[name="tenure"]', '24');

      // Purpose
      await page.selectOption('select[name="purpose"]', 'education');
      await page.fill('textarea[name="purposeDetails"]', 'Child education fees');

      // EMI calculator shows
      await expect(page.locator('[data-testid="emi-calculator"]')).toBeVisible();
      await expect(page.locator('text=/Monthly EMI:/i')).toBeVisible();

      // Repayment mode
      await page.selectOption('select[name="repaymentMode"]', 'salary_deduction');

      // Submit application
      await page.click('button:has-text("Submit Application")');

      await expect(page.locator('.toast-success')).toContainText('Loan application submitted');
    });

    test('should view loan eligibility', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/loans`);

      await page.click('button:has-text("Check Eligibility")');

      // Eligibility check
      await expect(page.locator('[data-testid="eligibility-check"]')).toBeVisible();

      // Shows eligible amount based on salary
      await expect(page.locator('text=Eligible Loan Amount')).toBeVisible();
      await expect(page.locator('text=Maximum Tenure')).toBeVisible();
    });

    test('should view active loans', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/my-loans`);

      // Active loans
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Loan details
      await page.click('table tbody tr:first-child button:has-text("View")');

      await expect(page.locator('[data-testid="loan-details"]')).toBeVisible();
      await expect(page.locator('text=Loan Amount')).toBeVisible();
      await expect(page.locator('text=Outstanding Balance')).toBeVisible();
      await expect(page.locator('text=EMI Amount')).toBeVisible();

      // Repayment schedule
      await page.click('button:has-text("Repayment Schedule")');
      await expect(page.locator('table thead th:has-text("EMI No")')).toBeVisible();
    });

    test('should request loan foreclosure', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/my-loans`);

      await page.click('table tbody tr:first-child button:has-text("View")');

      await page.click('button:has-text("Foreclose Loan")');

      // Foreclosure details
      await expect(page.locator('text=Foreclosure Amount')).toBeVisible();
      await expect(page.locator('text=Prepayment Charges')).toBeVisible();

      await page.click('button:has-text("Request Foreclosure")');

      await expect(page.locator('.toast-success')).toContainText('Foreclosure request submitted');
    });
  });

  test.describe('Expense Reimbursements', () => {
    test('should view reimbursement policies', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/reimbursements`);

      // Reimbursement types
      await expect(page.locator('.reimbursement-card:has-text("Travel")')).toBeVisible();
      await expect(page.locator('.reimbursement-card:has-text("Medical")')).toBeVisible();
      await expect(page.locator('.reimbursement-card:has-text("Mobile")')).toBeVisible();
    });

    test('should submit travel reimbursement', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/reimbursements`);

      await page.click('button:has-text("Submit Claim")');

      // Reimbursement form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      await page.selectOption('select[name="type"]', 'travel');

      await page.fill('input[name="claimDate"]', '2024-01-20');
      await page.fill('input[name="amount"]', '5500');

      await page.fill('textarea[name="description"]', 'Client visit - Mumbai');

      // Expense breakdown
      await page.click('button:has-text("Add Expense")');

      await page.fill('input[name="expense1Category"]', 'Flight');
      await page.fill('input[name="expense1Amount"]', '4000');

      await page.click('button:has-text("Add Expense")');

      await page.fill('input[name="expense2Category"]', 'Taxi');
      await page.fill('input[name="expense2Amount"]', '1500');

      // Upload receipts
      const receiptsInput = page.locator('input[type="file"][name="receipts"]');
      await receiptsInput.setInputFiles([
        path.join(__dirname, 'test-assets', 'receipt1.pdf'),
        path.join(__dirname, 'test-assets', 'receipt2.pdf')
      ]);

      // Submit
      await page.click('button:has-text("Submit Claim")');

      await expect(page.locator('.toast-success')).toContainText('Reimbursement claim submitted');
    });

    test('should submit medical reimbursement', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/reimbursements`);

      await page.click('button:has-text("Submit Claim")');

      await page.selectOption('select[name="type"]', 'medical');

      await page.fill('input[name="claimDate"]', '2024-01-15');
      await page.fill('input[name="amount"]', '3500');

      await page.fill('textarea[name="description"]', 'Dental treatment');

      // Upload medical bills
      const billsInput = page.locator('input[type="file"][name="medicalBills"]');
      await billsInput.setInputFiles(path.join(__dirname, 'test-assets', 'medical-bill.pdf'));

      await page.click('button:has-text("Submit Claim")');

      await expect(page.locator('.toast-success')).toContainText('claim submitted');
    });

    test('should view reimbursement status', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/my-reimbursements`);

      // Reimbursements list
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Status indicators
      await expect(page.locator('.status-pending').first()).toBeVisible();

      // View details
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Claim details
      await expect(page.locator('[data-testid="reimbursement-details"]')).toBeVisible();
      await expect(page.locator('text=Claimed Amount')).toBeVisible();
      await expect(page.locator('text=Approval Status')).toBeVisible();
    });
  });

  test.describe('Benefits HR Administration', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should approve insurance enrollment', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/admin/insurance-enrollments`);

      // Pending enrollments
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Enrollment details
      await expect(page.locator('[data-testid="enrollment-review"]')).toBeVisible();

      // Approve
      await page.click('button:has-text("Approve")');

      await page.fill('input[name="policyNumber"]', 'POL-2024-001');
      await page.fill('input[name="effectiveDate"]', '2024-02-01');

      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('Enrollment approved');
    });

    test('should approve loan application', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/admin/loan-applications`);

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Loan review
      await expect(page.locator('[data-testid="loan-review"]')).toBeVisible();

      // Check eligibility
      await expect(page.locator('text=Eligibility Check')).toBeVisible();
      await expect(page.locator('text=Credit Score')).toBeVisible();

      // Approve
      await page.click('button:has-text("Approve")');

      await page.fill('input[name="loanAccountNumber"]', 'LOAN-2024-001');
      await page.fill('input[name="disbursementDate"]', '2024-02-05');

      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('Loan approved');
    });

    test('should process reimbursement claim', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/admin/reimbursement-claims`);

      await page.click('table tbody tr:first-child button:has-text("Review")');

      // Claim review
      await expect(page.locator('[data-testid="claim-review"]')).toBeVisible();

      // View receipts
      await expect(page.locator('[data-testid="receipts-viewer"]')).toBeVisible();

      // Approve amount (may be different from claimed)
      await page.fill('input[name="approvedAmount"]', '5000');

      await page.fill('textarea[name="approvalComments"]', 'Flight expense approved. Taxi partially approved as per policy limit.');

      await page.click('button:has-text("Approve")');

      await expect(page.locator('.toast-success')).toContainText('Claim approved');
    });

    test('should generate benefits utilization report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/benefits/utilization`);

      await page.selectOption('select[name="benefitType"]', 'all');

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Report should show
      await expect(page.locator('[data-testid="benefits-report"]')).toBeVisible();

      // Metrics
      await expect(page.locator('text=Insurance Enrollments')).toBeVisible();
      await expect(page.locator('text=Active Loans')).toBeVisible();
      await expect(page.locator('text=Reimbursement Claims')).toBeVisible();
      await expect(page.locator('text=Total Benefits Cost')).toBeVisible();
    });

    test('should export benefits data', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/admin/dashboard`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Data")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('benefits');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });
  });

  test.describe('Flexible Benefits & Cafeteria Plans', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should view flexible benefits wallet', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/flex-benefits`);

      // Flex benefits wallet
      await expect(page.locator('[data-testid="flex-wallet"]')).toBeVisible();

      await expect(page.locator('text=Total Credits')).toBeVisible();
      await expect(page.locator('text=Used Credits')).toBeVisible();
      await expect(page.locator('text=Remaining Credits')).toBeVisible();
    });

    test('should allocate flex credits to benefits', async ({ page }) => {
      await page.goto(`${BASE_URL}/benefits/flex-benefits`);

      // Available benefits
      await expect(page.locator('.flex-benefit-card').first()).toBeVisible();

      // Allocate to health insurance
      await page.click('.flex-benefit-card:has-text("Health Insurance Top-up") button:has-text("Allocate")');

      await page.fill('input[name="credits"]', '5000');

      await page.click('button:has-text("Confirm Allocation")');

      await expect(page.locator('.toast-success')).toContainText('Credits allocated');
    });
  });
});
