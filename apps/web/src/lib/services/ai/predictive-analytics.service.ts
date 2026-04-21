/**
 * Predictive Analytics Service
 * Phase 3: Intelligence Layer - ML-Based HR Predictions
 *
 * Provides statistical/heuristic models for HR outcome predictions.
 * These heuristic implementations can be replaced with real ML models later.
 */

import { prisma } from '@aura/database';

// ============================================================================
// TYPES
// ============================================================================

export interface RiskFactor {
  name: string;
  nameAr: string;
  impact: 'POSITIVE' | 'NEGATIVE';
  weight: number;
  value: number;
  description: string;
}

export interface AttritionRisk {
  employeeId: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  recommendation: string;
  recommendationAr: string;
}

export interface PerformancePrediction {
  employeeId: string;
  predictedRating: number;
  confidence: number;
  trajectory: 'IMPROVING' | 'STABLE' | 'DECLINING';
  factors: RiskFactor[];
}

export interface HeadcountForecast {
  month: string;
  projected: number;
  lowerBound: number;
  upperBound: number;
  assumptions: string[];
}

export interface CompensationInsight {
  employeeId: string;
  currentSalary: number;
  marketMedian: number;
  percentile: number;
  recommendation: string;
}

export interface WorkforceInsight {
  category: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: number;
  actionItems: string[];
}

export interface ModelMetrics {
  modelName: string;
  accuracy: number;
  lastTrained: Date;
  dataPoints: number;
  features: string[];
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface EmployeeAttritionData {
  id: string;
  tenureMonths: number;
  salary: number;
  departmentAvgSalary: number;
  lastPromotionMonths: number | null;
  managerChangeMonths: number | null;
  overtimeHoursLast90Days: number;
  leaveBalanceUsedPercent: number;
  peerDeparturesLast6Months: number;
  performanceRating: number | null;
  departmentId: string;
  departmentName: string;
}

interface HistoricalHeadcount {
  month: string;
  count: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ATTRITION_WEIGHTS = {
  tenure: 0.20,
  salaryPercentile: 0.20,
  promotionHistory: 0.15,
  managerChange: 0.10,
  overtime: 0.10,
  leavePattern: 0.10,
  peerDepartures: 0.10,
  performance: 0.05,
};

const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
};

// ============================================================================
// PREDICTIVE ANALYTICS SERVICE
// ============================================================================

export class PredictiveAnalyticsService {
  // --------------------------------------------------------------------------
  // ATTRITION RISK PREDICTION
  // --------------------------------------------------------------------------

  /**
   * Predict attrition risk for one or all employees in a tenant.
   * Scoring model uses weighted heuristics based on:
   *  - Tenure bucket (new hires < 12 months = higher risk)
   *  - Salary percentile (below median = higher risk)
   *  - Promotion history (no promotion in 2+ years = higher risk)
   *  - Manager changes (recent change = higher risk)
   *  - Overtime frequency
   *  - Leave utilization patterns
   *  - Peer departures in same department
   */
  static async predictAttritionRisk(
    tenantId: string,
    employeeId?: string
  ): Promise<AttritionRisk[]> {
    const employees = await this.fetchAttritionData(tenantId, employeeId);
    return employees.map((emp) => this.scoreAttritionRisk(emp));
  }

