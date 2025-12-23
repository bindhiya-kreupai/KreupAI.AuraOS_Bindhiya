/**
 * Performance Prediction Service
 * Phase 3: Intelligence Layer - Predictive Analytics
 *
 * AI-powered performance forecasting, goal tracking,
 * and development recommendations
 */

import {
  PerformancePrediction,
  EmployeePerformanceData,
  GoalPrediction,
  DevelopmentRecommendation,
} from './types';

/**
 * Performance indicator weights
 */
const PERFORMANCE_WEIGHTS = {
  historicalPerformance: 0.25,    // Past performance ratings
  goalCompletion: 0.20,          // Goal achievement rate
  skillDevelopment: 0.15,        // Learning & growth
  attendance: 0.10,              // Attendance patterns
  collaboration: 0.10,           // Team collaboration score
  qualityOfWork: 0.10,           // Quality metrics
  initiative: 0.05,              // Proactive contributions
  feedback: 0.05,                // 360 feedback scores
};

/**
 * Performance rating scale
 */
const RATING_SCALE = {
  EXCEPTIONAL: { min: 90, max: 100, label: 'Exceptional', labelAr: 'استثنائي' },
  EXCEEDS: { min: 75, max: 89, label: 'Exceeds Expectations', labelAr: 'يفوق التوقعات' },
  MEETS: { min: 60, max: 74, label: 'Meets Expectations', labelAr: 'يلبي التوقعات' },
  DEVELOPING: { min: 40, max: 59, label: 'Developing', labelAr: 'قيد التطوير' },
  NEEDS_IMPROVEMENT: { min: 0, max: 39, label: 'Needs Improvement', labelAr: 'يحتاج تحسين' },
};

/**
 * Performance Prediction Service
 */
