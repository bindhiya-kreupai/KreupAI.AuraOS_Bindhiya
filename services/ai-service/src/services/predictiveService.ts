export interface EmployeeData {
  id: string;
  tenure: number; // months
  department: string;
  role: string;
  salary: number;
  lastPromotionDate?: string;
  performanceRatings: number[];
  absenceDays: number;
  overtimeHours: number;
  trainingHoursCompleted: number;
  managerRating?: number;
  engagementSurveyScores: SurveyScore[];
  recentChanges: EmployeeChange[];
}

export interface SurveyScore {
  date: string;
  category: string;
  score: number; // 1-5
}

export interface EmployeeChange {
  type: 'role_change' | 'manager_change' | 'team_change' | 'salary_change' | 'location_change';
  date: string;
  details?: Record<string, unknown>;
}

export interface AttritionPrediction {
  employeeId: string;
  riskScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  predictedTimeframe?: string; // e.g., "3-6 months"
  recommendations: string[];
  generatedAt: string;
}

export interface RiskFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
  category: 'compensation' | 'engagement' | 'growth' | 'workload' | 'management' | 'tenure';
}

export interface EngagementScore {
  employeeId: string;
  overallScore: number; // 0-100
  dimensions: EngagementDimension[];
  trend: 'improving' | 'stable' | 'declining';
  comparedToTeamAvg: number; // difference from team average
  generatedAt: string;
}

export interface EngagementDimension {
  name: string;
  score: number; // 0-100
  weight: number;
  indicators: string[];
}

export interface BatchPredictionParams {
  employeeIds: string[];
  includeRecommendations?: boolean;
}