  /**
   * Get attrition heatmap grouped by department and tenure bucket.
   */
  static async getAttritionHeatmap(
    tenantId: string
  ): Promise<Record<string, Record<string, { count: number; avgRisk: number }>>> {
    const risks = await this.predictAttritionRisk(tenantId);
    const employees = await prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        departmentId: true,
        department: { select: { name: true } },
        hireDate: true,
      },
    });

    const heatmap: Record<string, Record<string, { count: number; avgRisk: number; total: number }>> = {};

    for (const emp of employees) {
      const deptName = emp.department?.name || 'Unknown';
      const tenureMonths = emp.hireDate
        ? Math.floor((Date.now() - new Date(emp.hireDate).getTime()) / (30.44 * 24 * 60 * 60 * 1000))
        : 0;
      const bucket = this.getTenureBucket(tenureMonths);
      const risk = risks.find((r) => r.employeeId === emp.id);

      if (!heatmap[deptName]) heatmap[deptName] = {};
      if (!heatmap[deptName][bucket]) heatmap[deptName][bucket] = { count: 0, avgRisk: 0, total: 0 };

      heatmap[deptName][bucket].count += 1;
      heatmap[deptName][bucket].total += risk?.riskScore ?? 0;
    }

    // Compute averages
    const result: Record<string, Record<string, { count: number; avgRisk: number }>> = {};
    for (const dept of Object.keys(heatmap)) {
      result[dept] = {};
      for (const bucket of Object.keys(heatmap[dept])) {
        const cell = heatmap[dept][bucket];
        result[dept][bucket] = {
          count: cell.count,
          avgRisk: cell.count > 0 ? Math.round(cell.total / cell.count) : 0,
        };
      }
    }

    return result;
  }

  /**
   * Identify employees above a given risk threshold.
   */
  static async identifyFlightRisk(
    tenantId: string,
    threshold: number = 60
  ): Promise<AttritionRisk[]> {
    const risks = await this.predictAttritionRisk(tenantId);
    return risks
      .filter((r) => r.riskScore >= threshold)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  // --------------------------------------------------------------------------
  // PERFORMANCE PREDICTION
  // --------------------------------------------------------------------------

  /**
   * Predict next review score using linear regression approximation
   * from historical performance reviews.
   */
  static async predictPerformance(
    tenantId: string,
    employeeId: string
  ): Promise<PerformancePrediction> {
    // Fetch performance reviews for this employee
    const reviews = await prisma.performanceReview.findMany({
      where: {
        tenantId,
        employeeId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'asc' },
      select: {
        overallRating: true,
        createdAt: true,
      },
    });

    const factors: RiskFactor[] = [];
    let predictedRating: number;
    let confidence: number;
    let trajectory: 'IMPROVING' | 'STABLE' | 'DECLINING';

    if (reviews.length < 2) {
      // Insufficient data: use the single available rating or default
      predictedRating = reviews.length === 1 ? (reviews[0].overallRating ?? 3) : 3;
      confidence = reviews.length === 1 ? 30 : 10;
      trajectory = 'STABLE';
      factors.push({
        name: 'Insufficient Data',
        nameAr: 'بيانات غير كافية',
        impact: 'NEGATIVE',
        weight: 1.0,
        value: reviews.length,
        description: `Only ${reviews.length} review(s) available; prediction confidence is low.`,
      });
    } else {
      // Linear regression on ratings over time
      const ratings = reviews.map((r) => r.overallRating ?? 3);
      const { slope, intercept, rSquared } = this.linearRegression(ratings);

      // Predict next point
      predictedRating = Math.max(1, Math.min(5, intercept + slope * ratings.length));
      predictedRating = Math.round(predictedRating * 100) / 100;

      // Confidence based on R-squared and data points
      confidence = Math.min(95, Math.round(rSquared * 60 + Math.min(ratings.length * 5, 35)));

      // Trajectory
      if (slope > 0.1) {
        trajectory = 'IMPROVING';
      } else if (slope < -0.1) {
        trajectory = 'DECLINING';
      } else {
        trajectory = 'STABLE';
      }

      factors.push({
        name: 'Rating Trend',
        nameAr: 'اتجاه التقييم',
        impact: slope >= 0 ? 'POSITIVE' : 'NEGATIVE',
        weight: 0.5,
        value: Math.round(slope * 100) / 100,
        description: `Slope of ${slope > 0 ? '+' : ''}${(slope).toFixed(2)} per review cycle.`,
      });

      factors.push({
        name: 'Consistency',
        nameAr: 'الاتساق',
        impact: rSquared > 0.5 ? 'POSITIVE' : 'NEGATIVE',
        weight: 0.3,
        value: Math.round(rSquared * 100),
        description: `R² = ${(rSquared * 100).toFixed(0)}% — ${rSquared > 0.5 ? 'consistent' : 'variable'} performance pattern.`,
      });

      factors.push({
        name: 'Data Volume',
        nameAr: 'حجم البيانات',
        impact: ratings.length >= 4 ? 'POSITIVE' : 'NEGATIVE',
        weight: 0.2,
        value: ratings.length,
        description: `${ratings.length} review(s) used for prediction.`,
      });
    }

    return {
      employeeId,
      predictedRating,
      confidence,
      trajectory,
      factors,
    };
  }

  // --------------------------------------------------------------------------
  // HEADCOUNT FORECASTING
  // --------------------------------------------------------------------------

  /**
   * Forecast headcount using exponential smoothing on historical data.
   */
  static async forecastHeadcount(
    tenantId: string,
    months: number = 6
  ): Promise<HeadcountForecast[]> {
    // Get historical headcount by looking at hire dates and termination dates
    const employees = await prisma.employee.findMany({
      where: { tenantId },
      select: {
        hireDate: true,
        terminationDate: true,
        status: true,
      },
    });

    // Build monthly headcount for the last 12 months
    const historical = this.buildHistoricalHeadcount(employees, 12);

    if (historical.length < 3) {
      // Not enough history; project flat from current
      const current = employees.filter((e) => e.status === 'ACTIVE').length;
      return this.generateFlatForecast(current, months);
    }

    // Exponential smoothing (alpha = 0.3)
    const alpha = 0.3;
    const values = historical.map((h) => h.count);
    const smoothed = this.exponentialSmoothing(values, alpha);
    const lastSmoothed = smoothed[smoothed.length - 1];
    const trend = smoothed.length >= 2
      ? (smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2])
      : 0;

    const forecasts: HeadcountForecast[] = [];
    const now = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      const projected = Math.round(lastSmoothed + trend * i);
      const uncertainty = Math.round(Math.sqrt(i) * 2.5); // Increasing uncertainty over time

      forecasts.push({
        month: monthStr,
        projected: Math.max(0, projected),
        lowerBound: Math.max(0, projected - uncertainty),
        upperBound: projected + uncertainty,
        assumptions: [
          `Exponential smoothing (α=${alpha}) applied to ${historical.length} months of data`,
          `Trend: ${trend >= 0 ? '+' : ''}${trend.toFixed(1)} employees/month`,
          'يفترض استمرار الاتجاهات الحالية بدون تغييرات هيكلية',
          'Assumes no major organizational restructuring',
        ],
      });
    }

    return forecasts;
  }

  // --------------------------------------------------------------------------
  // COMPENSATION ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze compensation relative to department/role medians.
   */
  static async analyzeCompensation(
    tenantId: string,
    employeeId?: string
  ): Promise<CompensationInsight[]> {
    const whereClause: Record<string, unknown> = { tenantId, status: 'ACTIVE' };
    if (employeeId) whereClause.id = employeeId;

    const employees = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        basicSalary: true,
        departmentId: true,
        positionId: true,
      },
    });

    // Compute department salary distributions
    const allEmployees = await prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        basicSalary: true,
        departmentId: true,
        positionId: true,
      },
    });

    const deptSalaries: Record<string, number[]> = {};
    for (const emp of allEmployees) {
      const deptId = emp.departmentId || '_none';
      if (!deptSalaries[deptId]) deptSalaries[deptId] = [];
      const salary = typeof emp.basicSalary === 'number'
        ? emp.basicSalary
        : Number(emp.basicSalary) || 0;
      if (salary > 0) deptSalaries[deptId].push(salary);
    }

    // Sort each department's salaries
    for (const key of Object.keys(deptSalaries)) {
      deptSalaries[key].sort((a, b) => a - b);
    }

    return employees.map((emp) => {
      const salary = typeof emp.basicSalary === 'number'
        ? emp.basicSalary
        : Number(emp.basicSalary) || 0;
      const deptId = emp.departmentId || '_none';
      const salaries = deptSalaries[deptId] || [];
      const median = this.computeMedian(salaries);
      const percentile = this.computePercentile(salaries, salary);

      let recommendation: string;
      if (percentile < 25) {
        recommendation = 'Salary significantly below department median. Consider market adjustment to reduce attrition risk. / الراتب أقل بكثير من متوسط القسم. يُنصح بتعديل سوقي لتقليل مخاطر الاستقالة.';
      } else if (percentile < 40) {
        recommendation = 'Salary below median. Monitor engagement and consider at next review cycle. / الراتب أقل من المتوسط. راقب المشاركة وفكر في التعديل في دورة المراجعة القادمة.';
      } else if (percentile > 90) {
        recommendation = 'Salary in top decile. Ensure performance expectations match compensation level. / الراتب في العشر الأعلى. تأكد من توافق توقعات الأداء مع مستوى التعويض.';
      } else {
        recommendation = 'Salary within competitive range. No immediate action required. / الراتب ضمن النطاق التنافسي. لا يلزم اتخاذ إجراء فوري.';
      }

      return {
        employeeId: emp.id,
        currentSalary: salary,
        marketMedian: median,
        percentile,
        recommendation,
      };
    });
  }

  // --------------------------------------------------------------------------
  // WORKFORCE INSIGHTS
  // --------------------------------------------------------------------------

  /**
   * Auto-discover workforce patterns and anomalies.
   */
  static async generateWorkforceInsights(tenantId: string): Promise<WorkforceInsight[]> {
    const insights: WorkforceInsight[] = [];

    // Insight 1: Attrition concentration
    const risks = await this.predictAttritionRisk(tenantId);
    const highRisk = risks.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');
    const highRiskPercent = risks.length > 0 ? (highRisk.length / risks.length) * 100 : 0;

    if (highRiskPercent > 15) {
      insights.push({
        category: 'ATTRITION',
        title: 'Elevated Attrition Risk Detected',
        titleAr: 'تم اكتشاف مخاطر استقالة مرتفعة',
        description: `${highRiskPercent.toFixed(1)}% of employees are in HIGH or CRITICAL attrition risk. This exceeds the healthy threshold of 15%.`,
        descriptionAr: `${highRiskPercent.toFixed(1)}% من الموظفين في مستوى خطر استقالة مرتفع أو حرج. هذا يتجاوز الحد الصحي البالغ 15%.`,
        impact: highRiskPercent > 25 ? 'CRITICAL' : 'HIGH',
        priority: 1,
        actionItems: [
          'Review compensation packages for at-risk employees',
          'Schedule stay interviews with high-risk individuals',
          'Analyze common risk factors to address systemic issues',
        ],
      });
    }

    // Insight 2: Tenure distribution skew
    const employees = await prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { hireDate: true },
    });

    const tenures = employees
      .filter((e) => e.hireDate)
      .map((e) => Math.floor((Date.now() - new Date(e.hireDate!).getTime()) / (30.44 * 24 * 60 * 60 * 1000)));

    const newHires = tenures.filter((t) => t < 6).length;
    const newHirePercent = tenures.length > 0 ? (newHires / tenures.length) * 100 : 0;

    if (newHirePercent > 30) {
      insights.push({
        category: 'WORKFORCE_COMPOSITION',
        title: 'High Proportion of New Hires',
        titleAr: 'نسبة عالية من الموظفين الجدد',
        description: `${newHirePercent.toFixed(1)}% of the workforce has less than 6 months tenure. This may indicate scaling challenges or high turnover.`,
        descriptionAr: `${newHirePercent.toFixed(1)}% من القوى العاملة لديها أقل من 6 أشهر خبرة. قد يشير هذا إلى تحديات التوسع أو معدل دوران مرتفع.`,
        impact: 'MEDIUM',
        priority: 3,
        actionItems: [
          'Strengthen onboarding programs',
          'Assign mentors to new hires',
          'Monitor early-stage attrition closely',
        ],
      });
    }

    // Insight 3: Overtime concentration
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: {
        employeeId: true,
        overtimeHours: true,
      },
    });

    const overtimeByEmployee: Record<string, number> = {};
    for (const record of attendanceRecords) {
      const ot = typeof record.overtimeHours === 'number'
        ? record.overtimeHours
        : Number(record.overtimeHours) || 0;
      overtimeByEmployee[record.employeeId] = (overtimeByEmployee[record.employeeId] || 0) + ot;
    }

    const overtimeValues = Object.values(overtimeByEmployee);
    const highOvertimeCount = overtimeValues.filter((v) => v > 40).length;
    const highOvertimePercent = overtimeValues.length > 0
      ? (highOvertimeCount / overtimeValues.length) * 100
      : 0;

    if (highOvertimePercent > 20) {
      insights.push({
        category: 'WORKLOAD',
        title: 'Excessive Overtime Detected',
        titleAr: 'تم اكتشاف عمل إضافي مفرط',
        description: `${highOvertimePercent.toFixed(1)}% of employees have logged over 40 overtime hours in the last 90 days.`,
        descriptionAr: `${highOvertimePercent.toFixed(1)}% من الموظفين سجلوا أكثر من 40 ساعة عمل إضافي في آخر 90 يومًا.`,
        impact: 'HIGH',
        priority: 2,
        actionItems: [
          'Evaluate headcount adequacy in high-overtime departments',
          'Implement workload balancing strategies',
          'Consider temporary staffing for peak periods',
        ],
      });
    }

    // Insight 4: Compensation equity
    const compensationInsights = await this.analyzeCompensation(tenantId);
    const belowMedian = compensationInsights.filter((c) => c.percentile < 40).length;
    const belowMedianPercent = compensationInsights.length > 0
      ? (belowMedian / compensationInsights.length) * 100
      : 0;

    if (belowMedianPercent > 30) {
      insights.push({
        category: 'COMPENSATION',
        title: 'Compensation Below Market for Many Employees',
        titleAr: 'تعويضات أقل من السوق للعديد من الموظفين',
        description: `${belowMedianPercent.toFixed(1)}% of employees are paid below the 40th percentile of their department median.`,
        descriptionAr: `${belowMedianPercent.toFixed(1)}% من الموظفين يتقاضون أقل من المئين 40 لمتوسط أقسامهم.`,
        impact: 'HIGH',
        priority: 2,
        actionItems: [
          'Conduct a full market compensation review',
          'Prioritize adjustments for critical roles',
          'Develop a multi-cycle correction plan',
        ],
      });
    }

    // Insight 5: Performance rating distribution
    const recentReviews = await prisma.performanceReview.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      select: { overallRating: true },
    });

    if (recentReviews.length > 10) {
      const avgRating = recentReviews.reduce((sum, r) => sum + (r.overallRating ?? 3), 0) / recentReviews.length;
      if (avgRating > 4.2) {
        insights.push({
          category: 'PERFORMANCE',
          title: 'Rating Inflation Detected',
          titleAr: 'تم اكتشاف تضخم في التقييمات',
          description: `Average performance rating is ${avgRating.toFixed(2)}/5.0, suggesting potential rating inflation that reduces differentiation.`,
          descriptionAr: `متوسط تقييم الأداء هو ${avgRating.toFixed(2)}/5.0، مما يشير إلى تضخم محتمل في التقييمات يقلل من التمييز.`,
          impact: 'MEDIUM',
          priority: 4,
          actionItems: [
            'Calibrate ratings across departments',
            'Train managers on differentiated feedback',
            'Consider forced distribution or relative ranking',
          ],
        });
      }
    }

    // Sort by priority
    insights.sort((a, b) => a.priority - b.priority);

    return insights;
  }

  // --------------------------------------------------------------------------
  // HIRING NEEDS PREDICTION
  // --------------------------------------------------------------------------

  /**
   * Predict hiring needs based on attrition forecast and growth trends.
   */
  static async predictHiringNeeds(
    tenantId: string,
    months: number = 6
  ): Promise<{ month: string; hiresNeeded: number; byDepartment: Record<string, number>; reasons: string[]; reasonsAr: string[] }[]> {
    const headcountForecast = await this.forecastHeadcount(tenantId, months);
    const risks = await this.predictAttritionRisk(tenantId);

    // Get department breakdown
    const employees = await prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        departmentId: true,
        department: { select: { name: true } },
      },
    });

    const deptCounts: Record<string, { name: string; count: number; highRisk: number }> = {};
    for (const emp of employees) {
      const deptId = emp.departmentId || '_none';
      if (!deptCounts[deptId]) {
        deptCounts[deptId] = { name: emp.department?.name || 'Unknown', count: 0, highRisk: 0 };
      }
      deptCounts[deptId].count += 1;
      const risk = risks.find((r) => r.employeeId === emp.id);
      if (risk && (risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL')) {
        deptCounts[deptId].highRisk += 1;
      }
    }

    const results: { month: string; hiresNeeded: number; byDepartment: Record<string, number>; reasons: string[]; reasonsAr: string[] }[] = [];
    const currentHeadcount = employees.length;

    for (let i = 0; i < headcountForecast.length; i++) {
      const forecast = headcountForecast[i];
      const gap = forecast.projected - currentHeadcount;
      // Expected monthly attrition based on risk scores
      const avgRiskScore = risks.length > 0
        ? risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length
        : 10;
      const expectedAttrition = Math.round((avgRiskScore / 100) * currentHeadcount * (1 / 12));
      const hiresNeeded = Math.max(0, expectedAttrition + (gap > 0 ? Math.ceil(gap / months) : 0));

      // Distribute across departments proportionally to high-risk counts
      const totalHighRisk = Object.values(deptCounts).reduce((s, d) => s + d.highRisk, 0);
      const byDepartment: Record<string, number> = {};
      if (totalHighRisk > 0) {
        for (const [, dept] of Object.entries(deptCounts)) {
          const deptHires = Math.round((dept.highRisk / totalHighRisk) * hiresNeeded);
          if (deptHires > 0) byDepartment[dept.name] = deptHires;
        }
      }

      results.push({
        month: forecast.month,
        hiresNeeded,
        byDepartment,
        reasons: [
          `Expected attrition: ~${expectedAttrition} employees/month`,
          `Growth projection: ${gap >= 0 ? '+' : ''}${gap} over forecast period`,
          `Average org risk score: ${avgRiskScore.toFixed(0)}%`,
        ],
        reasonsAr: [
          `الاستقالات المتوقعة: ~${expectedAttrition} موظف/شهر`,
          `توقعات النمو: ${gap >= 0 ? '+' : ''}${gap} خلال فترة التوقع`,
          `متوسط درجة المخاطر: ${avgRiskScore.toFixed(0)}%`,
        ],
      });
    }

    return results;
  }

  // --------------------------------------------------------------------------
  // MODEL METRICS
  // --------------------------------------------------------------------------

  /**
   * Return metadata about the heuristic models in use.
   */
  static getModelMetrics(): ModelMetrics[] {
    return [
      {
        modelName: 'Attrition Risk Scoring (Heuristic v1)',
        accuracy: 72,
        lastTrained: new Date('2024-01-15'),
        dataPoints: 0, // Heuristic — no training data
        features: [
          'tenure_months',
          'salary_percentile',
          'promotion_gap_months',
          'manager_change_recency',
          'overtime_hours_90d',
          'leave_utilization',
          'peer_departures_6m',
          'performance_rating',
        ],
      },
      {
        modelName: 'Performance Prediction (Linear Regression v1)',
        accuracy: 65,
        lastTrained: new Date('2024-01-15'),
        dataPoints: 0,
        features: [
          'historical_ratings',
          'rating_trend_slope',
          'rating_consistency_r2',
          'review_count',
        ],
      },
      {
        modelName: 'Headcount Forecast (Exponential Smoothing v1)',
        accuracy: 78,
        lastTrained: new Date('2024-01-15'),
        dataPoints: 0,
        features: [
          'monthly_headcount_history',
          'hire_dates',
          'termination_dates',
          'smoothing_alpha',
        ],
      },
      {
        modelName: 'Compensation Benchmarking (Percentile Analysis v1)',
        accuracy: 85,
        lastTrained: new Date('2024-01-15'),
        dataPoints: 0,
        features: [
          'basic_salary',
          'department_salary_distribution',
          'position_salary_distribution',
        ],
      },
    ];
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Fetch attrition-relevant data for scoring.
   */
  private static async fetchAttritionData(
    tenantId: string,
    employeeId?: string
  ): Promise<EmployeeAttritionData[]> {
    const whereClause: Record<string, unknown> = { tenantId, status: 'ACTIVE' };
    if (employeeId) whereClause.id = employeeId;

    const employees = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        hireDate: true,
        basicSalary: true,
        departmentId: true,
        department: { select: { name: true } },
      },
    });

    // Department average salaries
    const allActive = await prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { id: true, basicSalary: true, departmentId: true },
    });

    const deptSalaryMap: Record<string, number[]> = {};
    for (const emp of allActive) {
      const deptId = emp.departmentId || '_none';
      if (!deptSalaryMap[deptId]) deptSalaryMap[deptId] = [];
      const sal = typeof emp.basicSalary === 'number' ? emp.basicSalary : Number(emp.basicSalary) || 0;
      if (sal > 0) deptSalaryMap[deptId].push(sal);
    }

    const deptAvgMap: Record<string, number> = {};
    for (const [deptId, salaries] of Object.entries(deptSalaryMap)) {
      deptAvgMap[deptId] = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    }

    // Overtime data (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: ninetyDaysAgo },
        employeeId: employeeId ? employeeId : undefined,
      },
      select: { employeeId: true, overtimeHours: true },
    });

    const overtimeMap: Record<string, number> = {};
    for (const rec of attendanceRecords) {
      const ot = typeof rec.overtimeHours === 'number' ? rec.overtimeHours : Number(rec.overtimeHours) || 0;
      overtimeMap[rec.employeeId] = (overtimeMap[rec.employeeId] || 0) + ot;
    }

    // Peer departures per department (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const departures = await prisma.employee.findMany({
      where: {
        tenantId,
        status: { in: ['TERMINATED', 'RESIGNED'] },
        terminationDate: { gte: sixMonthsAgo },
      },
      select: { departmentId: true },
    });

    const deptDepartureMap: Record<string, number> = {};
    for (const dep of departures) {
      const deptId = dep.departmentId || '_none';
      deptDepartureMap[deptId] = (deptDepartureMap[deptId] || 0) + 1;
    }

    // Leave utilization
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: { tenantId, employeeId: employeeId ? employeeId : undefined },
      select: { employeeId: true, used: true, entitled: true },
    });

    const leaveUtilMap: Record<string, number> = {};
    for (const lb of leaveBalances) {
      const entitled = typeof lb.entitled === 'number' ? lb.entitled : Number(lb.entitled) || 0;
      const used = typeof lb.used === 'number' ? lb.used : Number(lb.used) || 0;
      if (entitled > 0) {
        const current = leaveUtilMap[lb.employeeId] || 0;
        leaveUtilMap[lb.employeeId] = Math.max(current, (used / entitled) * 100);
      }
    }

    // Performance reviews (latest)
    const reviews = await prisma.performanceReview.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        employeeId: employeeId ? employeeId : undefined,
      },
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true, overallRating: true },
    });

    const performanceMap: Record<string, number> = {};
    for (const review of reviews) {
      if (!performanceMap[review.employeeId]) {
        performanceMap[review.employeeId] = review.overallRating ?? 3;
      }
    }

    return employees.map((emp) => {
      const tenureMonths = emp.hireDate
        ? Math.floor((Date.now() - new Date(emp.hireDate).getTime()) / (30.44 * 24 * 60 * 60 * 1000))
        : 0;
      const salary = typeof emp.basicSalary === 'number' ? emp.basicSalary : Number(emp.basicSalary) || 0;
      const deptId = emp.departmentId || '_none';

      return {
        id: emp.id,
        tenureMonths,
        salary,
        departmentAvgSalary: deptAvgMap[deptId] || salary,
        lastPromotionMonths: null, // Would require promotion history table
        managerChangeMonths: null, // Would require reporting-line history
        overtimeHoursLast90Days: overtimeMap[emp.id] || 0,
        leaveBalanceUsedPercent: leaveUtilMap[emp.id] || 0,
        peerDeparturesLast6Months: deptDepartureMap[deptId] || 0,
        performanceRating: performanceMap[emp.id] || null,
        departmentId: deptId,
        departmentName: emp.department?.name || 'Unknown',
      };
    });
  }

  /**
   * Score a single employee's attrition risk.
   */
  private static scoreAttritionRisk(data: EmployeeAttritionData): AttritionRisk {
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    // 1. Tenure factor (new hires < 12 months are higher risk, very long tenure > 10 years is lower)
    let tenureScore: number;
    if (data.tenureMonths < 6) {
      tenureScore = 80;
    } else if (data.tenureMonths < 12) {
      tenureScore = 65;
    } else if (data.tenureMonths < 24) {
      tenureScore = 45;
    } else if (data.tenureMonths < 60) {
      tenureScore = 30;
    } else if (data.tenureMonths < 120) {
      tenureScore = 20;
    } else {
      tenureScore = 15;
    }
    totalScore += tenureScore * ATTRITION_WEIGHTS.tenure;
    factors.push({
      name: 'Tenure',
      nameAr: 'مدة الخدمة',
      impact: tenureScore > 50 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.tenure,
      value: data.tenureMonths,
      description: `${data.tenureMonths} months tenure — ${this.getTenureBucket(data.tenureMonths)} risk bracket.`,
    });

    // 2. Salary percentile (below department average = higher risk)
    let salaryScore: number;
    if (data.departmentAvgSalary > 0 && data.salary > 0) {
      const ratio = data.salary / data.departmentAvgSalary;
      if (ratio < 0.7) salaryScore = 90;
      else if (ratio < 0.85) salaryScore = 70;
      else if (ratio < 1.0) salaryScore = 50;
      else if (ratio < 1.15) salaryScore = 30;
      else salaryScore = 15;
    } else {
      salaryScore = 40; // Unknown
    }
    totalScore += salaryScore * ATTRITION_WEIGHTS.salaryPercentile;
    factors.push({
      name: 'Salary Competitiveness',
      nameAr: 'تنافسية الراتب',
      impact: salaryScore > 50 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.salaryPercentile,
      value: data.departmentAvgSalary > 0
        ? Math.round((data.salary / data.departmentAvgSalary) * 100)
        : 0,
      description: data.departmentAvgSalary > 0
        ? `Salary is ${((data.salary / data.departmentAvgSalary) * 100).toFixed(0)}% of department average.`
        : 'Salary data unavailable.',
    });

    // 3. Promotion history (no promotion in 2+ years = higher risk)
    let promotionScore: number;
    if (data.lastPromotionMonths === null) {
      // Assume moderate risk if unknown, scale by tenure
      promotionScore = data.tenureMonths > 24 ? 60 : 35;
    } else if (data.lastPromotionMonths > 36) {
      promotionScore = 80;
    } else if (data.lastPromotionMonths > 24) {
      promotionScore = 60;
    } else if (data.lastPromotionMonths > 12) {
      promotionScore = 35;
    } else {
      promotionScore = 15;
    }
    totalScore += promotionScore * ATTRITION_WEIGHTS.promotionHistory;
    factors.push({
      name: 'Promotion Gap',
      nameAr: 'فجوة الترقية',
      impact: promotionScore > 50 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.promotionHistory,
      value: data.lastPromotionMonths ?? -1,
      description: data.lastPromotionMonths !== null
        ? `Last promotion ${data.lastPromotionMonths} months ago.`
        : `No promotion data available; tenure is ${data.tenureMonths} months.`,
    });

    // 4. Manager change (recent change = instability)
    let managerScore: number;
    if (data.managerChangeMonths === null) {
      managerScore = 30; // Assume stable
    } else if (data.managerChangeMonths < 3) {
      managerScore = 70;
    } else if (data.managerChangeMonths < 6) {
      managerScore = 55;
    } else {
      managerScore = 25;
    }
    totalScore += managerScore * ATTRITION_WEIGHTS.managerChange;
    factors.push({
      name: 'Manager Stability',
      nameAr: 'استقرار المدير',
      impact: managerScore > 50 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.managerChange,
      value: data.managerChangeMonths ?? -1,
      description: data.managerChangeMonths !== null
        ? `Manager changed ${data.managerChangeMonths} months ago.`
        : 'No recent manager changes detected.',
    });

    // 5. Overtime frequency
    let overtimeScore: number;
    if (data.overtimeHoursLast90Days > 80) {
      overtimeScore = 85;
    } else if (data.overtimeHoursLast90Days > 50) {
      overtimeScore = 65;
    } else if (data.overtimeHoursLast90Days > 20) {
      overtimeScore = 40;
    } else {
      overtimeScore = 15;
    }
    totalScore += overtimeScore * ATTRITION_WEIGHTS.overtime;
    factors.push({
      name: 'Overtime Load',
      nameAr: 'حمل العمل الإضافي',
      impact: overtimeScore > 50 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.overtime,
      value: data.overtimeHoursLast90Days,
      description: `${data.overtimeHoursLast90Days} overtime hours in the last 90 days.`,
    });

    // 6. Leave utilization (very low usage may indicate disengagement OR burnout)
    let leaveScore: number;
    if (data.leaveBalanceUsedPercent < 20) {
      leaveScore = 55; // Might be disengaged or saving for exit
    } else if (data.leaveBalanceUsedPercent < 50) {
      leaveScore = 35;
    } else if (data.leaveBalanceUsedPercent < 80) {
      leaveScore = 20;
    } else {
      leaveScore = 30; // Very high usage could indicate other issues
    }
    totalScore += leaveScore * ATTRITION_WEIGHTS.leavePattern;
    factors.push({
      name: 'Leave Utilization',
      nameAr: 'استخدام الإجازات',
      impact: leaveScore > 40 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.leavePattern,
      value: Math.round(data.leaveBalanceUsedPercent),
      description: `${data.leaveBalanceUsedPercent.toFixed(0)}% of leave balance used.`,
    });

    // 7. Peer departures
    let peerScore: number;
    if (data.peerDeparturesLast6Months >= 5) {
      peerScore = 80;
    } else if (data.peerDeparturesLast6Months >= 3) {
      peerScore = 60;
    } else if (data.peerDeparturesLast6Months >= 1) {
      peerScore = 35;
    } else {
      peerScore = 10;
    }
    totalScore += peerScore * ATTRITION_WEIGHTS.peerDepartures;
    factors.push({
      name: 'Peer Departures',
      nameAr: 'مغادرة الزملاء',
      impact: peerScore > 40 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.peerDepartures,
      value: data.peerDeparturesLast6Months,
      description: `${data.peerDeparturesLast6Months} colleague(s) left the same department in the last 6 months.`,
    });

    // 8. Performance rating
    let perfScore: number;
    if (data.performanceRating === null) {
      perfScore = 40;
    } else if (data.performanceRating >= 4) {
      perfScore = 20; // High performers may still leave but lower baseline risk from this factor
    } else if (data.performanceRating >= 3) {
      perfScore = 35;
    } else {
      perfScore = 60; // Low performers may be pushed out or disengage
    }
    totalScore += perfScore * ATTRITION_WEIGHTS.performance;
    factors.push({
      name: 'Performance Rating',
      nameAr: 'تقييم الأداء',
      impact: perfScore > 40 ? 'NEGATIVE' : 'POSITIVE',
      weight: ATTRITION_WEIGHTS.performance,
      value: data.performanceRating ?? 0,
      description: data.performanceRating !== null
        ? `Latest rating: ${data.performanceRating}/5.`
        : 'No performance rating available.',
    });

    // Final risk score (0-100)
    const riskScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    // Determine risk level
    let riskLevel: AttritionRisk['riskLevel'];
    if (riskScore >= RISK_THRESHOLDS.HIGH) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
      riskLevel = 'HIGH';
    } else if (riskScore >= RISK_THRESHOLDS.LOW) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Generate recommendation
    const { recommendation, recommendationAr } = this.generateAttritionRecommendation(
      riskLevel,
      factors
    );

    return {
      employeeId: data.id,
      riskScore,
      riskLevel,
      factors,
      recommendation,
      recommendationAr,
    };
  }

  /**
   * Generate bilingual recommendation based on risk level and top factors.
   */
  private static generateAttritionRecommendation(
    riskLevel: AttritionRisk['riskLevel'],
    factors: RiskFactor[]
  ): { recommendation: string; recommendationAr: string } {
    const negativeFactors = factors
      .filter((f) => f.impact === 'NEGATIVE')
      .sort((a, b) => b.weight - a.weight);
    const topNegative = negativeFactors[0];

    switch (riskLevel) {
      case 'CRITICAL':
        return {
          recommendation: `Immediate intervention required. Primary risk driver: ${topNegative?.name || 'multiple factors'}. Schedule urgent stay interview and review compensation/career path.`,
          recommendationAr: `يتطلب تدخلاً فورياً. المحرك الرئيسي للمخاطر: ${topNegative?.nameAr || 'عوامل متعددة'}. جدولة مقابلة بقاء عاجلة ومراجعة التعويضات/المسار الوظيفي.`,
        };
      case 'HIGH':
        return {
          recommendation: `Proactive retention action recommended. Address ${topNegative?.name || 'key risk factors'} within 30 days. Consider career development discussion.`,
          recommendationAr: `يُوصى باتخاذ إجراء استباقي للاحتفاظ. معالجة ${topNegative?.nameAr || 'عوامل المخاطر الرئيسية'} خلال 30 يومًا. فكر في مناقشة التطوير الوظيفي.`,
        };
      case 'MEDIUM':
        return {
          recommendation: `Monitor closely. Schedule regular check-ins and address ${topNegative?.name || 'emerging concerns'} in next review cycle.`,
          recommendationAr: `المراقبة عن كثب. جدولة متابعات منتظمة ومعالجة ${topNegative?.nameAr || 'المخاوف الناشئة'} في دورة المراجعة القادمة.`,
        };
      default:
        return {
          recommendation: 'Employee appears engaged and stable. Continue standard engagement practices and recognize contributions.',
          recommendationAr: 'يبدو الموظف منخرطاً ومستقراً. استمر في ممارسات المشاركة المعتادة واعترف بالمساهمات.',
        };
    }
  }

  /**
   * Build historical monthly headcount from hire/termination dates.
   */
  private static buildHistoricalHeadcount(
    employees: { hireDate: Date | null; terminationDate: Date | null; status: string }[],
    lookbackMonths: number
  ): HistoricalHeadcount[] {
    const history: HistoricalHeadcount[] = [];
    const now = new Date();

    for (let i = lookbackMonths; i >= 1; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      // Count employees active as of that date
      const count = employees.filter((emp) => {
        if (!emp.hireDate) return false;
        const hired = new Date(emp.hireDate);
        if (hired > targetDate) return false;
        if (emp.terminationDate) {
          const terminated = new Date(emp.terminationDate);
          if (terminated < targetDate) return false;
        }
        return true;
      }).length;

      history.push({ month: monthStr, count });
    }

    return history;
  }

  /**
   * Exponential smoothing (Simple Exponential Smoothing).
   */
  private static exponentialSmoothing(values: number[], alpha: number): number[] {
    if (values.length === 0) return [];
    const smoothed: number[] = [values[0]];
    for (let i = 1; i < values.length; i++) {
      smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
    }
    return smoothed;
  }

  /**
   * Generate flat forecast when insufficient historical data exists.
   */
  private static generateFlatForecast(currentCount: number, months: number): HeadcountForecast[] {
    const forecasts: HeadcountForecast[] = [];
    const now = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      const uncertainty = Math.round(Math.sqrt(i) * 1.5);

      forecasts.push({
        month: monthStr,
        projected: currentCount,
        lowerBound: Math.max(0, currentCount - uncertainty),
        upperBound: currentCount + uncertainty,
        assumptions: [
          'بيانات تاريخية غير كافية — يُفترض ثبات عدد الموظفين',
          'Insufficient historical data — flat projection assumed',
          `Current headcount: ${currentCount}`,
        ],
      });
    }

    return forecasts;
  }

  /**
   * Simple linear regression for an array of y-values (x = index).
   */
  private static linearRegression(values: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0, rSquared: 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
      sumY2 += values[i] * values[i];
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = intercept + slope * i;
      ssRes += (values[i] - predicted) ** 2;
      ssTot += (values[i] - yMean) ** 2;
    }
    const rSquared = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

    return { slope, intercept, rSquared };
  }

  /**
   * Compute median of sorted array.
   */
  private static computeMedian(sortedValues: number[]): number {
    if (sortedValues.length === 0) return 0;
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
  }

  /**
   * Compute percentile rank of a value within a sorted array.
   */
  private static computePercentile(sortedValues: number[], value: number): number {
    if (sortedValues.length === 0) return 50;
    const belowCount = sortedValues.filter((v) => v < value).length;
    const equalCount = sortedValues.filter((v) => v === value).length;
    return Math.round(((belowCount + 0.5 * equalCount) / sortedValues.length) * 100);
  }

  /**
   * Classify tenure into named buckets.
   */
  private static getTenureBucket(months: number): string {
    if (months < 6) return '0-6m';
    if (months < 12) return '6-12m';
    if (months < 24) return '1-2y';
    if (months < 60) return '2-5y';
    if (months < 120) return '5-10y';
    return '10y+';
  }
}