export class PerformancePredictionService {
  /**
   * Predict next review performance
   */
  static async predictPerformance(
    employeeData: EmployeePerformanceData
  ): Promise<PerformancePrediction> {
    const factors: PerformancePrediction['contributingFactors'] = [];
    let weightedScore = 0;

    // Historical Performance (25%)
    const historicalScore = this.calculateHistoricalScore(employeeData.performanceHistory);
    weightedScore += historicalScore * PERFORMANCE_WEIGHTS.historicalPerformance;
    factors.push({
      factor: 'Historical Performance',
      factorAr: 'الأداء التاريخي',
      impact: historicalScore >= 70 ? 'POSITIVE' : historicalScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: historicalScore,
      weight: PERFORMANCE_WEIGHTS.historicalPerformance,
      details: `Average rating: ${Math.round(historicalScore)}%`,
    });

    // Goal Completion (20%)
    const goalScore = this.calculateGoalScore(employeeData.goals);
    weightedScore += goalScore * PERFORMANCE_WEIGHTS.goalCompletion;
    factors.push({
      factor: 'Goal Achievement',
      factorAr: 'تحقيق الأهداف',
      impact: goalScore >= 70 ? 'POSITIVE' : goalScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: goalScore,
      weight: PERFORMANCE_WEIGHTS.goalCompletion,
      details: `${employeeData.goals.filter(g => g.status === 'COMPLETED').length}/${employeeData.goals.length} goals completed`,
    });

    // Skill Development (15%)
    const skillScore = this.calculateSkillScore(employeeData.skillAssessments);
    weightedScore += skillScore * PERFORMANCE_WEIGHTS.skillDevelopment;
    factors.push({
      factor: 'Skill Development',
      factorAr: 'تطوير المهارات',
      impact: skillScore >= 70 ? 'POSITIVE' : skillScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: skillScore,
      weight: PERFORMANCE_WEIGHTS.skillDevelopment,
      details: `Skill improvement: ${Math.round(skillScore - 50)}% from baseline`,
    });

    // Attendance (10%)
    const attendanceScore = this.calculateAttendanceScore(employeeData.attendanceData);
    weightedScore += attendanceScore * PERFORMANCE_WEIGHTS.attendance;
    factors.push({
      factor: 'Attendance',
      factorAr: 'الحضور',
      impact: attendanceScore >= 70 ? 'POSITIVE' : attendanceScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: attendanceScore,
      weight: PERFORMANCE_WEIGHTS.attendance,
      details: `Attendance rate: ${Math.round(attendanceScore)}%`,
    });

    // Collaboration (10%)
    const collaborationScore = employeeData.collaborationScore || 70;
    weightedScore += collaborationScore * PERFORMANCE_WEIGHTS.collaboration;
    factors.push({
      factor: 'Team Collaboration',
      factorAr: 'التعاون مع الفريق',
      impact: collaborationScore >= 70 ? 'POSITIVE' : collaborationScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: collaborationScore,
      weight: PERFORMANCE_WEIGHTS.collaboration,
      details: `Collaboration score: ${collaborationScore}%`,
    });

    // Quality of Work (10%)
    const qualityScore = employeeData.qualityMetrics?.overallScore || 70;
    weightedScore += qualityScore * PERFORMANCE_WEIGHTS.qualityOfWork;
    factors.push({
      factor: 'Quality of Work',
      factorAr: 'جودة العمل',
      impact: qualityScore >= 70 ? 'POSITIVE' : qualityScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: qualityScore,
      weight: PERFORMANCE_WEIGHTS.qualityOfWork,
      details: `Quality score: ${qualityScore}%`,
    });

    // Initiative (5%)
    const initiativeScore = employeeData.initiativeScore || 60;
    weightedScore += initiativeScore * PERFORMANCE_WEIGHTS.initiative;
    factors.push({
      factor: 'Initiative',
      factorAr: 'المبادرة',
      impact: initiativeScore >= 70 ? 'POSITIVE' : initiativeScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: initiativeScore,
      weight: PERFORMANCE_WEIGHTS.initiative,
      details: `Initiative score: ${initiativeScore}%`,
    });

    // 360 Feedback (5%)
    const feedbackScore = this.calculateFeedbackScore(employeeData.feedbackScores);
    weightedScore += feedbackScore * PERFORMANCE_WEIGHTS.feedback;
    factors.push({
      factor: '360 Feedback',
      factorAr: 'التغذية الراجعة',
      impact: feedbackScore >= 70 ? 'POSITIVE' : feedbackScore >= 50 ? 'NEUTRAL' : 'NEGATIVE',
      score: feedbackScore,
      weight: PERFORMANCE_WEIGHTS.feedback,
      details: `Feedback score: ${Math.round(feedbackScore)}%`,
    });

    // Calculate prediction confidence
    const confidence = this.calculateConfidence(employeeData);

    // Calculate trend
    const trend = this.calculateTrend(employeeData.performanceHistory);

    // Determine rating
    const predictedScore = Math.round(weightedScore);
    const rating = this.determineRating(predictedScore);

    return {
      employeeId: employeeData.employeeId,
      predictedScore,
      predictedRating: rating.label,
      predictedRatingAr: rating.labelAr,
      confidence,
      trend,
      contributingFactors: factors.sort((a, b) => b.score * b.weight - a.score * a.weight),
      recommendations: this.generateRecommendations(factors, employeeData),
      nextReviewDate: this.calculateNextReviewDate(),
      predictedAt: new Date(),
    };
  }

  /**
   * Calculate historical performance score
   */
  private static calculateHistoricalScore(
    history: EmployeePerformanceData['performanceHistory']
  ): number {
    if (!history || history.length === 0) return 60;

    // Weight recent reviews more heavily
    const weights = history.map((_, i) => Math.pow(0.8, history.length - 1 - i));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const weightedSum = history.reduce((sum, review, i) => {
      return sum + (review.rating * weights[i]);
    }, 0);

    return (weightedSum / totalWeight) * 20; // Normalize to 0-100
  }

  /**
   * Calculate goal completion score
   */
  private static calculateGoalScore(
    goals: EmployeePerformanceData['goals']
  ): number {
    if (!goals || goals.length === 0) return 60;

    const weights = {
      COMPLETED: 100,
      ON_TRACK: 75,
      AT_RISK: 40,
      BEHIND: 20,
      NOT_STARTED: 0,
    };

    const totalScore = goals.reduce((sum, goal) => {
      const statusScore = weights[goal.status] || 0;
      const progressBonus = goal.progress * 0.3; // Up to 30% bonus for progress
      return sum + statusScore + progressBonus;
    }, 0);

    return Math.min(100, totalScore / goals.length);
  }

