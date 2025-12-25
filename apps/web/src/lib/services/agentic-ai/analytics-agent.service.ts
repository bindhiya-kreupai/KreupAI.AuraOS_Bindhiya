/**
 * Analytics Agent Service
 * Phase 4 Sprint 31-32: Autonomous Analytics Assistant
 *
 * Handles:
 * - Insight generation
 * - Report creation
 * - Trend analysis
 * - Anomaly detection
 * - Predictive analytics
 */

import type {
  AgentDefinition,
  AgentResponse,
  ConversationContext,
  AnalyticsQueryIntent,
  InsightRequest,
  GeneratedInsight,
  InsightVisualization} from './types';
import {
  AnalyticsAgentCapabilities,
} from './types';
import { AgentFrameworkService } from './agent-framework.service';

/**
 * Metric Definition
 */
interface MetricDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  calculation: string;
  format: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'DURATION';
  trend?: 'HIGHER_BETTER' | 'LOWER_BETTER' | 'NEUTRAL';
}

/**
 * Dashboard Configuration
 */
interface DashboardConfig {
  id: string;
  name: string;
  widgets: {
    id: string;
    type: 'KPI' | 'CHART' | 'TABLE' | 'TREND' | 'COMPARISON';
    metric: string;
    visualization?: InsightVisualization['type'];
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    position: { row: number; col: number };
  }[];
}

/**
 * Analytics Agent Service
 */
