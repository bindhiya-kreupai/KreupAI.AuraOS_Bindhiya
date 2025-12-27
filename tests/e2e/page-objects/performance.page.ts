/**
 * Performance Management Page Object
 * Handles all performance management related interactions
 *
 * @reference docs/testing/E2E-PAGE-OBJECT-MODEL.md
 * @owner Dev B (QA Specialist) - PRIMARY OWNER for Performance E2E flows
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface GoalData {
  title: string;
  description: string;
  category: 'individual' | 'team' | 'company';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  keyResults: string[];
  assignees?: string[];
}

export interface PerformanceReviewData {
  reviewPeriod: string;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  achievements: string;
  goals: string;
  comments: string;
}

export interface MeetingData {
  title: string;
  employeeId: string;
  date: string;
  time: string;
  duration: string;
  agenda: string;
  location?: string;
  meetingType: 'one-on-one' | 'performance-review' | 'feedback' | 'check-in';
}

export class PerformancePage extends BasePage {
  // Goals Elements
  readonly createGoalButton: Locator;
  readonly goalTitleInput: Locator;
  readonly goalDescriptionTextarea: Locator;
  readonly goalCategoryDropdown: Locator;
  readonly goalPriorityDropdown: Locator;
  readonly goalDueDateInput: Locator;
  readonly addKeyResultButton: Locator;
  readonly keyResultInput: Locator;
  readonly assigneesSelect: Locator;
  readonly saveGoalButton: Locator;

  // Goals List Elements
  readonly goalsListTable: Locator;
  readonly searchGoalInput: Locator;
  readonly filterByCategory: Locator;
  readonly filterByStatus: Locator;
  readonly goalCard: Locator;

  // Performance Review Elements
  readonly startReviewButton: Locator;
  readonly reviewPeriodDropdown: Locator;
  readonly overallRatingSelect: Locator;
  readonly strengthsTextarea: Locator;
  readonly areasForImprovementTextarea: Locator;
  readonly achievementsTextarea: Locator;
  readonly futureGoalsTextarea: Locator;
  readonly commentsTextarea: Locator;
  readonly submitReviewButton: Locator;
  readonly saveDraftButton: Locator;

  // Review List Elements
  readonly reviewsTab: Locator;
  readonly reviewsTable: Locator;
  readonly reviewCard: Locator;

  // 1-on-1 Meeting Elements
  readonly scheduleMeetingButton: Locator;
  readonly meetingTitleInput: Locator;
  readonly selectEmployeeDropdown: Locator;
  readonly meetingDateInput: Locator;
  readonly meetingTimeInput: Locator;
  readonly meetingDurationInput: Locator;
  readonly meetingAgendaTextarea: Locator;
  readonly meetingLocationInput: Locator;
  readonly meetingTypeDropdown: Locator;
  readonly confirmMeetingButton: Locator;

  // Meeting List Elements
  readonly meetingsTab: Locator;
  readonly meetingsTable: Locator;
  readonly upcomingMeetings: Locator;
  readonly pastMeetings: Locator;

  // Meeting Details Elements
  readonly meetingDetailsModal: Locator;
  readonly meetingNotesTextarea: Locator;
  readonly actionItemsTextarea: Locator;
  readonly completeMeetingButton: Locator;
  readonly rescheduleMeetingButton: Locator;
  readonly cancelMeetingButton: Locator;

  // Feedback Elements
  readonly giveFeedbackButton: Locator;
  readonly feedbackTypeDropdown: Locator;
  readonly feedbackRecipientSelect: Locator;
  readonly feedbackTextarea: Locator;
  readonly submitFeedbackButton: Locator;

  // Toast/Alert Elements
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page, '/dashboard/performance');

    // Initialize Goals Elements
    this.createGoalButton = page.getByRole('button', { name: /create.*goal|new.*goal/i });
    this.goalTitleInput = page.getByLabel(/goal.*title|title/i);
    this.goalDescriptionTextarea = page.getByLabel(/description/i);
    this.goalCategoryDropdown = page.getByLabel(/category/i);
    this.goalPriorityDropdown = page.getByLabel(/priority/i);
    this.goalDueDateInput = page.getByLabel(/due.*date/i);
    this.addKeyResultButton = page.getByRole('button', { name: /add.*key.*result/i });
    this.keyResultInput = page.getByLabel(/key.*result/i);
    this.assigneesSelect = page.getByLabel(/assignees?/i);
    this.saveGoalButton = page.getByRole('button', { name: /save.*goal/i });

    // Initialize Goals List Elements
    this.goalsListTable = page.getByRole('table');
    this.searchGoalInput = page.getByPlaceholder(/search.*goal/i);
    this.filterByCategory = page.getByLabel(/filter.*category/i);
    this.filterByStatus = page.getByLabel(/filter.*status/i);
    this.goalCard = page.locator('[data-testid="goal-card"]');

    // Initialize Performance Review Elements
    this.startReviewButton = page.getByRole('button', { name: /start.*review|new.*review/i });
    this.reviewPeriodDropdown = page.getByLabel(/review.*period|period/i);
    this.overallRatingSelect = page.getByLabel(/overall.*rating|rating/i);
    this.strengthsTextarea = page.getByLabel(/strengths/i);
    this.areasForImprovementTextarea = page.getByLabel(/areas.*improvement|improvement/i);
    this.achievementsTextarea = page.getByLabel(/achievements?/i);
    this.futureGoalsTextarea = page.getByLabel(/future.*goals?|goals?/i);
    this.commentsTextarea = page.getByLabel(/comments?/i);
    this.submitReviewButton = page.getByRole('button', { name: /submit.*review/i });
    this.saveDraftButton = page.getByRole('button', { name: /save.*draft/i });

    // Initialize Review List Elements
    this.reviewsTab = page.getByRole('tab', { name: /reviews?/i });
    this.reviewsTable = page.locator('[data-testid="reviews-table"]');
    this.reviewCard = page.locator('[data-testid="review-card"]');

    // Initialize 1-on-1 Meeting Elements
    this.scheduleMeetingButton = page.getByRole('button', { name: /schedule.*meeting|new.*meeting/i });
    this.meetingTitleInput = page.getByLabel(/meeting.*title|title/i);
    this.selectEmployeeDropdown = page.getByLabel(/employee|select.*employee/i);
    this.meetingDateInput = page.getByLabel(/meeting.*date|date/i);
    this.meetingTimeInput = page.getByLabel(/meeting.*time|time/i);
    this.meetingDurationInput = page.getByLabel(/duration/i);
    this.meetingAgendaTextarea = page.getByLabel(/agenda/i);
    this.meetingLocationInput = page.getByLabel(/location/i);
    this.meetingTypeDropdown = page.getByLabel(/meeting.*type|type/i);
    this.confirmMeetingButton = page.getByRole('button', { name: /confirm|schedule/i });

    // Initialize Meeting List Elements
    this.meetingsTab = page.getByRole('tab', { name: /meetings?/i });
    this.meetingsTable = page.locator('[data-testid="meetings-table"]');
    this.upcomingMeetings = page.locator('[data-testid="upcoming-meetings"]');
    this.pastMeetings = page.locator('[data-testid="past-meetings"]');

    // Initialize Meeting Details Elements
    this.meetingDetailsModal = page.locator('[role="dialog"]');
    this.meetingNotesTextarea = page.getByLabel(/notes/i);
    this.actionItemsTextarea = page.getByLabel(/action.*items/i);
    this.completeMeetingButton = page.getByRole('button', { name: /complete/i });
    this.rescheduleMeetingButton = page.getByRole('button', { name: /reschedule/i });
    this.cancelMeetingButton = page.getByRole('button', { name: /cancel/i });

    // Initialize Feedback Elements
    this.giveFeedbackButton = page.getByRole('button', { name: /give.*feedback/i });
    this.feedbackTypeDropdown = page.getByLabel(/feedback.*type|type/i);
    this.feedbackRecipientSelect = page.getByLabel(/recipient/i);
    this.feedbackTextarea = page.getByLabel(/feedback/i);
    this.submitFeedbackButton = page.getByRole('button', { name: /submit.*feedback/i });

    // Initialize Toast Elements
    this.successToast = page.locator('[role="alert"]').filter({ hasText: /success/i });
    this.errorToast = page.locator('[role="alert"]').filter({ hasText: /error/i });
  }

  /**
   * Navigate to Performance page
   */
  async navigateToPerformance(): Promise<void> {
    await this.goto();
    await this.waitForPageLoad();
  }

  /**
   * Click Create Goal button
   */
  async clickCreateGoal(): Promise<void> {
    await this.click(this.createGoalButton);
    await this.waitForElement(this.goalTitleInput);
  }

  /**
   * Fill goal form
   */
  async fillGoalForm(data: GoalData): Promise<void> {
    await this.fill(this.goalTitleInput, data.title);
    await this.fill(this.goalDescriptionTextarea, data.description);
    await this.selectOption(this.goalCategoryDropdown, data.category);
    await this.selectOption(this.goalPriorityDropdown, data.priority);
    await this.fill(this.goalDueDateInput, data.dueDate);

    // Add key results
    for (const keyResult of data.keyResults) {
      await this.click(this.addKeyResultButton);
      const lastKeyResultInput = this.page.getByLabel(/key.*result/i).last();
      await this.fill(lastKeyResultInput, keyResult);
    }

    // Assign to employees if specified
    if (data.assignees) {
      for (const assignee of data.assignees) {
        await this.assigneesSelect.selectOption(assignee);
      }
    }
  }

  /**
   * Save goal
   */
  async saveGoal(): Promise<void> {
    await this.click(this.saveGoalButton);
    await this.waitForResponse(/\/api\/performance\/goals/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Create goal (complete flow)
   */
  async createGoal(data: GoalData): Promise<void> {
    await this.clickCreateGoal();
    await this.fillGoalForm(data);
    await this.saveGoal();
  }

  /**
   * Search for goals
   */
  async searchGoal(searchTerm: string): Promise<void> {
    await this.fill(this.searchGoalInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForResponse(/\/api\/performance\/goals\/search/);
  }

  /**
   * Navigate to Reviews tab
   */
  async navigateToReviews(): Promise<void> {
    await this.click(this.reviewsTab);
    await this.waitForElement(this.reviewsTable);
  }

  /**
   * Start performance review
   */
  async clickStartReview(): Promise<void> {
    await this.click(this.startReviewButton);
    await this.waitForElement(this.reviewPeriodDropdown);
  }

  /**
   * Fill performance review form
   */
  async fillPerformanceReview(data: PerformanceReviewData): Promise<void> {
    await this.selectOption(this.reviewPeriodDropdown, data.reviewPeriod);
    await this.selectOption(this.overallRatingSelect, data.overallRating.toString());
    await this.fill(this.strengthsTextarea, data.strengths);
    await this.fill(this.areasForImprovementTextarea, data.areasForImprovement);
    await this.fill(this.achievementsTextarea, data.achievements);
    await this.fill(this.futureGoalsTextarea, data.goals);
    await this.fill(this.commentsTextarea, data.comments);
  }

  /**
   * Submit performance review
   */
  async submitReview(): Promise<void> {
    await this.click(this.submitReviewButton);
    await this.waitForResponse(/\/api\/performance\/reviews/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Submit review (complete flow)
   */
  async submitPerformanceReview(data: PerformanceReviewData): Promise<void> {
    await this.clickStartReview();
    await this.fillPerformanceReview(data);
    await this.submitReview();
  }

  /**
   * Navigate to Meetings tab
   */
  async navigateToMeetings(): Promise<void> {
    await this.click(this.meetingsTab);
    await this.waitForElement(this.meetingsTable);
  }

  /**
   * Click Schedule Meeting button
   */
  async clickScheduleMeeting(): Promise<void> {
    await this.click(this.scheduleMeetingButton);
    await this.waitForElement(this.meetingTitleInput);
  }

  /**
   * Fill meeting form
   */
  async fillMeetingForm(data: MeetingData): Promise<void> {
    await this.fill(this.meetingTitleInput, data.title);
    await this.selectOption(this.selectEmployeeDropdown, data.employeeId);
    await this.fill(this.meetingDateInput, data.date);
    await this.fill(this.meetingTimeInput, data.time);
    await this.fill(this.meetingDurationInput, data.duration);
    await this.fill(this.meetingAgendaTextarea, data.agenda);
    await this.selectOption(this.meetingTypeDropdown, data.meetingType);

    if (data.location) {
      await this.fill(this.meetingLocationInput, data.location);
    }
  }

  /**
   * Confirm meeting
   */
  async confirmMeeting(): Promise<void> {
    await this.click(this.confirmMeetingButton);
    await this.waitForResponse(/\/api\/performance\/meetings/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Schedule one-on-one meeting (complete flow)
   */
  async scheduleOneOnOne(data: MeetingData): Promise<void> {
    await this.clickScheduleMeeting();
    await this.fillMeetingForm(data);
    await this.confirmMeeting();
  }

  /**
   * Click on a meeting to view details
   */
  async clickMeeting(index: number = 0): Promise<void> {
    const row = this.meetingsTable.locator('tbody tr').nth(index);
    await this.click(row);
    await this.waitForElement(this.meetingDetailsModal);
  }

  /**
   * Complete meeting with notes
   */
  async completeMeeting(notes: string, actionItems: string): Promise<void> {
    await this.fill(this.meetingNotesTextarea, notes);
    await this.fill(this.actionItemsTextarea, actionItems);
    await this.click(this.completeMeetingButton);
    await this.waitForResponse(/\/api\/performance\/meetings\/complete/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Cancel meeting
   */
  async cancelMeeting(reason?: string): Promise<void> {
    await this.click(this.cancelMeetingButton);
    if (reason) {
      const reasonTextarea = this.page.getByLabel(/reason/i);
      await this.fill(reasonTextarea, reason);
    }
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await this.click(confirmButton);
    await this.waitForResponse(/\/api\/performance\/meetings\/cancel/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Give feedback
   */
  async giveFeedback(type: string, recipient: string, feedback: string): Promise<void> {
    await this.click(this.giveFeedbackButton);
    await this.waitForElement(this.feedbackTypeDropdown);

    await this.selectOption(this.feedbackTypeDropdown, type);
    await this.selectOption(this.feedbackRecipientSelect, recipient);
    await this.fill(this.feedbackTextarea, feedback);

    await this.click(this.submitFeedbackButton);
    await this.waitForResponse(/\/api\/performance\/feedback/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Verify goal appears in list
   */
  async verifyGoalInList(goalTitle: string): Promise<void> {
    const goalElement = this.goalCard.filter({ hasText: goalTitle });
    await this.assertVisible(goalElement);
  }

  /**
   * Verify meeting appears in upcoming list
   */
  async verifyMeetingInUpcoming(meetingTitle: string): Promise<void> {
    const meeting = this.upcomingMeetings.locator('div').filter({ hasText: meetingTitle });
    await this.assertVisible(meeting);
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
   * Get goal count
   */
  async getGoalCount(): Promise<number> {
    return await this.goalCard.count();
  }

  /**
   * Get upcoming meetings count
   */
  async getUpcomingMeetingsCount(): Promise<number> {
    const meetings = this.upcomingMeetings.locator('[data-testid="meeting-item"]');
    return await meetings.count();
  }
}
