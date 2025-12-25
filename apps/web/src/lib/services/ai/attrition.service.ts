/**
 * Attrition Prediction Service
 * Phase 3: Intelligence Layer - Predictive Analytics
 *
 * Uses machine learning to predict employee attrition risk
 */

import type {
  AttritionRisk,
  AttritionFactor,
  AttritionAnalytics,
  RiskLevel,
  PredictionConfidence,
  Recommendation,
  RiskTrend} from './types';
import {
  ContributingFactor,
} from './types';

// ============================================================================
// FEATURE WEIGHTS (Based on industry research)
// ============================================================================

const FEATURE_WEIGHTS = {
  // Compensation (25%)
  salaryCompetitiveness: 0.12,
  lastSalaryIncrease: 0.08,
  bonusReceived: 0.05,

  // Engagement (20%)
  engagementScore: 0.10,
  surveyParticipation: 0.05,
  feedbackFrequency: 0.05,

  // Performance (15%)
  performanceRating: 0.08,
  performanceTrend: 0.07,

  // Tenure & Growth (15%)
  tenure: 0.05,
  promotionHistory: 0.05,
  trainingHours: 0.05,

  // Management (10%)
  managerTenure: 0.05,
  teamSize: 0.03,
  managerRating: 0.02,

  // Workload (10%)
  overtimeHours: 0.05,
  leaveUtilization: 0.03,
  workLifeBalance: 0.02,

  // External (5%)
  marketDemand: 0.03,
  industryAttrition: 0.02,
};

// ============================================================================
// ATTRITION PREDICTION SERVICE
// ============================================================================

export class AttritionPredictionService {
  /**
   * Predict attrition risk for a single employee
   */
  static async predictEmployeeRisk(employeeId: string): Promise<AttritionRisk> {
    // Fetch employee data
    const employeeData = await this.fetchEmployeeData(employeeId);

    // Calculate feature scores
    const features = this.calculateFeatures(employeeData);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(features);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);

    // Identify contributing factors
    const factors = this.identifyFactors(features, employeeData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, riskLevel);

    // Get historical trend
    const historicalRisk = await this.getHistoricalRisk(employeeId);

