// Goal Management Services
import type {
  Goal,
  KeyResult,
  KeyResultUpdate,
  GoalCheckIn,
  GoalCycle,
  GoalTemplate,
  GoalAlignment,
  GoalReview,
  GoalAnalytics,
  GoalSettings,
  GoalMetrics,
  SMARTCriteria
} from './types';

const STORAGE_KEYS = {
  GOALS: 'goals',
  KEY_RESULTS: 'key_results',
  CHECK_INS: 'goal_check_ins',
  CYCLES: 'goal_cycles',
  TEMPLATES: 'goal_templates',
  ALIGNMENTS: 'goal_alignments',
  REVIEWS: 'goal_reviews',
  ANALYTICS: 'goal_analytics',
  SETTINGS: 'goal_settings',
};

export class GoalService {
  static async getGoals(filters?: { ownerId?: string; cycleId?: string; status?: string; type?: string }): Promise<Goal[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    let goals: Goal[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.ownerId) goals = goals.filter(g => g.ownerId === filters.ownerId);
      if (filters.cycleId) goals = goals.filter(g => g.cycleId === filters.cycleId);
      if (filters.status) goals = goals.filter(g => g.status === filters.status);
      if (filters.type) goals = goals.filter(g => g.goalType === filters.type);
    }

    return goals;
  }

  static async getGoalById(id: string): Promise<Goal | null> {
    const goals = await this.getGoals();
    return goals.find(g => g.id === id) || null;
  }

  static async createGoal(goal: Goal): Promise<Goal> {
    // TODO: Replace with actual API call

    // Validate SMART criteria if enabled
    if (goal.isSMART) {
      goal.smartCriteria = this.validateSMART(goal);
    }

    // Calculate initial metrics
    goal.metrics = this.calculateMetrics(goal);

    const goals = await this.getGoals();
    goals.push(goal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    return goal;
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    // TODO: Replace with actual API call
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');

    const updated = { ...goals[index], ...updates, lastModified: new Date().toISOString() };

    // Recalculate metrics
    updated.metrics = this.calculateMetrics(updated);

    // Update progress status based on progress
    updated.progressStatus = this.determineProgressStatus(updated);

    goals[index] = updated;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    return goals[index];
  }

  static async deleteGoal(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const goal = await this.getGoalById(id);
    if (!goal) throw new Error('Goal not found');

    if (goal.childGoals.length > 0) {
      throw new Error('Cannot delete goal with child goals');
    }

    const goals = await this.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
  }

  static async completeGoal(id: string): Promise<Goal> {
    const goal = await this.getGoalById(id);
    if (!goal) throw new Error('Goal not found');

    // Check if all key results are completed
    const incompleteKeyResults = goal.keyResults.filter(kr => !kr.isCompleted);
    if (incompleteKeyResults.length > 0) {
      throw new Error('All key results must be completed before completing the goal');
    }

    return this.updateGoal(id, {
      status: 'completed',
      progress: 100,
      actualCompletionDate: new Date().toISOString(),
      progressStatus: 'completed'
    });
  }

  static async addKeyResult(goalId: string, keyResult: KeyResult): Promise<Goal> {
    const goal = await this.getGoalById(goalId);
    if (!goal) throw new Error('Goal not found');

    goal.keyResults.push(keyResult);
    return this.updateGoal(goalId, { keyResults: goal.keyResults });
  }

  static async updateKeyResult(goalId: string, keyResultId: string, updates: Partial<KeyResult>): Promise<Goal> {
    const goal = await this.getGoalById(goalId);
    if (!goal) throw new Error('Goal not found');

    const krIndex = goal.keyResults.findIndex(kr => kr.id === keyResultId);
    if (krIndex === -1) throw new Error('Key result not found');

    goal.keyResults[krIndex] = {
      ...goal.keyResults[krIndex],
      ...updates,
      lastModified: new Date().toISOString()
    };

    // Recalculate key result progress
    const kr = goal.keyResults[krIndex];
    kr.progress = this.calculateKeyResultProgress(kr);

    // Recalculate overall goal progress
    const overallProgress = goal.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / goal.keyResults.length;

    return this.updateGoal(goalId, {
      keyResults: goal.keyResults,
      progress: overallProgress
    });
  }

  static async updateKeyResultValue(goalId: string, keyResultId: string, newValue: number, comment?: string, updatedBy?: string): Promise<Goal> {
    const goal = await this.getGoalById(goalId);
    if (!goal) throw new Error('Goal not found');

    const krIndex = goal.keyResults.findIndex(kr => kr.id === keyResultId);
    if (krIndex === -1) throw new Error('Key result not found');

    const kr = goal.keyResults[krIndex];

    // Add update to history
    const update: KeyResultUpdate = {
      id: `kru-${Date.now()}`,
      keyResultId,
      updateDate: new Date().toISOString(),
      previousValue: kr.currentValue,
      currentValue: newValue,
      progress: this.calculateKeyResultProgress({ ...kr, currentValue: newValue }),
      comment,
      updatedBy: updatedBy || goal.ownerId,
      updatedByName: goal.ownerName
    };

    kr.updates.push(update);
    kr.currentValue = newValue;
    kr.progress = update.progress;
    kr.lastUpdateDate = update.updateDate;

    // Check if completed
    if (kr.currentValue >= kr.targetValue) {
      kr.isCompleted = true;
      kr.completedDate = new Date().toISOString();
      kr.status = 'completed';
    }

    return this.updateGoal(goalId, { keyResults: goal.keyResults });
  }

  private static calculateKeyResultProgress(keyResult: KeyResult): number {
    if (keyResult.measurementType === 'boolean') {
      return keyResult.currentValue >= keyResult.targetValue ? 100 : 0;
    }

    const range = keyResult.targetValue - keyResult.startValue;
    if (range === 0) return 100;

    const progress = ((keyResult.currentValue - keyResult.startValue) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  private static calculateMetrics(goal: Goal): GoalMetrics {
    const now = new Date();
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();

    const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const percentTimeElapsed = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

    const completedKRs = goal.keyResults.filter(kr => kr.isCompleted).length;
    const averageProgress = goal.keyResults.length > 0
      ? goal.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / goal.keyResults.length
      : 0;

    const isAhead = goal.progress > percentTimeElapsed;
    const isBehind = goal.progress < percentTimeElapsed - 10;

    // Health score calculation
    let healthScore = 70;
    if (isAhead) healthScore += 20;
    if (isBehind) healthScore -= 30;
    if (goal.checkIns.length > 0) healthScore += 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalKeyResults: goal.keyResults.length,
      completedKeyResults: completedKRs,
      keyResultCompletionRate: goal.keyResults.length > 0 ? (completedKRs / goal.keyResults.length) * 100 : 0,
      averageProgress,
      daysRemaining,
      daysElapsed,
      percentTimeElapsed,
      isAhead,
      isBehind,
      healthScore
    };
  }

  private static determineProgressStatus(goal: Goal): any {
    if (goal.status === 'completed') return 'completed';
    if (goal.progress === 0) return 'not_started';
    if (goal.metrics.isBehind) return 'behind';
    if (goal.progress < goal.metrics.percentTimeElapsed - 5) return 'at_risk';
    if (goal.progress >= 90) return 'on_track';
    return 'in_progress';
  }

  private static validateSMART(goal: Goal): SMARTCriteria {
    const criteria: SMARTCriteria = {
      specific: false,
      measurable: false,
      achievable: false,
      relevant: false,
      timeBound: false,
      score: 0,
      feedback: []
    };

    // Specific: Has clear title and description
    if (goal.title.length > 10 && goal.description.length > 20) {
      criteria.specific = true;
    } else {
      criteria.feedback.push('Goal should have a clear, specific title and detailed description');
    }

    // Measurable: Has key results with metrics
    if (goal.keyResults.length > 0) {
      criteria.measurable = true;
    } else {
      criteria.feedback.push('Goal should have measurable key results');
    }

    // Achievable: Has reasonable timeline and resources
    if (goal.startDate && goal.endDate) {
      const duration = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      if (days >= 7 && days <= 365) {
        criteria.achievable = true;
      } else {
        criteria.feedback.push('Goal timeline should be realistic (between 1 week and 1 year)');
      }
    }

    // Relevant: Has category and alignment
    if (goal.category && (goal.parentGoalId || goal.alignedGoals.length > 0)) {
      criteria.relevant = true;
    } else {
      criteria.feedback.push('Goal should be aligned with broader objectives');
    }

    // Time-bound: Has clear deadline
    if (goal.targetCompletionDate) {
      criteria.timeBound = true;
    } else {
      criteria.feedback.push('Goal should have a specific completion date');
    }

    // Calculate score
    criteria.score = [
      criteria.specific,
      criteria.measurable,
      criteria.achievable,
      criteria.relevant,
      criteria.timeBound
    ].filter(Boolean).length * 20;

    return criteria;
  }
}

export class GoalCheckInService {
  static async getCheckIns(goalId?: string): Promise<GoalCheckIn[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
    let checkIns: GoalCheckIn[] = data ? JSON.parse(data) : [];

    if (goalId) {
      checkIns = checkIns.filter(c => c.goalId === goalId);
    }

    return checkIns;
  }

  static async createCheckIn(checkIn: GoalCheckIn): Promise<GoalCheckIn> {
    // TODO: Replace with actual API call
    const checkIns = await this.getCheckIns();
    checkIns.push(checkIn);
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));

    // Update goal progress based on check-in
    const goal = await GoalService.getGoalById(checkIn.goalId);
    if (goal) {
      // Update key results from check-in
      for (const krUpdate of checkIn.keyResultUpdates) {
        await GoalService.updateKeyResultValue(
          checkIn.goalId,
          krUpdate.keyResultId,
          krUpdate.value,
          krUpdate.comment,
          checkIn.submittedBy
        );
      }

      // Update goal check-in data
      const updatedGoal = await GoalService.getGoalById(checkIn.goalId);
      if (updatedGoal) {
        updatedGoal.checkIns.push(checkIn);
        updatedGoal.lastCheckInDate = checkIn.checkInDate;

        // Calculate next check-in date
        const nextDate = new Date(checkIn.checkInDate);
        switch (updatedGoal.checkInFrequency) {
          case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
          case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
          case 'bi_weekly': nextDate.setDate(nextDate.getDate() + 14); break;
          case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
          case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
        }
        updatedGoal.nextCheckInDate = nextDate.toISOString();

        await GoalService.updateGoal(checkIn.goalId, {
          checkIns: updatedGoal.checkIns,
          lastCheckInDate: updatedGoal.lastCheckInDate,
          nextCheckInDate: updatedGoal.nextCheckInDate,
          progress: checkIn.progress,
          progressStatus: checkIn.status
        });
      }
    }

    return checkIn;
  }

  static async addFeedback(checkInId: string, feedback: any): Promise<GoalCheckIn> {
    // TODO: Replace with actual API call
    const checkIns = await this.getCheckIns();
    const index = checkIns.findIndex(c => c.id === checkInId);
    if (index === -1) throw new Error('Check-in not found');

    checkIns[index].feedback = feedback;
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));

    return checkIns[index];
  }
}