export class AnalyticsAgentService {
  private static agentDefinition: AgentDefinition = {
    id: 'analytics_agent_v1',
    type: 'ANALYTICS_AGENT',
    name: 'Analytics Assistant',
    description: 'AI-powered analytics assistant for insights, reports, and workforce analytics',
    capabilities: [
      {
        id: 'insight_generation',
        name: 'Insight Generation',
        description: 'AI-generated insights and recommendations',
        intents: ['GENERATE_INSIGHT', 'ASK_QUESTION', 'EXPLAIN_METRIC'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT'],
        requiredPermissions: ['analytics:read'],
      },
      {
        id: 'report_generation',
        name: 'Report Generation',
        description: 'Create standard and custom reports',
        intents: ['GENERATE_REPORT', 'SCHEDULE_REPORT', 'EXPORT_DATA'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT', 'SEND_NOTIFICATION'],
        requiredPermissions: ['reports:read', 'reports:write'],
      },
      {
        id: 'trend_analysis',
        name: 'Trend Analysis',
        description: 'Analyze historical trends and patterns',
        intents: ['ANALYZE_TREND', 'COMPARE_PERIODS', 'IDENTIFY_PATTERNS'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT'],
        requiredPermissions: ['analytics:read'],
      },
      {
        id: 'anomaly_detection',
        name: 'Anomaly Detection',
        description: 'Detect unusual patterns and outliers',
        intents: ['DETECT_ANOMALY', 'ALERT_REVIEW', 'INVESTIGATE'],
        actions: ['QUERY_DATA', 'SEND_NOTIFICATION'],
        requiredPermissions: ['analytics:read'],
      },
      {
        id: 'predictive_analytics',
        name: 'Predictive Analytics',
        description: 'Forecast future trends and outcomes',
        intents: ['PREDICT', 'FORECAST', 'SCENARIO_ANALYSIS'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT'],
        requiredPermissions: ['analytics:read'],
      },
    ],
    permissions: [
      { resource: 'analytics', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'write'] },
      { resource: 'employees', actions: ['read'] },
      { resource: 'payroll', actions: ['read'] },
      { resource: 'recruitment', actions: ['read'] },
    ],
    configuration: {
      maxConcurrentTasks: 5,
      taskTimeout: 120000,
      retryAttempts: 3,
      retryDelay: 2000,
      autonomyLevel: 'FULL',
      escalationRules: [
        {
          condition: 'anomaly.severity === HIGH',
          action: 'NOTIFY',
          target: 'hr_manager',
          message: 'High severity anomaly detected',
        },
      ],
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Available metrics
   */
  private static metrics: MetricDefinition[] = [
    // Headcount Metrics
    { id: 'total_headcount', name: 'Total Headcount', category: 'Workforce', description: 'Total number of active employees', calculation: 'COUNT(employees WHERE status=ACTIVE)', format: 'NUMBER', trend: 'NEUTRAL' },
    { id: 'new_hires', name: 'New Hires', category: 'Workforce', description: 'Number of new employees joined', calculation: 'COUNT(employees WHERE joinDate >= period.start)', format: 'NUMBER', trend: 'HIGHER_BETTER' },
    { id: 'terminations', name: 'Terminations', category: 'Workforce', description: 'Number of employees who left', calculation: 'COUNT(employees WHERE exitDate >= period.start)', format: 'NUMBER', trend: 'LOWER_BETTER' },
    { id: 'attrition_rate', name: 'Attrition Rate', category: 'Workforce', description: 'Percentage of employees leaving', calculation: 'terminations / avg_headcount * 100', format: 'PERCENTAGE', trend: 'LOWER_BETTER' },
    { id: 'retention_rate', name: 'Retention Rate', category: 'Workforce', description: 'Percentage of employees retained', calculation: '100 - attrition_rate', format: 'PERCENTAGE', trend: 'HIGHER_BETTER' },

    // Recruitment Metrics
    { id: 'open_positions', name: 'Open Positions', category: 'Recruitment', description: 'Number of unfilled positions', calculation: 'COUNT(jobs WHERE status=OPEN)', format: 'NUMBER', trend: 'LOWER_BETTER' },
    { id: 'time_to_hire', name: 'Time to Hire', category: 'Recruitment', description: 'Average days to fill a position', calculation: 'AVG(hired_date - posted_date)', format: 'DURATION', trend: 'LOWER_BETTER' },
    { id: 'cost_per_hire', name: 'Cost Per Hire', category: 'Recruitment', description: 'Average recruitment cost per hire', calculation: 'recruitment_spend / total_hires', format: 'CURRENCY', trend: 'LOWER_BETTER' },
    { id: 'offer_acceptance_rate', name: 'Offer Acceptance Rate', category: 'Recruitment', description: 'Percentage of offers accepted', calculation: 'accepted_offers / total_offers * 100', format: 'PERCENTAGE', trend: 'HIGHER_BETTER' },

    // Attendance Metrics
    { id: 'absenteeism_rate', name: 'Absenteeism Rate', category: 'Attendance', description: 'Percentage of unplanned absences', calculation: 'absent_days / total_workdays * 100', format: 'PERCENTAGE', trend: 'LOWER_BETTER' },
    { id: 'avg_overtime', name: 'Average Overtime', category: 'Attendance', description: 'Average overtime hours per employee', calculation: 'SUM(overtime_hours) / headcount', format: 'DURATION', trend: 'NEUTRAL' },
    { id: 'leave_utilization', name: 'Leave Utilization', category: 'Attendance', description: 'Percentage of entitled leaves used', calculation: 'leaves_used / leaves_entitled * 100', format: 'PERCENTAGE', trend: 'NEUTRAL' },

    // Payroll Metrics
    { id: 'total_payroll', name: 'Total Payroll', category: 'Compensation', description: 'Total salary disbursement', calculation: 'SUM(net_salary)', format: 'CURRENCY', trend: 'NEUTRAL' },
    { id: 'avg_salary', name: 'Average Salary', category: 'Compensation', description: 'Average employee salary', calculation: 'total_payroll / headcount', format: 'CURRENCY', trend: 'NEUTRAL' },
    { id: 'salary_budget_variance', name: 'Salary Budget Variance', category: 'Compensation', description: 'Difference from budgeted payroll', calculation: '(actual_payroll - budgeted_payroll) / budgeted_payroll * 100', format: 'PERCENTAGE', trend: 'LOWER_BETTER' },

    // Performance Metrics
    { id: 'avg_performance_score', name: 'Avg Performance Score', category: 'Performance', description: 'Average employee performance rating', calculation: 'AVG(performance_score)', format: 'NUMBER', trend: 'HIGHER_BETTER' },
    { id: 'high_performers', name: 'High Performers', category: 'Performance', description: 'Employees with top ratings', calculation: 'COUNT(employees WHERE performance_score >= 4)', format: 'NUMBER', trend: 'HIGHER_BETTER' },
    { id: 'training_hours', name: 'Training Hours', category: 'Development', description: 'Total training hours delivered', calculation: 'SUM(training_hours)', format: 'DURATION', trend: 'HIGHER_BETTER' },

    // Engagement Metrics
    { id: 'enps', name: 'Employee NPS', category: 'Engagement', description: 'Employee Net Promoter Score', calculation: 'promoters - detractors', format: 'NUMBER', trend: 'HIGHER_BETTER' },
    { id: 'survey_participation', name: 'Survey Participation', category: 'Engagement', description: 'Survey response rate', calculation: 'responses / sent * 100', format: 'PERCENTAGE', trend: 'HIGHER_BETTER' },
  ];

  /**
   * Initialize Analytics Agent
   */
  static initialize(): void {
    AgentFrameworkService.registerAgent(this.agentDefinition);
  }

  /**
   * Get agent definition
   */
  static getDefinition(): AgentDefinition {
    return this.agentDefinition;
  }

  // ============================================================================
  // INSIGHT GENERATION
  // ============================================================================

  /**
   * Generate insight for a specific domain
   */
  static async generateInsight(
    request: InsightRequest,
    tenantId: string
  ): Promise<GeneratedInsight> {
    const insights = await this.analyzeData(request.domain, tenantId);

    const insight: GeneratedInsight = {
      id: `insight_${Date.now()}`,
      title: this.generateInsightTitle(request),
      summary: insights.summary,
      details: insights.details,
      impact: insights.impact,
      category: request.domain,
      metrics: insights.metrics,
      recommendations: insights.recommendations,
      visualizations: insights.visualizations,
      confidence: insights.confidence,
      generatedAt: new Date(),
    };

    return insight;
  }

  /**
   * Analyze data for insights
   */
  private static async analyzeData(
    domain: InsightRequest['domain'],
    tenantId: string
  ): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    switch (domain) {
      case 'HR':
        return this.analyzeHRData(tenantId);
      case 'RECRUITMENT':
        return this.analyzeRecruitmentData(tenantId);
      case 'PAYROLL':
        return this.analyzePayrollData(tenantId);
      case 'PERFORMANCE':
        return this.analyzePerformanceData(tenantId);
      case 'WORKFORCE':
      default:
        return this.analyzeWorkforceData(tenantId);
    }
  }

  /**
   * Analyze HR data
   */
  private static async analyzeHRData(tenantId: string): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    return {
      summary: 'Attrition rate has decreased by 2.3% compared to last quarter, indicating improved retention.',
      details: `Analysis of HR metrics reveals several positive trends:

1. **Attrition Improvement**: The attrition rate dropped from 10.8% to 8.5%, a 21% improvement
2. **New Hire Quality**: 85% of new hires passed probation, up from 78% last quarter
3. **Leave Patterns**: Average leave utilization is healthy at 72%, indicating good work-life balance
4. **Engagement**: eNPS improved from +12 to +18, showing higher employee satisfaction`,
      impact: 'HIGH',
      metrics: [
        { name: 'Attrition Rate', value: 8.5, change: -2.3, trend: 'down' },
        { name: 'Headcount', value: 1250, change: 45, trend: 'up' },
        { name: 'Avg Tenure', value: 3.2, change: 0.3, trend: 'up' },
        { name: 'eNPS', value: 18, change: 6, trend: 'up' },
      ],
      recommendations: [
        'Continue the mentorship program that contributed to improved retention',
        'Expand the flexible work policy to departments showing higher engagement',
        'Address the 3 departments with above-average attrition rates',
        'Recognize the 12 long-tenured employees reaching 10-year milestone',
      ],
      visualizations: [
        {
          type: 'LINE',
          title: 'Attrition Trend (12 months)',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{ values: [11.2, 10.8, 10.5, 10.2, 9.8, 9.5, 9.2, 9.0, 8.8, 8.7, 8.5, 8.5] }],
          },
        },
      ],
      confidence: 0.92,
    };
  }

  /**
   * Analyze recruitment data
   */
  private static async analyzeRecruitmentData(tenantId: string): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    return {
      summary: 'Time-to-hire reduced by 5 days while maintaining quality of hire above target.',
      details: `Recruitment efficiency analysis shows:

1. **Speed**: Average time-to-hire is now 28 days (down from 33 days)
2. **Quality**: 89% of hires rated "meets/exceeds expectations" at 6-month review
3. **Sources**: Employee referrals yield highest quality (92%) vs job portals (67%)
4. **Pipeline**: 156 active candidates across 8 open positions
5. **Bottleneck**: Technical interview stage shows 12-day average wait time`,
      impact: 'MEDIUM',
      metrics: [
        { name: 'Time to Hire', value: 28, change: -5, trend: 'down' },
        { name: 'Open Positions', value: 8, change: -3, trend: 'down' },
        { name: 'Offer Acceptance', value: 85, change: 5, trend: 'up' },
        { name: 'Cost per Hire', value: 45000, change: -5000, trend: 'down' },
      ],
      recommendations: [
        'Increase employee referral bonus to boost high-quality source',
        'Add more interviewers to reduce technical round wait time',
        'Implement structured interviews for consistency',
        'Consider campus hiring for entry-level positions',
      ],
      visualizations: [
        {
          type: 'BAR',
          title: 'Candidates by Source Quality',
          data: {
            labels: ['Referral', 'LinkedIn', 'Direct', 'Job Portal'],
            datasets: [{ values: [92, 78, 72, 67] }],
          },
        },
      ],
      confidence: 0.88,
    };
  }