    return {
      employeeId,
      employeeName: employeeData.name,
      department: employeeData.department,
      riskScore,
      riskLevel,
      prediction: {
        value: riskScore > 50,
        confidence: this.calculateConfidence(riskScore),
        confidenceLevel: this.getConfidenceLevel(this.calculateConfidence(riskScore)),
        factors: factors.slice(0, 5), // Top 5 factors
        timestamp: new Date(),
        modelVersion: '2.1.0',
      },
      factors,
      recommendations,
      historicalRisk,
      lastUpdated: new Date(),
    };
  }

  /**
   * Batch predict attrition risk for multiple employees
   */
  static async predictBatchRisk(
    tenantId: string,
    employeeIds?: string[]
  ): Promise<AttritionRisk[]> {
    const employees = employeeIds
      ? await this.fetchEmployees(tenantId, employeeIds)
      : await this.fetchAllEmployees(tenantId);

    const predictions: AttritionRisk[] = [];

    for (const employee of employees) {
      const risk = await this.predictEmployeeRisk(employee.id);
      predictions.push(risk);
    }

    return predictions.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get attrition analytics for organization
   */
  static async getAnalytics(tenantId: string): Promise<AttritionAnalytics> {
    const predictions = await this.predictBatchRisk(tenantId);
    const historicalData = await this.fetchHistoricalData(tenantId);

    // Calculate overall metrics
    const totalEmployees = predictions.length;
    const atRiskCount = predictions.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
    const atRiskPercentage = (atRiskCount / totalEmployees) * 100;

    // Group by risk level
    const byRiskLevel = this.groupByRiskLevel(predictions);

    // Group by department
    const byDepartment = this.groupByDepartment(predictions);

    // Identify top risk factors
    const topRiskFactors = this.identifyTopRiskFactors(predictions);

    // Generate org-level recommendations
    const topRecommendations = this.generateOrgRecommendations(predictions, topRiskFactors);

    // Calculate model accuracy from historical data
    const modelAccuracy = this.calculateModelAccuracy(historicalData);

    // Monthly trends
    const monthlyTrend = this.calculateMonthlyTrend(historicalData);

    return {
      tenantId,
      asOfDate: new Date(),
      totalEmployees,
      atRiskCount,
      atRiskPercentage: Math.round(atRiskPercentage * 10) / 10,
      predictedAttrition: Math.round(atRiskCount * 0.6), // 60% conversion rate
      actualAttrition: historicalData.actualAttrition || 0,
      modelAccuracy,
      byRiskLevel,
      byDepartment,
      topRiskFactors,
      topRecommendations,
      monthlyTrend,
    };
  }

  /**
   * Calculate feature scores from employee data
   */
  private static calculateFeatures(data: EmployeeData): FeatureScores {
    return {
      // Compensation
      salaryCompetitiveness: this.scoreSalaryCompetitiveness(data),
      lastSalaryIncrease: this.scoreLastIncrease(data),
      bonusReceived: data.lastBonusAmount > 0 ? 70 : 30,

      // Engagement
      engagementScore: data.engagementScore || 50,
      surveyParticipation: data.surveyParticipation ? 80 : 20,
      feedbackFrequency: this.scoreFeedbackFrequency(data),

      // Performance
      performanceRating: this.scorePerformance(data),
      performanceTrend: this.scorePerformanceTrend(data),

      // Tenure & Growth
      tenure: this.scoreTenure(data),
      promotionHistory: this.scorePromotions(data),
      trainingHours: this.scoreTraining(data),

      // Management
      managerTenure: this.scoreManagerTenure(data),
      teamSize: this.scoreTeamSize(data),
      managerRating: data.managerRating || 50,

      // Workload
      overtimeHours: this.scoreOvertime(data),
      leaveUtilization: this.scoreLeaveUtilization(data),
      workLifeBalance: data.workLifeBalanceScore || 50,

      // External
      marketDemand: this.scoreMarketDemand(data),
      industryAttrition: 50, // Neutral baseline
    };
  }

  /**
   * Calculate overall risk score from features
   */
  private static calculateRiskScore(features: FeatureScores): number {
    let riskScore = 0;

    for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
      const featureValue = features[feature as keyof FeatureScores] || 50;
      // Invert score: low feature score = high risk
      const riskContribution = (100 - featureValue) * weight;
      riskScore += riskContribution;
    }

    // Normalize to 0-100
    return Math.min(100, Math.max(0, Math.round(riskScore)));
  }

  /**
   * Determine risk level from score
   */
  private static determineRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate prediction confidence
   */
  private static calculateConfidence(riskScore: number): number {
    // Higher confidence at extremes, lower in middle
    const distanceFromMiddle = Math.abs(riskScore - 50);
    return Math.min(95, 50 + distanceFromMiddle);
  }

  /**
   * Get confidence level from percentage
   */
  private static getConfidenceLevel(confidence: number): PredictionConfidence {
    if (confidence >= 85) return 'VERY_HIGH';
    if (confidence >= 70) return 'HIGH';
    if (confidence >= 55) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Identify contributing factors
   */
  private static identifyFactors(
    features: FeatureScores,
    data: EmployeeData
  ): AttritionFactor[] {
    const factors: AttritionFactor[] = [];

    // Compensation factors
    if (features.salaryCompetitiveness < 40) {
      factors.push({
        name: 'Below Market Salary',
        nameAr: 'راتب أقل من السوق',
        impact: 85,
        description: `Salary is ${Math.round(100 - features.salaryCompetitiveness)}% below market rate`,
        descriptionAr: 'الراتب أقل من معدل السوق',
        category: 'COMPENSATION',
        currentValue: data.salary,
        benchmarkValue: data.marketSalary,
        trend: 'STABLE',
      });
    }

    if (features.lastSalaryIncrease < 30) {
      factors.push({
        name: 'No Recent Salary Increase',
        nameAr: 'لا توجد زيادة راتب حديثة',
        impact: 70,
        description: `Last salary increase was ${data.monthsSinceLastIncrease} months ago`,
        descriptionAr: 'لم تحصل على زيادة منذ فترة طويلة',
        category: 'COMPENSATION',
        currentValue: data.monthsSinceLastIncrease,
        benchmarkValue: 12,
        trend: 'DECLINING',
      });
    }

    // Engagement factors
    if (features.engagementScore < 40) {
      factors.push({
        name: 'Low Engagement Score',
        nameAr: 'درجة مشاركة منخفضة',
        impact: 80,
        description: 'Employee shows signs of disengagement',
        descriptionAr: 'الموظف يظهر علامات عدم المشاركة',
        category: 'ENGAGEMENT',
        currentValue: features.engagementScore,
        benchmarkValue: 70,
        trend: data.engagementTrend || 'STABLE',
      });
    }

    // Performance factors
    if (features.performanceTrend < 40) {
      factors.push({
        name: 'Declining Performance',
        nameAr: 'أداء متراجع',
        impact: 65,
        description: 'Performance has declined over recent reviews',
        descriptionAr: 'تراجع الأداء خلال المراجعات الأخيرة',
        category: 'PERFORMANCE',
        currentValue: data.currentPerformanceRating,
        benchmarkValue: data.previousPerformanceRating,
        trend: 'DECLINING',
      });
    }

    // Growth factors
    if (features.promotionHistory < 30) {
      factors.push({
        name: 'Limited Career Growth',
        nameAr: 'نمو وظيفي محدود',
        impact: 75,
        description: `No promotion in ${data.monthsSinceLastPromotion} months`,
        descriptionAr: 'لا توجد ترقية منذ فترة طويلة',
        category: 'GROWTH',
        currentValue: data.monthsSinceLastPromotion,
        benchmarkValue: 24,
        trend: 'STABLE',
      });
    }

    // Management factors
    if (features.managerTenure < 30) {
      factors.push({
        name: 'Recent Manager Change',
        nameAr: 'تغيير المدير مؤخراً',
        impact: 45,
        description: 'Manager changed recently, may affect stability',
        descriptionAr: 'تغيير المدير قد يؤثر على الاستقرار',
        category: 'MANAGEMENT',
        currentValue: data.managerTenureMonths,
        benchmarkValue: 12,
        trend: 'STABLE',
      });
    }

    // Workload factors
    if (features.overtimeHours < 40) {
      factors.push({
        name: 'Excessive Overtime',
        nameAr: 'عمل إضافي مفرط',
        impact: 60,
        description: `Averaging ${data.avgOvertimeHours} overtime hours per month`,
        descriptionAr: 'متوسط ساعات العمل الإضافي مرتفع',
        category: 'WORKLOAD',
        currentValue: data.avgOvertimeHours,
        benchmarkValue: 10,
        trend: 'STABLE',
      });
    }

    // Sort by impact
    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    factors: AttritionFactor[],
    riskLevel: RiskLevel
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const factor of factors.slice(0, 3)) {
      const rec = this.getRecommendationForFactor(factor, riskLevel);
      if (rec) recommendations.push(rec);
    }

    return recommendations;
  }

  /**
   * Get recommendation for a specific factor
   */
  private static getRecommendationForFactor(
    factor: AttritionFactor,
    riskLevel: RiskLevel
  ): Recommendation | null {
    const recommendationMap: Record<string, Partial<Recommendation>> = {
      COMPENSATION: {
        type: 'SALARY_REVIEW',
        title: 'Conduct Salary Review',
        titleAr: 'مراجعة الراتب',
        description: 'Review compensation package and align with market rates',
        descriptionAr: 'مراجعة حزمة التعويضات ومواءمتها مع معدلات السوق',
        estimatedImpact: 30,
        effort: 'MEDIUM',
      },
      ENGAGEMENT: {
        type: 'ENGAGEMENT_INITIATIVE',
        title: 'Schedule One-on-One Meeting',
        titleAr: 'جدولة اجتماع فردي',
        description: 'Have a direct conversation to understand concerns',
        descriptionAr: 'إجراء محادثة مباشرة لفهم المخاوف',
        estimatedImpact: 25,
        effort: 'LOW',
      },
      GROWTH: {
        type: 'CAREER_DEVELOPMENT',
        title: 'Create Development Plan',
        titleAr: 'إنشاء خطة تطوير',
        description: 'Define clear career path and growth opportunities',
        descriptionAr: 'تحديد مسار وظيفي واضح وفرص النمو',
        estimatedImpact: 35,
        effort: 'MEDIUM',
      },
      WORKLOAD: {
        type: 'WORKLOAD_BALANCE',
        title: 'Review Workload Distribution',
        titleAr: 'مراجعة توزيع العمل',
        description: 'Assess and redistribute workload for better balance',
        descriptionAr: 'تقييم وإعادة توزيع عبء العمل لتحقيق توازن أفضل',
        estimatedImpact: 20,
        effort: 'MEDIUM',
      },
      MANAGEMENT: {
        type: 'MANAGER_SUPPORT',
        title: 'Manager Coaching',
        titleAr: 'تدريب المدير',
        description: 'Provide coaching for manager on employee retention',
        descriptionAr: 'تقديم التدريب للمدير حول الاحتفاظ بالموظفين',
        estimatedImpact: 15,
        effort: 'MEDIUM',
      },
    };

    const baseRec = recommendationMap[factor.category];
    if (!baseRec) return null;

    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: riskLevel === 'CRITICAL' ? 'URGENT' : riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      actionable: true,
      ...baseRec,
    } as Recommendation;
  }

  // ============================================================================
  // SCORING FUNCTIONS
  // ============================================================================

  private static scoreSalaryCompetitiveness(data: EmployeeData): number {
    if (!data.salary || !data.marketSalary) return 50;
    const ratio = data.salary / data.marketSalary;
    if (ratio >= 1.1) return 90;
    if (ratio >= 1.0) return 75;
    if (ratio >= 0.9) return 50;
    if (ratio >= 0.8) return 30;
    return 15;
  }

  private static scoreLastIncrease(data: EmployeeData): number {
    const months = data.monthsSinceLastIncrease || 24;
    if (months <= 6) return 90;
    if (months <= 12) return 70;
    if (months <= 18) return 45;
    if (months <= 24) return 25;
    return 10;
  }

  private static scoreFeedbackFrequency(data: EmployeeData): number {
    const feedbacks = data.feedbackCount || 0;
    if (feedbacks >= 12) return 90;
    if (feedbacks >= 6) return 70;
    if (feedbacks >= 3) return 50;
    if (feedbacks >= 1) return 30;
    return 10;
  }

  private static scorePerformance(data: EmployeeData): number {
    const rating = data.currentPerformanceRating || 3;
    return Math.min(100, (rating / 5) * 100);
  }

  private static scorePerformanceTrend(data: EmployeeData): number {
    const current = data.currentPerformanceRating || 3;
    const previous = data.previousPerformanceRating || 3;
    const change = current - previous;
    if (change > 0.5) return 90;
    if (change > 0) return 70;
    if (change === 0) return 50;
    if (change > -0.5) return 30;
    return 15;
  }

  private static scoreTenure(data: EmployeeData): number {
    const months = data.tenureMonths || 0;
    // Sweet spot: 18-48 months (most stable)
    if (months >= 18 && months <= 48) return 85;
    if (months >= 12 && months <= 60) return 70;
    if (months >= 6) return 50;
    if (months >= 3) return 35;
    return 20; // Very new or very long tenure = higher risk
  }

  private static scorePromotions(data: EmployeeData): number {
    const months = data.monthsSinceLastPromotion || 36;
    if (months <= 12) return 90;
    if (months <= 24) return 70;
    if (months <= 36) return 45;
    if (months <= 48) return 25;
    return 10;
  }

  private static scoreTraining(data: EmployeeData): number {
    const hours = data.trainingHoursYTD || 0;
    if (hours >= 40) return 90;
    if (hours >= 20) return 70;
    if (hours >= 10) return 50;
    if (hours >= 5) return 30;
    return 15;
  }

  private static scoreManagerTenure(data: EmployeeData): number {
    const months = data.managerTenureMonths || 0;
    if (months >= 24) return 85;
    if (months >= 12) return 70;
    if (months >= 6) return 50;
    if (months >= 3) return 35;
    return 20;
  }

  private static scoreTeamSize(data: EmployeeData): number {
    const size = data.teamSize || 5;
    // Optimal team size: 5-10
    if (size >= 5 && size <= 10) return 85;
    if (size >= 3 && size <= 15) return 70;
    return 50;
  }

  private static scoreOvertime(data: EmployeeData): number {
    const hours = data.avgOvertimeHours || 0;
    if (hours <= 5) return 90;
    if (hours <= 10) return 70;
    if (hours <= 20) return 45;
    if (hours <= 30) return 25;
    return 10;
  }

  private static scoreLeaveUtilization(data: EmployeeData): number {
    const utilization = data.leaveUtilization || 50;
    // Healthy: 60-90% utilization
    if (utilization >= 60 && utilization <= 90) return 85;
    if (utilization >= 40 && utilization <= 95) return 65;
    return 40; // Too low or too high = risk indicator
  }

  private static scoreMarketDemand(data: EmployeeData): number {
    // Based on role scarcity in market
    const demand = data.marketDemand || 'MODERATE';
    if (demand === 'LOW') return 80;
    if (demand === 'MODERATE') return 50;
    if (demand === 'HIGH') return 25;
    return 10; // VERY_HIGH
  }

  // ============================================================================
  // ANALYTICS HELPERS
  // ============================================================================

  private static groupByRiskLevel(
    predictions: AttritionRisk[]
  ): AttritionAnalytics['byRiskLevel'] {
    const groups: Record<RiskLevel, AttritionRisk[]> = {
      LOW: [],
      MEDIUM: [],
      HIGH: [],
      CRITICAL: [],
    };

    predictions.forEach(p => groups[p.riskLevel].push(p));

    return Object.entries(groups).map(([level, employees]) => ({
      level: level as RiskLevel,
      count: employees.length,
      percentage: (employees.length / predictions.length) * 100,
      avgTenure: 0, // Would calculate from actual data
    }));
  }

  private static groupByDepartment(
    predictions: AttritionRisk[]
  ): AttritionAnalytics['byDepartment'] {
    const deptMap = new Map<string, AttritionRisk[]>();

    predictions.forEach(p => {
      const existing = deptMap.get(p.department) || [];
      deptMap.set(p.department, [...existing, p]);
    });

    return Array.from(deptMap.entries()).map(([dept, employees]) => {
      const atRisk = employees.filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL');
      const allFactors = employees.flatMap(e => e.factors);
      const factorCounts = new Map<string, number>();
      allFactors.forEach(f => {
        factorCounts.set(f.name, (factorCounts.get(f.name) || 0) + 1);
      });

      return {
        department: dept,
        totalEmployees: employees.length,
        atRiskCount: atRisk.length,
        avgRiskScore: employees.reduce((sum, e) => sum + e.riskScore, 0) / employees.length,
        topFactors: Array.from(factorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name),
      };
    });
  }

  private static identifyTopRiskFactors(
    predictions: AttritionRisk[]
  ): AttritionAnalytics['topRiskFactors'] {
    const factorMap = new Map<string, { count: number; totalImpact: number }>();

    predictions.forEach(p => {
      p.factors.forEach(f => {
        const existing = factorMap.get(f.name) || { count: 0, totalImpact: 0 };
        factorMap.set(f.name, {
          count: existing.count + 1,
          totalImpact: existing.totalImpact + f.impact,
        });
      });
    });

    return Array.from(factorMap.entries())
      .map(([factor, data]) => ({
        factor,
        frequency: data.count,
        avgImpact: data.totalImpact / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private static generateOrgRecommendations(
    predictions: AttritionRisk[],
    topFactors: AttritionAnalytics['topRiskFactors']
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (topFactors.some(f => f.factor.includes('Salary'))) {
      recommendations.push({
        id: 'org_1',
        type: 'COMPENSATION_REVIEW',
        priority: 'HIGH',
        title: 'Organization-wide Compensation Review',
        titleAr: 'مراجعة التعويضات على مستوى المؤسسة',
        description: 'Multiple employees showing salary-related risk. Conduct market benchmarking.',
        descriptionAr: 'عدة موظفين يظهرون مخاطر مرتبطة بالراتب. إجراء مقارنة مع السوق.',
        actionable: true,
        estimatedImpact: 25,
        effort: 'HIGH',
      });
    }

    if (topFactors.some(f => f.factor.includes('Growth') || f.factor.includes('Promotion'))) {
      recommendations.push({
        id: 'org_2',
        type: 'CAREER_FRAMEWORK',
        priority: 'HIGH',
        title: 'Implement Career Ladder Framework',
        titleAr: 'تنفيذ إطار السلم الوظيفي',
        description: 'Many employees lack clear growth paths. Define career progressions.',
        descriptionAr: 'العديد من الموظفين يفتقرون إلى مسارات نمو واضحة.',
        actionable: true,
        estimatedImpact: 30,
        effort: 'HIGH',
      });
    }

    return recommendations;
  }

  private static calculateModelAccuracy(historicalData: HistoricalData): number {
    // Would calculate from actual predictions vs outcomes
    return historicalData.modelAccuracy || 82;
  }

  private static calculateMonthlyTrend(
    historicalData: HistoricalData
  ): AttritionAnalytics['monthlyTrend'] {
    return historicalData.monthlyTrend || [];
  }

  // ============================================================================
  // DATA FETCHING (Stubs)
  // ============================================================================

  private static async fetchEmployeeData(employeeId: string): Promise<EmployeeData> {
    // Would fetch from database
    return {
      id: employeeId,
      name: 'Sample Employee',
      department: 'Engineering',
      salary: 50000,
      marketSalary: 55000,
      monthsSinceLastIncrease: 18,
      lastBonusAmount: 5000,
      engagementScore: 65,
      surveyParticipation: true,
      feedbackCount: 4,
      currentPerformanceRating: 3.5,
      previousPerformanceRating: 3.8,
      tenureMonths: 24,
      monthsSinceLastPromotion: 30,
      trainingHoursYTD: 16,
      managerTenureMonths: 8,
      teamSize: 7,
      managerRating: 70,
      avgOvertimeHours: 15,
      leaveUtilization: 55,
      workLifeBalanceScore: 60,
      marketDemand: 'HIGH',
      engagementTrend: 'DECLINING',
    };
  }

  private static async fetchEmployees(
    tenantId: string,
    employeeIds: string[]
  ): Promise<{ id: string }[]> {
    return employeeIds.map(id => ({ id }));
  }

  private static async fetchAllEmployees(tenantId: string): Promise<{ id: string }[]> {
    return [];
  }

  private static async getHistoricalRisk(employeeId: string): Promise<RiskTrend[]> {
    return [];
  }

  private static async fetchHistoricalData(tenantId: string): Promise<HistoricalData> {
    return {
      actualAttrition: 12,
      modelAccuracy: 82,
      monthlyTrend: [],
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeData {
  id: string;
  name: string;
  department: string;
  salary: number;
  marketSalary: number;
  monthsSinceLastIncrease: number;
  lastBonusAmount: number;
  engagementScore: number;
  surveyParticipation: boolean;
  feedbackCount: number;
  currentPerformanceRating: number;
  previousPerformanceRating: number;
  tenureMonths: number;
  monthsSinceLastPromotion: number;
  trainingHoursYTD: number;
  managerTenureMonths: number;
  teamSize: number;
  managerRating: number;
  avgOvertimeHours: number;
  leaveUtilization: number;
  workLifeBalanceScore: number;
  marketDemand: string;
  engagementTrend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

interface FeatureScores {
  salaryCompetitiveness: number;
  lastSalaryIncrease: number;
  bonusReceived: number;
  engagementScore: number;
  surveyParticipation: number;
  feedbackFrequency: number;
  performanceRating: number;
  performanceTrend: number;
  tenure: number;
  promotionHistory: number;
  trainingHours: number;
  managerTenure: number;
  teamSize: number;
  managerRating: number;
  overtimeHours: number;
  leaveUtilization: number;
  workLifeBalance: number;
  marketDemand: number;
  industryAttrition: number;
}

interface HistoricalData {
  actualAttrition: number;
  modelAccuracy: number;
  monthlyTrend: AttritionAnalytics['monthlyTrend'];
}

export default AttritionPredictionService;