export class GoalCycleService {
  static async getCycles(filters?: { isActive?: boolean }): Promise<GoalCycle[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CYCLES);
    let cycles: GoalCycle[] = data ? JSON.parse(data) : [];

    if (filters?.isActive !== undefined) {
      cycles = cycles.filter(c => c.isActive === filters.isActive);
    }

    return cycles;
  }

  static async createCycle(cycle: GoalCycle): Promise<GoalCycle> {
    // TODO: Replace with actual API call
    const cycles = await this.getCycles();
    cycles.push(cycle);
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    return cycle;
  }

  static async updateCycle(id: string, updates: Partial<GoalCycle>): Promise<GoalCycle> {
    // TODO: Replace with actual API call
    const cycles = await this.getCycles();
    const index = cycles.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cycle not found');

    cycles[index] = { ...cycles[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    return cycles[index];
  }

  static async deleteCycle(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const cycles = await this.getCycles();
    const filtered = cycles.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(filtered));
  }

  static async activateCycle(id: string): Promise<GoalCycle> {
    // Deactivate all other cycles
    const cycles = await this.getCycles();
    for (const cycle of cycles) {
      if (cycle.id !== id && cycle.isActive) {
        await this.updateCycle(cycle.id, { isActive: false, status: 'completed' });
      }
    }

    return this.updateCycle(id, { isActive: true, status: 'active' });
  }
}