  /**
   * Analyze payroll data
   */
  private static async analyzePayrollData(tenantId: string): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    return {
      summary: 'Payroll costs are within 2% of budget with no compliance issues detected.',
      details: `Payroll analysis summary:

1. **Budget Adherence**: Total payroll at ₹8.2Cr against ₹8.35Cr budget (1.8% under)
2. **Overtime**: Overtime costs increased 15% - Engineering department accounts for 68%
3. **Compliance**: All statutory payments (PF, ESI, PT) processed on time
4. **Salary Structure**: 12% of employees due for increment review
5. **Tax Optimization**: ₹45L potential savings identified through regime optimization`,
      impact: 'MEDIUM',
      metrics: [
        { name: 'Total Payroll', value: 82000000, change: 2000000, trend: 'up' },
        { name: 'Budget Variance', value: -1.8, trend: 'down' },
        { name: 'Avg Salary', value: 65600, change: 3200, trend: 'up' },
        { name: 'Overtime %', value: 8.5, change: 1.2, trend: 'up' },
      ],
      recommendations: [
        'Review overtime policy for Engineering department',
        'Process pending increment reviews to avoid backlog',
        'Send tax optimization suggestions to eligible employees',
        'Consider quarterly salary budget reviews for better planning',
      ],
      visualizations: [
        {
          type: 'PIE',
          title: 'Payroll Distribution',
          data: {
            labels: ['Basic', 'HRA', 'Special Allowance', 'Other'],
            datasets: [{ values: [50, 20, 18, 12] }],
          },
        },
      ],
      confidence: 0.95,
    };
  }

  /**
   * Analyze performance data
   */
  private static async analyzePerformanceData(tenantId: string): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    return {
      summary: 'Performance distribution shows healthy bell curve with 18% high performers.',
      details: `Performance metrics analysis:

1. **Distribution**: 5 - 8%, 4 - 28%, 3 - 46%, 2 - 14%, 1 - 4%
2. **Improvement**: 23% of employees improved their rating year-over-year
3. **Correlation**: High performers have 40% lower attrition rate
4. **Goals**: 78% of employees on track for their annual goals
5. **Training**: Employees with 20+ training hours show 15% higher performance`,
      impact: 'HIGH',
      metrics: [
        { name: 'Avg Score', value: 3.4, change: 0.2, trend: 'up' },
        { name: 'High Performers', value: 225, change: 32, trend: 'up' },
        { name: 'Goal Completion', value: 78, change: 8, trend: 'up' },
        { name: 'Training Hours', value: 2840, change: 340, trend: 'up' },
      ],
      recommendations: [
        'Create succession plan for high performers in critical roles',
        'Implement PIPs for the 4% low performers with clear milestones',
        'Increase training budget to replicate success pattern',
        'Recognize top performers publicly in upcoming town hall',
      ],
      visualizations: [
        {
          type: 'BAR',
          title: 'Performance Rating Distribution',
          data: {
            labels: ['5 - Exceptional', '4 - Exceeds', '3 - Meets', '2 - Below', '1 - Unsatisfactory'],
            datasets: [{ values: [8, 28, 46, 14, 4] }],
          },
        },
      ],
      confidence: 0.91,
    };
  }

  /**
   * Analyze workforce data
   */
  private static async analyzeWorkforceData(tenantId: string): Promise<{
    summary: string;
    details: string;
    impact: GeneratedInsight['impact'];
    metrics: GeneratedInsight['metrics'];
    recommendations: string[];
    visualizations: InsightVisualization[];
    confidence: number;
  }> {
    return {
      summary: 'Workforce is growing steadily with healthy diversity and skill distribution.',
      details: `Comprehensive workforce analysis:

1. **Size**: 1,250 employees (+3.7% QoQ), targeting 1,400 by EOY
2. **Demographics**: Avg age 32, 38% female representation
3. **Tenure**: Avg tenure 3.2 years, 15% with 5+ years
4. **Skills**: 45% technical, 30% operations, 25% corporate functions
5. **Remote**: 35% work hybrid, 15% fully remote
6. **Contractor Mix**: 8% contingent workforce`,
      impact: 'MEDIUM',
      metrics: [
        { name: 'Total Employees', value: 1250, change: 45, trend: 'up' },
        { name: 'Gender Ratio', value: 38, change: 2, trend: 'up' },
        { name: 'Avg Age', value: 32, change: 0, trend: 'stable' },
        { name: 'Avg Tenure', value: 3.2, change: 0.1, trend: 'up' },
      ],
      recommendations: [
        'Focus on mid-senior hiring to balance experience ratio',
        'Expand diversity initiatives to reach 40% female target',
        'Create skill development paths for in-demand capabilities',
        'Review contractor-to-FTE conversion for long-term positions',
      ],
      visualizations: [
        {
          type: 'PIE',
          title: 'Workforce by Function',
          data: {
            labels: ['Technical', 'Operations', 'Corporate'],
            datasets: [{ values: [45, 30, 25] }],
          },
        },
        {
          type: 'BAR',
          title: 'Headcount by Department',
          data: {
            labels: ['Engineering', 'Sales', 'Operations', 'HR', 'Finance', 'Marketing'],
            datasets: [{ values: [450, 280, 220, 85, 120, 95] }],
          },
        },
      ],
      confidence: 0.94,
    };
  }

  /**
   * Generate insight title
   */
  private static generateInsightTitle(request: InsightRequest): string {
    const titles: Record<InsightRequest['domain'], string> = {
      HR: 'HR & Employee Metrics Analysis',
      RECRUITMENT: 'Recruitment Pipeline Analysis',
      PAYROLL: 'Compensation & Payroll Analysis',
      PERFORMANCE: 'Performance Management Analysis',
      WORKFORCE: 'Workforce Composition Analysis',
    };
    return titles[request.domain] || 'Analytics Insight';
  }

  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================

  /**
   * Analyze trends
   */
  static async analyzeTrend(
    metricId: string,
    tenantId: string,
    period: { start: Date; end: Date },
    granularity: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER'
  ): Promise<{
    metric: MetricDefinition;
    data: { date: Date; value: number }[];
    trend: {
      direction: 'UP' | 'DOWN' | 'STABLE';
      changePercent: number;
      significance: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    forecast: { date: Date; value: number; confidence: number }[];
    insights: string[];
  }> {
    const metric = this.metrics.find(m => m.id === metricId);
    if (!metric) {
      throw new Error('Metric not found');
    }

    // Generate mock trend data
    const dataPoints = this.generateTrendData(period, granularity);

    // Calculate trend
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    const direction = changePercent > 2 ? 'UP' : changePercent < -2 ? 'DOWN' : 'STABLE';
    const significance = Math.abs(changePercent) > 10 ? 'HIGH' : Math.abs(changePercent) > 5 ? 'MEDIUM' : 'LOW';

    // Generate forecast
    const forecast = this.generateForecast(dataPoints, 3);

    // Generate insights
    const insights = this.generateTrendInsights(metric, direction, changePercent);

    return {
      metric,
      data: dataPoints,
      trend: { direction, changePercent, significance },
      forecast,
      insights,
    };
  }

  /**
   * Generate trend data
   */
  private static generateTrendData(
    period: { start: Date; end: Date },
    granularity: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER'
  ): { date: Date; value: number }[] {
    const data: { date: Date; value: number }[] = [];
    const current = new Date(period.start);
    let baseValue = 100;

    while (current <= period.end) {
      // Add some randomness and trend
      baseValue = baseValue * (1 + (Math.random() - 0.45) * 0.1);

      data.push({
        date: new Date(current),
        value: Math.round(baseValue * 10) / 10,
      });

      switch (granularity) {
        case 'DAY':
          current.setDate(current.getDate() + 1);
          break;
        case 'WEEK':
          current.setDate(current.getDate() + 7);
          break;
        case 'MONTH':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'QUARTER':
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }

    return data;
  }

  /**
   * Generate forecast
   */
  private static generateForecast(
    historicalData: { date: Date; value: number }[],
    periods: number
  ): { date: Date; value: number; confidence: number }[] {
    const forecast: { date: Date; value: number; confidence: number }[] = [];
    const lastDate = historicalData[historicalData.length - 1].date;
    const lastValue = historicalData[historicalData.length - 1].value;

    // Simple linear forecast
    const trend = (lastValue - historicalData[0].value) / historicalData.length;

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      forecast.push({
        date: forecastDate,
        value: Math.round((lastValue + trend * i) * 10) / 10,
        confidence: Math.max(0.5, 0.95 - i * 0.1),
      });
    }

    return forecast;
  }

  /**
   * Generate trend insights
   */
  private static generateTrendInsights(
    metric: MetricDefinition,
    direction: 'UP' | 'DOWN' | 'STABLE',
    changePercent: number
  ): string[] {
    const insights: string[] = [];

    const isPositive = (metric.trend === 'HIGHER_BETTER' && direction === 'UP') ||
                      (metric.trend === 'LOWER_BETTER' && direction === 'DOWN');

    if (direction === 'STABLE') {
      insights.push(`${metric.name} has remained stable with minimal variation.`);
    } else {
      insights.push(
        `${metric.name} has ${direction === 'UP' ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%.`
      );

      if (isPositive) {
        insights.push('This trend is favorable based on the metric\'s target direction.');
      } else if (metric.trend !== 'NEUTRAL') {
        insights.push('This trend requires attention as it moves against the target direction.');
      }
    }

    return insights;
  }

  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================

  /**
   * Detect anomalies
   */
  static async detectAnomalies(
    tenantId: string,
    domain: InsightRequest['domain']
  ): Promise<{
    anomalies: {
      id: string;
      metric: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      description: string;
      expectedValue: number;
      actualValue: number;
      deviation: number;
      timestamp: Date;
      recommendations: string[];
    }[];
    summary: string;
  }> {
    // Mock anomaly detection
    const anomalies = [
      {
        id: 'anom_001',
        metric: 'Overtime Hours',
        severity: 'HIGH' as const,
        description: 'Engineering department overtime is 3x normal levels',
        expectedValue: 120,
        actualValue: 380,
        deviation: 216.7,
        timestamp: new Date(),
        recommendations: [
          'Review project deadlines and resource allocation',
          'Consider temporary staff augmentation',
          'Evaluate work distribution across team',
        ],
      },
      {
        id: 'anom_002',
        metric: 'Sick Leave Usage',
        severity: 'MEDIUM' as const,
        description: 'Unusual spike in sick leave in Operations team',
        expectedValue: 15,
        actualValue: 28,
        deviation: 86.7,
        timestamp: new Date(),
        recommendations: [
          'Investigate potential workplace health concerns',
          'Review workload and stress levels',
          'Consider team wellness initiatives',
        ],
      },
    ];

    return {
      anomalies,
      summary: `Detected ${anomalies.length} anomalies: ${anomalies.filter(a => a.severity === 'HIGH').length} high severity, ${anomalies.filter(a => a.severity === 'MEDIUM').length} medium severity.`,
    };
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  /**
   * Generate report
   */
  static async generateReport(
    reportType: 'HR_DASHBOARD' | 'RECRUITMENT_SUMMARY' | 'PAYROLL_ANALYSIS' | 'WORKFORCE_REVIEW' | 'CUSTOM',
    tenantId: string,
    options?: {
      period?: { start: Date; end: Date };
      departments?: string[];
      format?: 'PDF' | 'EXCEL' | 'HTML';
    }
  ): Promise<{
    id: string;
    name: string;
    type: string;
    generatedAt: Date;
    sections: {
      title: string;
      content: string;
      metrics?: { name: string; value: number | string; change?: string }[];
      charts?: InsightVisualization[];
    }[];
    downloadUrl: string;
  }> {
    const reportConfigs: Record<string, { name: string; sections: string[] }> = {
      HR_DASHBOARD: {
        name: 'HR Dashboard Report',
        sections: ['Executive Summary', 'Headcount Analysis', 'Attrition Trends', 'Engagement Metrics'],
      },
      RECRUITMENT_SUMMARY: {
        name: 'Recruitment Summary Report',
        sections: ['Hiring Overview', 'Pipeline Status', 'Source Analysis', 'Time & Cost Metrics'],
      },
      PAYROLL_ANALYSIS: {
        name: 'Payroll Analysis Report',
        sections: ['Compensation Summary', 'Budget Analysis', 'Statutory Compliance', 'Trends'],
      },
      WORKFORCE_REVIEW: {
        name: 'Workforce Review Report',
        sections: ['Demographics', 'Skills Distribution', 'Organization Structure', 'Predictions'],
      },
      CUSTOM: {
        name: 'Custom Analytics Report',
        sections: ['Custom Metrics', 'Analysis', 'Recommendations'],
      },
    };

    const config = reportConfigs[reportType] || reportConfigs.CUSTOM;

    const report = {
      id: `rpt_${Date.now()}`,
      name: config.name,
      type: reportType,
      generatedAt: new Date(),
      sections: config.sections.map((title, index) => ({
        title,
        content: `Analysis content for ${title}...`,
        metrics: [
          { name: 'Key Metric 1', value: Math.round(Math.random() * 1000), change: '+5%' },
          { name: 'Key Metric 2', value: Math.round(Math.random() * 100), change: '-2%' },
        ],
      })),
      downloadUrl: `/api/reports/download/rpt_${Date.now()}`,
    };

    return report;
  }

  // ============================================================================
  // CONVERSATION HANDLING
  // ============================================================================

  /**
   * Handle analytics query intent
   */
  static async handleQueryIntent(
    intent: AnalyticsQueryIntent,
    context: ConversationContext
  ): Promise<AgentResponse> {
    let content = '';
    const visualizations: InsightVisualization[] = [];

    switch (intent.type) {
      case 'METRIC': {
        const metricsData = await this.getMetricsData(intent.metrics, context.tenantId);
        content = this.formatMetrics(metricsData);
        break;
      }

      case 'TREND': {
        const trend = await this.analyzeTrend(
          intent.metrics[0],
          context.tenantId,
          intent.dateRange || { start: new Date(Date.now() - 90 * 86400000), end: new Date() },
          intent.granularity || 'MONTH'
        );
        content = this.formatTrend(trend);
        break;
      }

      case 'COMPARISON': {
        content = await this.formatComparison(intent, context.tenantId);
        break;
      }

      case 'FORECAST': {
        const forecast = await this.generateForecastReport(intent.metrics[0], context.tenantId);
        content = this.formatForecast(forecast);
        break;
      }

      case 'ANOMALY': {
        const anomalies = await this.detectAnomalies(context.tenantId, 'WORKFORCE');
        content = this.formatAnomalies(anomalies);
        break;
      }
    }

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: 'ANALYTICS_AGENT',
      content,
      contentType: 'markdown',
      suggestions: [
        { id: '1', type: 'quick_reply', label: 'Generate report', value: 'Generate HR dashboard report' },
        { id: '2', type: 'quick_reply', label: 'Show trends', value: 'Show attrition trends' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Get metrics data
   */
  private static async getMetricsData(
    metricIds: string[],
    tenantId: string
  ): Promise<{ metric: MetricDefinition; value: number; previousValue: number }[]> {
    return metricIds.map(id => {
      const metric = this.metrics.find(m => m.id === id) || this.metrics[0];
      return {
        metric,
        value: Math.round(Math.random() * 100),
        previousValue: Math.round(Math.random() * 100),
      };
    });
  }

  /**
   * Generate forecast report
   */
  private static async generateForecastReport(
    metricId: string,
    tenantId: string
  ): Promise<{
    metric: string;
    currentValue: number;
    forecasts: { period: string; value: number; confidence: number }[];
    factors: string[];
  }> {
    return {
      metric: 'Headcount',
      currentValue: 1250,
      forecasts: [
        { period: 'Q1 2025', value: 1290, confidence: 0.92 },
        { period: 'Q2 2025', value: 1340, confidence: 0.85 },
        { period: 'Q3 2025', value: 1380, confidence: 0.78 },
        { period: 'Q4 2025', value: 1420, confidence: 0.70 },
      ],
      factors: [
        'Current hiring rate: 15/month',
        'Historical attrition: 8.5%',
        'Planned expansions: 2 departments',
      ],
    };
  }

  /**
   * Format metrics
   */
  private static formatMetrics(
    data: { metric: MetricDefinition; value: number; previousValue: number }[]
  ): string {
    let result = '**📊 Key Metrics**\n\n';
    result += '| Metric | Current | Previous | Change |\n';
    result += '|--------|---------|----------|--------|\n';

    for (const { metric, value, previousValue } of data) {
      const change = value - previousValue;
      const changeStr = change >= 0 ? `+${change}` : `${change}`;
      const emoji = (metric.trend === 'HIGHER_BETTER' && change > 0) ||
                   (metric.trend === 'LOWER_BETTER' && change < 0) ? '✅' :
                   (metric.trend === 'NEUTRAL') ? '➡️' : '⚠️';

      result += `| ${metric.name} | ${value} | ${previousValue} | ${changeStr} ${emoji} |\n`;
    }

    return result;
  }

  /**
   * Format trend
   */
  private static formatTrend(trend: {
    metric: MetricDefinition;
    trend: { direction: string; changePercent: number };
    insights: string[];
    forecast: { date: Date; value: number; confidence: number }[];
  }): string {
    let result = `**📈 ${trend.metric.name} Trend Analysis**\n\n`;

    const arrow = trend.trend.direction === 'UP' ? '↗️' :
                  trend.trend.direction === 'DOWN' ? '↘️' : '➡️';

    result += `**Trend:** ${arrow} ${trend.trend.direction} (${trend.trend.changePercent.toFixed(1)}%)\n\n`;

    result += '**Insights:**\n';
    for (const insight of trend.insights) {
      result += `- ${insight}\n`;
    }

    if (trend.forecast.length > 0) {
      result += '\n**Forecast:**\n';
      for (const f of trend.forecast) {
        result += `- ${f.date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}: ${f.value} (${Math.round(f.confidence * 100)}% confidence)\n`;
      }
    }

    return result;
  }

  /**
   * Format comparison
   */
  private static async formatComparison(
    intent: AnalyticsQueryIntent,
    tenantId: string
  ): Promise<string> {
    let result = '**📊 Period Comparison**\n\n';

    result += '| Metric | Current Period | Previous Period | Change |\n';
    result += '|--------|----------------|-----------------|--------|\n';

    const comparisons = [
      { name: 'Headcount', current: 1250, previous: 1205, change: '+3.7%' },
      { name: 'Attrition', current: '8.5%', previous: '10.8%', change: '-2.3pp' },
      { name: 'Hiring', current: 45, previous: 38, change: '+18.4%' },
      { name: 'Avg Salary', current: '₹65,600', previous: '₹62,400', change: '+5.1%' },
    ];

    for (const c of comparisons) {
      result += `| ${c.name} | ${c.current} | ${c.previous} | ${c.change} |\n`;
    }

    return result;
  }

  /**
   * Format forecast
   */
  private static formatForecast(forecast: {
    metric: string;
    currentValue: number;
    forecasts: { period: string; value: number; confidence: number }[];
    factors: string[];
  }): string {
    let result = `**🔮 ${forecast.metric} Forecast**\n\n`;

    result += `Current Value: **${forecast.currentValue.toLocaleString()}**\n\n`;

    result += '| Period | Forecast | Confidence |\n';
    result += '|--------|----------|------------|\n';

    for (const f of forecast.forecasts) {
      result += `| ${f.period} | ${f.value.toLocaleString()} | ${Math.round(f.confidence * 100)}% |\n`;
    }

    result += '\n**Key Factors:**\n';
    for (const factor of forecast.factors) {
      result += `- ${factor}\n`;
    }

    return result;
  }

  /**
   * Format anomalies
   */
  private static formatAnomalies(result: {
    anomalies: {
      metric: string;
      severity: string;
      description: string;
      deviation: number;
      recommendations: string[];
    }[];
    summary: string;
  }): string {
    let output = '**🚨 Anomaly Detection Results**\n\n';
    output += `${result.summary}\n\n`;

    for (const anomaly of result.anomalies) {
      const icon = anomaly.severity === 'HIGH' ? '🔴' :
                   anomaly.severity === 'MEDIUM' ? '🟡' : '🟢';

      output += `${icon} **${anomaly.metric}** (${anomaly.severity})\n`;
      output += `${anomaly.description}\n`;
      output += `Deviation: ${anomaly.deviation.toFixed(1)}%\n\n`;

      output += 'Recommendations:\n';
      for (const rec of anomaly.recommendations) {
        output += `  - ${rec}\n`;
      }
      output += '\n';
    }

    return output;
  }
}

// Initialize on module load
AnalyticsAgentService.initialize();