  /**
   * Calculate skill development score
   */
  private static calculateSkillScore(
    assessments: EmployeePerformanceData['skillAssessments']
  ): number {
    if (!assessments || assessments.length === 0) return 50;

    // Look for skills that have improved
    const skillProgress: Record<string, number[]> = {};

    assessments.forEach(assessment => {
      if (!skillProgress[assessment.skillName]) {
        skillProgress[assessment.skillName] = [];
      }
      skillProgress[assessment.skillName].push(assessment.score);
    });

    let improvementScore = 0;
    let skillCount = 0;

    for (const [_, scores] of Object.entries(skillProgress)) {
      if (scores.length >= 2) {
        const improvement = scores[scores.length - 1] - scores[0];
        improvementScore += improvement > 0 ? Math.min(100, 50 + improvement) : 50 + improvement;
        skillCount++;
      } else {
        improvementScore += scores[0] || 50;
        skillCount++;
      }
    }

    return skillCount > 0 ? improvementScore / skillCount : 50;
  }

  /**
   * Calculate attendance score
   */
  private static calculateAttendanceScore(
    attendanceData: EmployeePerformanceData['attendanceData']
  ): number {
    if (!attendanceData) return 85;

    const {
      attendanceRate = 95,
      punctualityRate = 90,
      unexcusedAbsences = 0,
    } = attendanceData;

    // Attendance rate (60% weight)
    let score = attendanceRate * 0.6;

    // Punctuality (30% weight)
    score += punctualityRate * 0.3;

    // Unexcused absences penalty (10% weight)
    const absencePenalty = Math.max(0, 100 - (unexcusedAbsences * 20));
    score += absencePenalty * 0.1;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate 360 feedback score
   */
  private static calculateFeedbackScore(
    feedbackScores: EmployeePerformanceData['feedbackScores']
  ): number {
    if (!feedbackScores) return 70;

    const weights = {
      manager: 0.40,
      peers: 0.25,
      directReports: 0.20,
      self: 0.15,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const [source, weight] of Object.entries(weights)) {
      const score = (feedbackScores as any)[source];
      if (score !== undefined) {
        weightedSum += score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 70;
  }

  /**
   * Calculate prediction confidence
   */
  private static calculateConfidence(data: EmployeePerformanceData): number {
    let confidence = 0;
    let factors = 0;

    // More historical data = higher confidence
    if (data.performanceHistory.length >= 3) {
      confidence += 25;
    } else if (data.performanceHistory.length >= 1) {
      confidence += 15;
    }
    factors++;

    // Goals data
    if (data.goals.length > 0) {
      confidence += 20;
    }
    factors++;

    // Skill assessments
    if (data.skillAssessments.length > 0) {
      confidence += 15;
    }
    factors++;

    // Attendance data
    if (data.attendanceData) {
      confidence += 15;
    }
    factors++;

    // Feedback scores
    if (data.feedbackScores) {
      confidence += 15;
    }
    factors++;

    // Tenure bonus
    if (data.tenureMonths && data.tenureMonths >= 12) {
      confidence += 10;
    }
    factors++;

    return Math.min(95, confidence);
  }

  /**
   * Calculate performance trend
   */
  private static calculateTrend(
    history: EmployeePerformanceData['performanceHistory']
  ): PerformancePrediction['trend'] {
    if (!history || history.length < 2) return 'STABLE';

    // Compare last two reviews
    const recent = history[history.length - 1].rating;
    const previous = history[history.length - 2].rating;

    const change = recent - previous;

    if (change >= 0.5) return 'IMPROVING';
    if (change <= -0.5) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Determine rating category from score
   */
  private static determineRating(score: number): typeof RATING_SCALE[keyof typeof RATING_SCALE] {
    for (const rating of Object.values(RATING_SCALE)) {
      if (score >= rating.min && score <= rating.max) {
        return rating;
      }
    }
    return RATING_SCALE.MEETS;
  }

  /**
   * Calculate next review date
   */
  private static calculateNextReviewDate(): Date {
    const now = new Date();
    const currentMonth = now.getMonth();

    // Quarterly reviews: March, June, September, December
    const reviewMonths = [2, 5, 8, 11];
    let nextReviewMonth = reviewMonths.find(m => m > currentMonth);

    if (nextReviewMonth === undefined) {
      nextReviewMonth = 2; // Next March
      now.setFullYear(now.getFullYear() + 1);
    }

    now.setMonth(nextReviewMonth);
    now.setDate(15);

    return now;
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(
    factors: PerformancePrediction['contributingFactors'],
    data: EmployeePerformanceData
  ): DevelopmentRecommendation[] {
    const recommendations: DevelopmentRecommendation[] = [];

    // Identify areas needing improvement (score < 60)
    const weakAreas = factors.filter(f => f.score < 60);

    for (const area of weakAreas) {
      const rec = this.getRecommendation(area.factor, area.score, data);
      if (rec) recommendations.push(rec);
    }

    // Add skill-based recommendations
    const skillGaps = this.identifySkillGaps(data.skillAssessments);
    for (const gap of skillGaps.slice(0, 2)) {
      recommendations.push({
        type: 'TRAINING',
        priority: 'MEDIUM',
        title: `Develop ${gap.skillName}`,
        titleAr: `تطوير ${gap.skillName}`,
        description: `Current proficiency: ${gap.currentLevel}. Target: ${gap.targetLevel}`,
        descriptionAr: `المستوى الحالي: ${gap.currentLevel}. الهدف: ${gap.targetLevel}`,
        suggestedActions: [
          `Complete online course for ${gap.skillName}`,
          'Practice through hands-on projects',
          'Seek mentorship from experienced colleagues',
        ],
        estimatedDuration: '2-3 months',
      });
    }

    // Add goal-related recommendations
    const atRiskGoals = data.goals.filter(g => g.status === 'AT_RISK' || g.status === 'BEHIND');
    if (atRiskGoals.length > 0) {
      recommendations.push({
        type: 'GOAL_ADJUSTMENT',
        priority: 'HIGH',
        title: 'Review At-Risk Goals',
        titleAr: 'مراجعة الأهداف المعرضة للخطر',
        description: `${atRiskGoals.length} goals are at risk of not being completed`,
        descriptionAr: `${atRiskGoals.length} أهداف معرضة لخطر عدم الإكمال`,
        suggestedActions: [
          'Schedule meeting with manager to discuss blockers',
          'Break down goals into smaller milestones',
          'Identify resources needed for completion',
        ],
        estimatedDuration: '1 week',
      });
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Get recommendation for specific area
   */
  private static getRecommendation(
    area: string,
    score: number,
    data: EmployeePerformanceData
  ): DevelopmentRecommendation | null {
    const recommendations: Record<string, DevelopmentRecommendation> = {
      'Goal Achievement': {
        type: 'GOAL_ADJUSTMENT',
        priority: 'HIGH',
        title: 'Improve Goal Management',
        titleAr: 'تحسين إدارة الأهداف',
        description: 'Focus on setting SMART goals and regular progress tracking',
        descriptionAr: 'التركيز على وضع أهداف ذكية ومتابعة التقدم بانتظام',
        suggestedActions: [
          'Use SMART criteria for goal setting',
          'Schedule weekly progress check-ins',
          'Break large goals into smaller milestones',
        ],
        estimatedDuration: 'Ongoing',
      },
      'Skill Development': {
        type: 'TRAINING',
        priority: 'MEDIUM',
        title: 'Accelerate Skill Development',
        titleAr: 'تسريع تطوير المهارات',
        description: 'Invest in continuous learning and skill enhancement',
        descriptionAr: 'الاستثمار في التعلم المستمر وتعزيز المهارات',
        suggestedActions: [
          'Create a personal development plan',
          'Allocate 2-3 hours weekly for learning',
          'Join relevant professional communities',
        ],
        estimatedDuration: '3-6 months',
      },
      'Attendance': {
        type: 'BEHAVIORAL',
        priority: 'HIGH',
        title: 'Improve Attendance & Punctuality',
        titleAr: 'تحسين الحضور والالتزام بالمواعيد',
        description: 'Address attendance patterns to meet expectations',
        descriptionAr: 'معالجة أنماط الحضور لتلبية التوقعات',
        suggestedActions: [
          'Review and address any personal scheduling issues',
          'Set multiple alarms if punctuality is an issue',
          'Communicate proactively about any expected absences',
        ],
        estimatedDuration: 'Immediate',
      },
      'Team Collaboration': {
        type: 'BEHAVIORAL',
        priority: 'MEDIUM',
        title: 'Enhance Team Collaboration',
        titleAr: 'تعزيز التعاون مع الفريق',
        description: 'Build stronger working relationships with colleagues',
        descriptionAr: 'بناء علاقات عمل أقوى مع الزملاء',
        suggestedActions: [
          'Participate more actively in team meetings',
          'Offer help to colleagues when possible',
          'Share knowledge and best practices',
        ],
        estimatedDuration: '1-2 months',
      },
      'Initiative': {
        type: 'ASSIGNMENT',
        priority: 'LOW',
        title: 'Take More Initiative',
        titleAr: 'أخذ المزيد من المبادرة',
        description: 'Look for opportunities to contribute beyond assigned tasks',
        descriptionAr: 'البحث عن فرص للمساهمة بما يتجاوز المهام المعينة',
        suggestedActions: [
          'Propose process improvements',
          'Volunteer for new projects',
          'Mentor junior team members',
        ],
        estimatedDuration: 'Ongoing',
      },
    };

    return recommendations[area] || null;
  }

  /**
   * Identify skill gaps
   */
  private static identifySkillGaps(
    assessments: EmployeePerformanceData['skillAssessments']
  ): Array<{ skillName: string; currentLevel: number; targetLevel: number }> {
    if (!assessments || assessments.length === 0) return [];

    const latestAssessments = new Map<string, { score: number; target: number }>();

    // Get latest assessment for each skill
    for (const assessment of assessments) {
      const existing = latestAssessments.get(assessment.skillName);
      if (!existing || assessment.date > (existing as any).date) {
        latestAssessments.set(assessment.skillName, {
          score: assessment.score,
          target: assessment.targetScore || 80,
        });
      }
    }

    // Find gaps
    const gaps: Array<{ skillName: string; currentLevel: number; targetLevel: number }> = [];

    for (const [skillName, data] of latestAssessments) {
      if (data.score < data.target) {
        gaps.push({
          skillName,
          currentLevel: data.score,
          targetLevel: data.target,
        });
      }
    }

    return gaps.sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel));
  }

  /**
   * Predict goal completion
   */
  static async predictGoalCompletion(
    goal: EmployeePerformanceData['goals'][0]
  ): Promise<GoalPrediction> {
    const now = new Date();
    const dueDate = new Date(goal.dueDate);
    const totalDays = Math.ceil((dueDate.getTime() - new Date(goal.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate required daily progress
    const remainingProgress = 100 - goal.progress;
    const requiredDailyProgress = remainingDays > 0 ? remainingProgress / remainingDays : remainingProgress;

    // Estimate actual daily progress (based on current progress and time elapsed)
    const elapsedDays = totalDays - remainingDays;
    const actualDailyProgress = elapsedDays > 0 ? goal.progress / elapsedDays : 0;

    // Predict completion likelihood
    let completionLikelihood: number;
    if (actualDailyProgress >= requiredDailyProgress) {
      completionLikelihood = Math.min(95, 70 + (actualDailyProgress / requiredDailyProgress) * 25);
    } else {
      completionLikelihood = Math.max(5, (actualDailyProgress / requiredDailyProgress) * 70);
    }

    // Adjust for goal status
    const statusAdjustments: Record<string, number> = {
      COMPLETED: 100,
      ON_TRACK: 10,
      AT_RISK: -15,
      BEHIND: -25,
      NOT_STARTED: -30,
    };
    completionLikelihood += statusAdjustments[goal.status] || 0;
    completionLikelihood = Math.max(0, Math.min(100, completionLikelihood));

    // Predict completion date
    let predictedCompletionDate: Date | undefined;
    if (actualDailyProgress > 0) {
      const daysToComplete = remainingProgress / actualDailyProgress;
      predictedCompletionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
    }

    // Generate risks
    const risks: string[] = [];
    if (goal.status === 'BEHIND') risks.push('Goal is significantly behind schedule');
    if (goal.status === 'AT_RISK') risks.push('Goal progress has slowed');
    if (remainingDays < 7 && goal.progress < 80) risks.push('Limited time remaining');
    if (requiredDailyProgress > actualDailyProgress * 2) risks.push('Current pace insufficient');

    return {
      goalId: goal.id,
      currentProgress: goal.progress,
      targetProgress: 100,
      completionLikelihood: Math.round(completionLikelihood),
      predictedCompletionDate,
      isOnTrack: goal.status === 'ON_TRACK' || goal.status === 'COMPLETED',
      risks,
      recommendations: this.getGoalRecommendations(goal, completionLikelihood),
    };
  }

  /**
   * Get recommendations for goal completion
   */
  private static getGoalRecommendations(
    goal: EmployeePerformanceData['goals'][0],
    likelihood: number
  ): string[] {
    const recommendations: string[] = [];

    if (likelihood < 50) {
      recommendations.push('Request a goal review meeting with manager');
      recommendations.push('Consider breaking goal into smaller milestones');
      recommendations.push('Identify and address blockers immediately');
    } else if (likelihood < 75) {
      recommendations.push('Increase focus on this goal');
      recommendations.push('Schedule daily progress check-ins');
      recommendations.push('Reduce scope if possible to meet deadline');
    } else {
      recommendations.push('Maintain current pace');
      recommendations.push('Document learnings for future reference');
    }

    return recommendations;
  }

  /**
   * Generate team performance insights
   */
  static async getTeamInsights(
    teamData: EmployeePerformanceData[]
  ): Promise<{
    averageScore: number;
    distribution: Record<string, number>;
    topPerformers: string[];
    needsAttention: string[];
    teamTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    insights: string[];
  }> {
    // Calculate predictions for all team members
    const predictions = await Promise.all(
      teamData.map(emp => this.predictPerformance(emp))
    );

    // Calculate average
    const averageScore = predictions.reduce((sum, p) => sum + p.predictedScore, 0) / predictions.length;

    // Distribution
    const distribution: Record<string, number> = {
      EXCEPTIONAL: 0,
      EXCEEDS: 0,
      MEETS: 0,
      DEVELOPING: 0,
      NEEDS_IMPROVEMENT: 0,
    };

    for (const pred of predictions) {
      for (const [key, rating] of Object.entries(RATING_SCALE)) {
        if (pred.predictedScore >= rating.min && pred.predictedScore <= rating.max) {
          distribution[key]++;
          break;
        }
      }
    }

    // Top performers (top 20%)
    const sorted = [...predictions].sort((a, b) => b.predictedScore - a.predictedScore);
    const topCount = Math.max(1, Math.ceil(predictions.length * 0.2));
    const topPerformers = sorted.slice(0, topCount).map(p => p.employeeId);

    // Needs attention (declining or score < 50)
    const needsAttention = predictions
      .filter(p => p.trend === 'DECLINING' || p.predictedScore < 50)
      .map(p => p.employeeId);

    // Team trend
    const improving = predictions.filter(p => p.trend === 'IMPROVING').length;
    const declining = predictions.filter(p => p.trend === 'DECLINING').length;
    const teamTrend = improving > declining ? 'IMPROVING' : declining > improving ? 'DECLINING' : 'STABLE';

    // Generate insights
    const insights: string[] = [];
    insights.push(`Team average performance: ${Math.round(averageScore)}%`);
    insights.push(`${distribution.EXCEPTIONAL + distribution.EXCEEDS} team members exceeding expectations`);
    if (needsAttention.length > 0) {
      insights.push(`${needsAttention.length} team member(s) need additional support`);
    }
    insights.push(`Overall team trend: ${teamTrend.toLowerCase()}`);

    return {
      averageScore: Math.round(averageScore),
      distribution,
      topPerformers,
      needsAttention,
      teamTrend,
      insights,
    };
  }
}