export class GoalTemplateService {
  static async getTemplates(filters?: { goalType?: string; isPublic?: boolean }): Promise<GoalTemplate[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    let templates: GoalTemplate[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.goalType) templates = templates.filter(t => t.goalType === filters.goalType);
      if (filters.isPublic !== undefined) templates = templates.filter(t => t.isPublic === filters.isPublic);
    }

    return templates;
  }

  static async createTemplate(template: GoalTemplate): Promise<GoalTemplate> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    templates.push(template);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return template;
  }

  static async updateTemplate(id: string, updates: Partial<GoalTemplate>): Promise<GoalTemplate> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');

    templates[index] = { ...templates[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return templates[index];
  }

  static async deleteTemplate(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  }
}

export class GoalAlignmentService {
  static async getAlignments(filters?: { sourceGoalId?: string; targetGoalId?: string }): Promise<GoalAlignment[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ALIGNMENTS);
    let alignments: GoalAlignment[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.sourceGoalId) alignments = alignments.filter(a => a.sourceGoalId === filters.sourceGoalId);
      if (filters.targetGoalId) alignments = alignments.filter(a => a.targetGoalId === filters.targetGoalId);
    }

    return alignments;
  }

  static async createAlignment(alignment: GoalAlignment): Promise<GoalAlignment> {
    // TODO: Replace with actual API call
    const alignments = await this.getAlignments();
    alignments.push(alignment);
    localStorage.setItem(STORAGE_KEYS.ALIGNMENTS, JSON.stringify(alignments));

    // Update aligned goals list
    const sourceGoal = await GoalService.getGoalById(alignment.sourceGoalId);
    if (sourceGoal) {
      sourceGoal.alignedGoals.push(alignment.targetGoalId);
      await GoalService.updateGoal(alignment.sourceGoalId, { alignedGoals: sourceGoal.alignedGoals });
    }

    return alignment;
  }

  static async deleteAlignment(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const alignments = await this.getAlignments();
    const alignment = alignments.find(a => a.id === id);

    if (alignment) {
      // Remove from aligned goals list
      const sourceGoal = await GoalService.getGoalById(alignment.sourceGoalId);
      if (sourceGoal) {
        sourceGoal.alignedGoals = sourceGoal.alignedGoals.filter(id => id !== alignment.targetGoalId);
        await GoalService.updateGoal(alignment.sourceGoalId, { alignedGoals: sourceGoal.alignedGoals });
      }
    }

    const filtered = alignments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ALIGNMENTS, JSON.stringify(filtered));
  }

  static async cascadeGoal(parentGoalId: string, childGoal: Partial<Goal>): Promise<Goal> {
    const parentGoal = await GoalService.getGoalById(parentGoalId);
    if (!parentGoal) throw new Error('Parent goal not found');

    const cascadedGoal: Goal = {
      ...childGoal as Goal,
      parentGoalId,
      parentGoalTitle: parentGoal.title,
      cycleId: parentGoal.cycleId,
      cycleName: parentGoal.cycleName
    };

    const created = await GoalService.createGoal(cascadedGoal);

    // Update parent goal
    parentGoal.childGoals.push(created.id);
    await GoalService.updateGoal(parentGoalId, { childGoals: parentGoal.childGoals });

    // Create alignment
    await this.createAlignment({
      id: `align-${Date.now()}`,
      sourceGoalId: created.id,
      sourceGoalTitle: created.title,
      targetGoalId: parentGoalId,
      targetGoalTitle: parentGoal.title,
      alignmentType: 'cascaded',
      alignmentStrength: 'strong',
      createdBy: created.ownerId,
      createdDate: new Date().toISOString()
    });

    return created;
  }
}