export class PredictiveService {
  /**
   * Predict attrition risk for a single employee
   */
  async predictAttrition(employeeData: EmployeeData): Promise<AttritionPrediction> {
    const factors = this.calculateRiskFactors(employeeData);
    const riskScore = this.calculateOverallRisk(factors);
    const riskLevel = this.getRiskLevel(riskScore);

    return {
      employeeId: employeeData.id,
      riskScore,
      riskLevel,
      factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
      predictedTimeframe: riskScore > 0.7 ? '1-3 months' : riskScore > 0.4 ? '3-6 months' : undefined,
      recommendations: this.generateRetentionRecommendations(factors, riskLevel),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate engagement score for an employee
   */
  async calculateEngagement(employeeData: EmployeeData): Promise<EngagementScore> {
    const dimensions = this.calculateEngagementDimensions(employeeData);
    const overallScore = dimensions.reduce(
      (sum, d) => sum + d.score * d.weight,
      0
    ) / dimensions.reduce((sum, d) => sum + d.weight, 0);

    const trend = this.determineEngagementTrend(employeeData);

    // Mock team comparison calculation
    const mockTeamAverage = 75; 
    const comparedToTeamAvg = Math.round(overallScore - mockTeamAverage);

    return {
      employeeId: employeeData.id,
      overallScore: Math.round(overallScore),
      dimensions,
      trend,
      comparedToTeamAvg,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Batch predict attrition for multiple employees
   */
  async batchPredictAttrition(
    employeeDataList: EmployeeData[],
    includeRecommendations: boolean = true
  ): Promise<AttritionPrediction[]> {
    const predictions: AttritionPrediction[] = [];

    for (const data of employeeDataList) {
      const prediction = await this.predictAttrition(data);
      if (!includeRecommendations) {
        prediction.recommendations = [];
      }
      predictions.push(prediction);
    }

    return predictions.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Calculate individual risk factors from employee data
   */
  private calculateRiskFactors(data: EmployeeData): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Tenure factor - very short or very long tenure
    if (data.tenure < 12) {
      factors.push({
        name: 'Short Tenure',
        impact: 0.3,
        description: 'Employee has been with the company less than a year',
        category: 'tenure',
      });
    } else if (data.tenure > 60) {
      factors.push({
        name: 'Long Tenure Without Promotion',
        impact: data.lastPromotionDate ? 0.1 : 0.4,
        description: 'Extended period without career advancement',
        category: 'growth',
      });
    }

    // Performance trend
    if (data.performanceRatings.length >= 2) {
      const recent = data.performanceRatings[data.performanceRatings.length - 1];
      const previous = data.performanceRatings[data.performanceRatings.length - 2];
      if (recent < previous) {
        factors.push({
          name: 'Declining Performance',
          impact: 0.3,
          description: 'Performance rating has decreased recently',
          category: 'engagement',
        });
      }
    }

    // Overtime
    if (data.overtimeHours > 20) {
      factors.push({
        name: 'High Overtime',
        impact: 0.25,
        description: 'Consistently working excessive overtime hours',
        category: 'workload',
      });
    }

    // Training engagement
    if (data.trainingHoursCompleted < 5) {
      factors.push({
        name: 'Low Training Engagement',
        impact: 0.15,
        description: 'Minimal participation in training programs',
        category: 'growth',
      });
    }

    // Recent changes
    const recentManagerChange = data.recentChanges.find(
      (c) => c.type === 'manager_change'
    );
    if (recentManagerChange) {
      factors.push({
        name: 'Recent Manager Change',
        impact: 0.2,
        description: 'Manager changed recently, adjustment period',
        category: 'management',
      });
    }

    // Absence pattern
    if (data.absenceDays > 15) {
      factors.push({
        name: 'High Absence Rate',
        impact: 0.2,
        description: 'Above average absence days',
        category: 'engagement',
      });
    }

    return factors;
  }

  /**
   * Calculate overall risk score from individual factors
   */
  private calculateOverallRisk(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;

    const totalImpact = factors.reduce((sum, f) => sum + Math.max(0, f.impact), 0);
    return Math.min(1, totalImpact);
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * Calculate engagement dimensions from employee data
   */
  private calculateEngagementDimensions(data: EmployeeData): EngagementDimension[] {
    return [
      {
        name: 'Work Satisfaction',
        score: this.normalizeScore(data.performanceRatings),
        weight: 0.25,
        indicators: ['performance_trend', 'overtime_balance'],
      },
      {
        name: 'Growth & Development',
        score: Math.min(100, data.trainingHoursCompleted * 5),
        weight: 0.2,
        indicators: ['training_participation', 'skill_development'],
      },
      {
        name: 'Work-Life Balance',
        score: Math.max(0, 100 - data.overtimeHours * 2 - data.absenceDays),
        weight: 0.2,
        indicators: ['overtime_hours', 'absence_pattern'],
      },
      {
        name: 'Team & Culture',
        score: data.managerRating ? data.managerRating * 20 : 50,
        weight: 0.2,
        indicators: ['manager_rating', 'team_stability'],
      },
      {
        name: 'Recognition & Compensation',
        score: data.lastPromotionDate ? 70 : 40,
        weight: 0.15,
        indicators: ['promotion_history', 'compensation_competitiveness'],
      },
    ];
  }

  /**
   * Determine engagement trend from historical data
   */
  private determineEngagementTrend(data: EmployeeData): 'improving' | 'stable' | 'declining' {
    if (data.engagementSurveyScores.length < 2) return 'stable';

    const sorted = [...data.engagementSurveyScores].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const recentAvg = sorted.slice(-3).reduce((s, v) => s + v.score, 0) / Math.min(3, sorted.length);
    const previousAvg = sorted.slice(-6, -3).reduce((s, v) => s + v.score, 0) / Math.min(3, sorted.slice(-6, -3).length || 1);

    if (recentAvg > previousAvg + 0.3) return 'improving';
    if (recentAvg < previousAvg - 0.3) return 'declining';
    return 'stable';
  }

  /**
   * Normalize performance ratings to 0-100 scale
   */
  private normalizeScore(ratings: number[]): number {
    if (ratings.length === 0) return 50;
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    return Math.min(100, avg * 20); // Assuming 1-5 scale
  }

  /**
   * Generate retention recommendations based on risk factors
   */
  private generateRetentionRecommendations(factors: RiskFactor[], riskLevel: string): string[] {
    const recommendations: string[] = [];

    for (const factor of factors) {
      switch (factor.category) {
        case 'compensation':
          recommendations.push('Review compensation against market rates');
          break;
        case 'growth':
          recommendations.push('Discuss career development plan with employee');
          recommendations.push('Consider stretch assignments or role expansion');
          break;
        case 'workload':
          recommendations.push('Review workload distribution and deadlines');
          recommendations.push('Consider additional team resources');
          break;
        case 'management':
          recommendations.push('Schedule regular 1-on-1 check-ins');
          recommendations.push('Ensure smooth transition with new manager');
          break;
        case 'engagement':
          recommendations.push('Conduct stay interview to understand concerns');
          break;
      }
    }

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Schedule urgent retention conversation with HR');
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }
}

export default new PredictiveService();
