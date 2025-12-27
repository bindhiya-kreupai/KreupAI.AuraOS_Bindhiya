/**
 * Recruitment Page Object
 * Handles all recruitment related interactions
 *
 * @reference docs/testing/E2E-PAGE-OBJECT-MODEL.md
 * @owner Dev B (QA Specialist) - PRIMARY OWNER for Recruitment E2E flows
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface JobPostingData {
  jobTitle: string;
  department: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  salaryMin?: string;
  salaryMax?: string;
  description: string;
  requirements: string;
  benefits?: string;
}

export interface InterviewScheduleData {
  date: string;
  time: string;
  interviewType: 'phone' | 'video' | 'in-person';
  interviewers: string[];
  duration: string;
  location?: string;
  notes?: string;
}

export interface OfferData {
  position: string;
  salary: string;
  startDate: string;
  benefits: string[];
  offerExpiryDate: string;
  additionalTerms?: string;
}

export class RecruitmentPage extends BasePage {
  // Job Posting Elements
  readonly createJobButton: Locator;
  readonly jobTitleInput: Locator;
  readonly departmentDropdown: Locator;
  readonly locationInput: Locator;
  readonly jobTypeDropdown: Locator;
  readonly experienceLevelDropdown: Locator;
  readonly salaryMinInput: Locator;
  readonly salaryMaxInput: Locator;
  readonly descriptionEditor: Locator;
  readonly requirementsEditor: Locator;
  readonly benefitsEditor: Locator;
  readonly publishJobButton: Locator;
  readonly saveDraftButton: Locator;

  // Job List Elements
  readonly jobListTable: Locator;
  readonly searchJobInput: Locator;
  readonly statusFilterDropdown: Locator;
  readonly departmentFilterDropdown: Locator;

  // Applications Elements
  readonly applicationsTab: Locator;
  readonly applicationsTable: Locator;
  readonly applicationCard: Locator;
  readonly reviewApplicationButton: Locator;
  readonly shortlistButton: Locator;
  readonly rejectButton: Locator;
  readonly scheduleInterviewButton: Locator;

  // Interview Schedule Elements
  readonly interviewDateInput: Locator;
  readonly interviewTimeInput: Locator;
  readonly interviewTypeDropdown: Locator;
  readonly interviewersSelect: Locator;
  readonly durationInput: Locator;
  readonly interviewLocationInput: Locator;
  readonly interviewNotesTextarea: Locator;
  readonly confirmInterviewButton: Locator;

  // Offer Elements
  readonly makeOfferButton: Locator;
  readonly offerPositionInput: Locator;
  readonly offerSalaryInput: Locator;
  readonly offerStartDateInput: Locator;
  readonly offerBenefitsCheckboxes: Locator;
  readonly offerExpiryDateInput: Locator;
  readonly offerTermsTextarea: Locator;
  readonly sendOfferButton: Locator;

  // Details Modal Elements
  readonly detailsModal: Locator;
  readonly candidateName: Locator;
  readonly candidateEmail: Locator;
  readonly candidatePhone: Locator;
  readonly resumeDownloadLink: Locator;

  // Toast/Alert Elements
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page, '/dashboard/recruitment');

    // Initialize Job Posting Elements
    this.createJobButton = page.getByRole('button', { name: /create.*job|post.*job/i });
    this.jobTitleInput = page.getByLabel(/job.*title/i);
    this.departmentDropdown = page.getByLabel(/department/i);
    this.locationInput = page.getByLabel(/location/i);
    this.jobTypeDropdown = page.getByLabel(/job.*type|employment.*type/i);
    this.experienceLevelDropdown = page.getByLabel(/experience.*level/i);
    this.salaryMinInput = page.getByLabel(/minimum.*salary|salary.*min/i);
    this.salaryMaxInput = page.getByLabel(/maximum.*salary|salary.*max/i);
    this.descriptionEditor = page.getByLabel(/job.*description|description/i);
    this.requirementsEditor = page.getByLabel(/requirements|qualifications/i);
    this.benefitsEditor = page.getByLabel(/benefits/i);
    this.publishJobButton = page.getByRole('button', { name: /publish/i });
    this.saveDraftButton = page.getByRole('button', { name: /save.*draft/i });

    // Initialize Job List Elements
    this.jobListTable = page.getByRole('table');
    this.searchJobInput = page.getByPlaceholder(/search.*job/i);
    this.statusFilterDropdown = page.getByLabel(/status.*filter/i);
    this.departmentFilterDropdown = page.getByLabel(/department.*filter/i);

    // Initialize Applications Elements
    this.applicationsTab = page.getByRole('tab', { name: /applications/i });
    this.applicationsTable = page.locator('[data-testid="applications-table"]');
    this.applicationCard = page.locator('[data-testid="application-card"]');
    this.reviewApplicationButton = page.getByRole('button', { name: /review/i });
    this.shortlistButton = page.getByRole('button', { name: /shortlist/i });
    this.rejectButton = page.getByRole('button', { name: /reject/i });
    this.scheduleInterviewButton = page.getByRole('button', { name: /schedule.*interview/i });

    // Initialize Interview Schedule Elements
    this.interviewDateInput = page.getByLabel(/interview.*date|date/i);
    this.interviewTimeInput = page.getByLabel(/interview.*time|time/i);
    this.interviewTypeDropdown = page.getByLabel(/interview.*type|type/i);
    this.interviewersSelect = page.getByLabel(/interviewers?/i);
    this.durationInput = page.getByLabel(/duration/i);
    this.interviewLocationInput = page.getByLabel(/interview.*location|location/i);
    this.interviewNotesTextarea = page.getByLabel(/notes/i);
    this.confirmInterviewButton = page.getByRole('button', { name: /confirm|schedule/i });

    // Initialize Offer Elements
    this.makeOfferButton = page.getByRole('button', { name: /make.*offer|send.*offer/i });
    this.offerPositionInput = page.getByLabel(/position/i);
    this.offerSalaryInput = page.getByLabel(/salary/i);
    this.offerStartDateInput = page.getByLabel(/start.*date/i);
    this.offerBenefitsCheckboxes = page.locator('[data-testid="offer-benefits"] input[type="checkbox"]');
    this.offerExpiryDateInput = page.getByLabel(/expiry.*date|offer.*valid/i);
    this.offerTermsTextarea = page.getByLabel(/terms|additional/i);
    this.sendOfferButton = page.getByRole('button', { name: /send.*offer/i });

    // Initialize Details Modal
    this.detailsModal = page.locator('[role="dialog"]');
    this.candidateName = page.locator('[data-testid="candidate-name"]');
    this.candidateEmail = page.locator('[data-testid="candidate-email"]');
    this.candidatePhone = page.locator('[data-testid="candidate-phone"]');
    this.resumeDownloadLink = page.getByRole('link', { name: /download.*resume/i });

    // Initialize Toast Elements
    this.successToast = page.locator('[role="alert"]').filter({ hasText: /success/i });
    this.errorToast = page.locator('[role="alert"]').filter({ hasText: /error/i });
  }

  /**
   * Navigate to Recruitment page
   */
  async navigateToRecruitment(): Promise<void> {
    await this.goto();
    await this.waitForPageLoad();
  }

  /**
   * Click Create Job button
   */
  async clickCreateJob(): Promise<void> {
    await this.click(this.createJobButton);
    await this.waitForElement(this.jobTitleInput);
  }

  /**
   * Fill job posting form
   */
  async fillJobPostingForm(data: JobPostingData): Promise<void> {
    await this.fill(this.jobTitleInput, data.jobTitle);
    await this.selectOption(this.departmentDropdown, data.department);
    await this.fill(this.locationInput, data.location);
    await this.selectOption(this.jobTypeDropdown, data.jobType);
    await this.selectOption(this.experienceLevelDropdown, data.experienceLevel);

    if (data.salaryMin) {
      await this.fill(this.salaryMinInput, data.salaryMin);
    }

    if (data.salaryMax) {
      await this.fill(this.salaryMaxInput, data.salaryMax);
    }

    await this.fill(this.descriptionEditor, data.description);
    await this.fill(this.requirementsEditor, data.requirements);

    if (data.benefits) {
      await this.fill(this.benefitsEditor, data.benefits);
    }
  }

  /**
   * Publish job posting
   */
  async publishJob(): Promise<void> {
    await this.click(this.publishJobButton);
    await this.waitForResponse(/\/api\/recruitment\/jobs/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Post a job (complete flow)
   */
  async postJob(data: JobPostingData): Promise<void> {
    await this.clickCreateJob();
    await this.fillJobPostingForm(data);
    await this.publishJob();
  }

  /**
   * Search for jobs
   */
  async searchJob(searchTerm: string): Promise<void> {
    await this.fill(this.searchJobInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForResponse(/\/api\/recruitment\/jobs\/search/);
  }

  /**
   * Filter jobs by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.selectOption(this.statusFilterDropdown, status);
    await this.waitForResponse(/\/api\/recruitment\/jobs/);
  }

  /**
   * Navigate to Applications tab
   */
  async navigateToApplications(): Promise<void> {
    await this.click(this.applicationsTab);
    await this.waitForElement(this.applicationsTable);
  }

  /**
   * Click on an application to review
   */
  async clickApplication(index: number = 0): Promise<void> {
    const card = this.applicationCard.nth(index);
    await this.click(card);
    await this.waitForElement(this.detailsModal);
  }

  /**
   * Shortlist a candidate
   */
  async shortlistCandidate(): Promise<void> {
    await this.click(this.shortlistButton);
    await this.waitForResponse(/\/api\/recruitment\/applications\/shortlist/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Reject a candidate
   */
  async rejectCandidate(reason?: string): Promise<void> {
    await this.click(this.rejectButton);
    if (reason) {
      const reasonTextarea = this.page.getByLabel(/reason/i);
      await this.fill(reasonTextarea, reason);
    }
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await this.click(confirmButton);
    await this.waitForResponse(/\/api\/recruitment\/applications\/reject/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(data: InterviewScheduleData): Promise<void> {
    await this.click(this.scheduleInterviewButton);
    await this.waitForElement(this.interviewDateInput);

    await this.fill(this.interviewDateInput, data.date);
    await this.fill(this.interviewTimeInput, data.time);
    await this.selectOption(this.interviewTypeDropdown, data.interviewType);

    // Select interviewers
    for (const interviewer of data.interviewers) {
      await this.interviewersSelect.selectOption(interviewer);
    }

    await this.fill(this.durationInput, data.duration);

    if (data.location) {
      await this.fill(this.interviewLocationInput, data.location);
    }

    if (data.notes) {
      await this.fill(this.interviewNotesTextarea, data.notes);
    }

    await this.click(this.confirmInterviewButton);
    await this.waitForResponse(/\/api\/recruitment\/interviews/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Make offer to candidate
   */
  async makeOffer(data: OfferData): Promise<void> {
    await this.click(this.makeOfferButton);
    await this.waitForElement(this.offerPositionInput);

    await this.fill(this.offerPositionInput, data.position);
    await this.fill(this.offerSalaryInput, data.salary);
    await this.fill(this.offerStartDateInput, data.startDate);

    // Select benefits
    for (const benefit of data.benefits) {
      const checkbox = this.page.locator(`input[type="checkbox"][value="${benefit}"]`);
      await this.click(checkbox);
    }

    await this.fill(this.offerExpiryDateInput, data.offerExpiryDate);

    if (data.additionalTerms) {
      await this.fill(this.offerTermsTextarea, data.additionalTerms);
    }

    await this.click(this.sendOfferButton);
    await this.waitForResponse(/\/api\/recruitment\/offers/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Verify job appears in list
   */
  async verifyJobInList(jobTitle: string, status: string): Promise<void> {
    const row = this.jobListTable.locator('tbody tr').filter({ hasText: jobTitle });
    await this.assertVisible(row);
    await this.assertContainsText(row, status);
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(message?: string): Promise<void> {
    await this.assertVisible(this.successToast);
    if (message) {
      await this.assertContainsText(this.successToast, message);
    }
  }

  /**
   * Get application count
   */
  async getApplicationCount(): Promise<number> {
    return await this.applicationCard.count();
  }

  /**
   * Get candidate details from modal
   */
  async getCandidateDetails(): Promise<{
    name: string;
    email: string;
    phone: string;
  }> {
    return {
      name: await this.getText(this.candidateName),
      email: await this.getText(this.candidateEmail),
      phone: await this.getText(this.candidatePhone),
    };
  }

  /**
   * Download candidate resume
   */
  async downloadResume(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.click(this.resumeDownloadLink),
    ]);
    await download.saveAs(`./downloads/${download.suggestedFilename()}`);
  }

  /**
   * Close details modal
   */
  async closeDetailsModal(): Promise<void> {
    const closeButton = this.detailsModal.getByRole('button', { name: /close/i });
    await this.click(closeButton);
  }
}