export class GoalReviewService {
  static async getReviews(filters?: { goalId?: string }): Promise<GoalReview[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    let reviews: GoalReview[] = data ? JSON.parse(data) : [];

    if (filters?.goalId) {
      reviews = reviews.filter(r => r.goalId === filters.goalId);
    }

    return reviews;
  }

  static async createReview(review: GoalReview): Promise<GoalReview> {
    // TODO: Replace with actual API call
    const reviews = await this.getReviews();
    reviews.push(review);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return review;
  }

  static async acknowledgeReview(id: string, acknowledgedBy: string): Promise<GoalReview> {
    // TODO: Replace with actual API call
    const reviews = await this.getReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Review not found');

    reviews[index].status = 'acknowledged';
    reviews[index].acknowledgedBy = acknowledgedBy;
    reviews[index].acknowledgedDate = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return reviews[index];
  }
}

export class GoalAnalyticsService {
  static async getAnalytics(): Promise<GoalAnalytics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return data ? JSON.parse(data) : {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      onTrackGoals: 0,
      atRiskGoals: 0,
      behindGoals: 0,
      averageProgress: 0,
      completionRate: 0,
      averageHealthScore: 0,
      goalsByType: [],
      goalsByCategory: [],
      goalsByStatus: [],
      goalsByDepartment: [],
      topPerformers: [],
      alignmentScore: 0,
      checkInCompliance: 0,
      averageCheckInFrequency: 0,
      cycleProgress: [],
      keyResultMetrics: {
        totalKeyResults: 0,
        completedKeyResults: 0,
        completionRate: 0,
        averageProgress: 0
      },
      trends: []
    };
  }
}

export class GoalSettingsService {
  static async getSettings(): Promise<GoalSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableGoalManagement: true,
      enableOKRs: true,
      enableGoalAlignment: true,
      enableGoalTemplates: true,
      requireGoalApproval: false,
      approvalRequired: false,
      approvalLevels: 1,
      defaultCycleDuration: 90,
      defaultCheckInFrequency: 'weekly',
      mandatoryCheckIns: false,
      checkInReminderDays: 1,
      enablePrivateGoals: true,
      enableGoalCollaboration: true,
      enableGoalComments: true,
      enableGoalReviews: true,
      enableSMARTValidation: true,
      minKeyResults: 1,
      maxKeyResults: 5,
      defaultGoalVisibility: 'team',
      allowCascading: true,
      maxGoalDepth: 5,
      enableNotifications: true,
      notifyOnCheckInDue: true,
      notifyOnGoalDue: true,
      notifyOnFeedback: true,
      goalDueSoonDays: 7,
      enableGoalWeighting: false,
      enableRiskTracking: true,
      enableDependencyTracking: true,
      fiscalYearStart: '01-01',
      defaultCurrency: 'USD'
    };
  }

  static async updateSettings(updates: Partial<GoalSettings>): Promise<GoalSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
