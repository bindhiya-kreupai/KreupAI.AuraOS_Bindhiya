// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
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
  InsightVisualization,
} from './types';
import { AnalyticsAgentCapabilities } from './types';
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
    {
      id: 'total_headcount',
      name: 'Total Headcount',
      category: 'Workforce',
      description: 'Total number of active employees',
      calculation: 'COUNT(employees WHERE status=ACTIVE)',
      format: 'NUMBER',
      trend: 'NEUTRAL',
    },
    {
      id: 'new_hires',
      name: 'New Hires',
      category: 'Workforce',
      description: 'Number of new employees joined',
      calculation: 'COUNT(employees WHERE joinDate >= period.start)',
      format: 'NUMBER',
      trend: 'HIGHER_BETTER',
    },
    {
      id: 'terminations',
      name: 'Terminations',
      category: 'Workforce',
      description: 'Number of employees who left',
      calculation: 'COUNT(employees WHERE exitDate >= period.start)',
      format: 'NUMBER',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'attrition_rate',
      name: 'Attrition Rate',
      category: 'Workforce',
      description: 'Percentage of employees leaving',
      calculation: 'terminations / avg_headcount * 100',
      format: 'PERCENTAGE',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'retention_rate',
      name: 'Retention Rate',
      category: 'Workforce',
      description: 'Percentage of employees retained',
      calculation: '100 - attrition_rate',
      format: 'PERCENTAGE',
      trend: 'HIGHER_BETTER',
    },

    // Recruitment Metrics
    {
      id: 'open_positions',
      name: 'Open Positions',
      category: 'Recruitment',
      description: 'Number of unfilled positions',
      calculation: 'COUNT(jobs WHERE status=OPEN)',
      format: 'NUMBER',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'time_to_hire',
      name: 'Time to Hire',
      category: 'Recruitment',
      description: 'Average days to fill a position',
      calculation: 'AVG(hired_date - posted_date)',
      format: 'DURATION',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'cost_per_hire',
      name: 'Cost Per Hire',
      category: 'Recruitment',
      description: 'Average recruitment cost per hire',
      calculation: 'recruitment_spend / total_hires',
      format: 'CURRENCY',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'offer_acceptance_rate',
      name: 'Offer Acceptance Rate',
      category: 'Recruitment',
      description: 'Percentage of offers accepted',
      calculation: 'accepted_offers / total_offers * 100',
      format: 'PERCENTAGE',
      trend: 'HIGHER_BETTER',
    },

    // Attendance Metrics
    {
      id: 'absenteeism_rate',
      name: 'Absenteeism Rate',
      category: 'Attendance',
      description: 'Percentage of unplanned absences',
      calculation: 'absent_days / total_workdays * 100',
      format: 'PERCENTAGE',
      trend: 'LOWER_BETTER',
    },
    {
      id: 'avg_overtime',
      name: 'Average Overtime',
      category: 'Attendance',
      description: 'Average overtime hours per employee',
      calculation: 'SUM(overtime_hours) / headcount',
      format: 'DURATION',
      trend: 'NEUTRAL',
    },
    {
      id: 'leave_utilization',
      name: 'Leave Utilization',
      category: 'Attendance',
      description: 'Percentage of entitled leaves used',
      calculation: 'leaves_used / leaves_entitled * 100',
      format: 'PERCENTAGE',
      trend: 'NEUTRAL',
    },

    // Payroll Metrics
    {
      id: 'total_payroll',
      name: 'Total Payroll',
      category: 'Compensation',
      description: 'Total salary disbursement',
      calculation: 'SUM(net_salary)',
      format: 'CURRENCY',
      trend: 'NEUTRAL',
    },
    {
      id: 'avg_salary',
      name: 'Average Salary',
      category: 'Compensation',
      description: 'Average employee salary',
      calculation: 'total_payroll / headcount',
      format: 'CURRENCY',
      trend: 'NEUTRAL',
    },
    {
      id: 'salary_budget_variance',
      name: 'Salary Budget Variance',
      category: 'Compensation',
      description: 'Difference from budgeted payroll',
      calculation: '(actual_payroll - budgeted_payroll) / budgeted_payroll * 100',
      format: 'PERCENTAGE',
      trend: 'LOWER_BETTER',
    },

    // Performance Metrics
    {
      id: 'avg_performance_score',
      name: 'Avg Performance Score',
      category: 'Performance',
      description: 'Average employee performance rating',
      calculation: 'AVG(performance_score)',
      format: 'NUMBER',
      trend: 'HIGHER_BETTER',
    },
    {
      id: 'high_performers',
      name: 'High Performers',
      category: 'Performance',
      description: 'Employees with top ratings',
      calculation: 'COUNT(employees WHERE performance_score >= 4)',
      format: 'NUMBER',
      trend: 'HIGHER_BETTER',
    },
    {
      id: 'training_hours',
      name: 'Training Hours',
      category: 'Development',
      description: 'Total training hours delivered',
      calculation: 'SUM(training_hours)',
      format: 'DURATION',
      trend: 'HIGHER_BETTER',
    },

    // Engagement Metrics
    {
      id: 'enps',
      name: 'Employee NPS',
      category: 'Engagement',
      description: 'Employee Net Promoter Score',
      calculation: 'promoters - detractors',
      format: 'NUMBER',
      trend: 'HIGHER_BETTER',
    },
    {
      id: 'survey_participation',
      name: 'Survey Participation',
      category: 'Engagement',
      description: 'Survey response rate',
      calculation: 'responses / sent * 100',
      format: 'PERCENTAGE',
      trend: 'HIGHER_BETTER',
    },
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
    const { prisma } = await import('@aura/database');
    const headcount = await prisma.employee.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const leavePending = await prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING', isDeleted: false },
    });
    const leaveApproved = await prisma.leaveRequest.count({
      where: { tenantId, status: 'APPROVED', isDeleted: false },
    });
    const predictions = await prisma.prediction
      .count({
        where: {
          tenantId,
          entityType: { contains: 'attrition', mode: 'insensitive' },
          isDeleted: false,
        },
      })
      .catch(() => 0);

    const confidence = headcount > 0 ? 0.85 : 0.4;
    return {
      summary: headcount
        ? `Based on ${headcount} employees: ${leavePending} pending leave requests, ${leaveApproved} approved leaves${predictions ? `, ${predictions} attrition predictions on file` : ''}.`
        : 'No employee records found for this tenant.',
      details: `HR metrics from live tenant data:\n- Headcount: ${headcount}\n- Pending leave: ${leavePending}\n- Approved leave: ${leaveApproved}\n- Attrition predictions: ${predictions}`,
      impact: headcount > 100 ? 'HIGH' : 'MEDIUM',
      metrics: [
        { name: 'Headcount', value: headcount, trend: 'stable' },
        { name: 'Pending Leave', value: leavePending, trend: 'stable' },
        { name: 'Approved Leave', value: leaveApproved, trend: 'stable' },
      ],
      recommendations:
        leavePending > 10
          ? ['Review pending leave queue in Leave Approvals']
          : headcount === 0
            ? ['Import or create employee records to enable HR analytics']
            : ['Continue monitoring leave and headcount trends'],
      visualizations: [],
      confidence,
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
    const { prisma } = await import('@aura/database');
    const openJobs = await prisma.jobPosting.count({
      where: { isDeleted: false, status: { in: ['OPEN', 'Open', 'Published', 'ACTIVE'] } },
    });
    const applications = await prisma.candidateApplication.count({ where: { isDeleted: false } });
    const interviews = await prisma.interview.count({
      where: { isDeleted: false, scheduledDate: { gte: new Date() } },
    });

    return {
      summary: `Recruitment snapshot: ${openJobs} open positions, ${applications} applications, ${interviews} upcoming interviews.`,
      details: `Live recruitment counts from JobPosting / CandidateApplication / Interview tables.`,
      impact: 'MEDIUM',
      metrics: [
        { name: 'Open Positions', value: openJobs, trend: 'stable' },
        { name: 'Applications', value: applications, trend: 'stable' },
        { name: 'Upcoming Interviews', value: interviews, trend: 'stable' },
      ],
      recommendations:
        openJobs === 0
          ? ['Publish job postings to populate recruitment analytics']
          : ['Review pipeline bottlenecks in the Recruitment module'],
      visualizations: [],
      confidence: applications > 0 || openJobs > 0 ? 0.88 : 0.45,
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
    const { prisma } = await import('@aura/database');
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const latest = runs[0];
    const totalGross = latest ? Number(latest.totalGrossSalary) : 0;
    const totalNet = latest ? Number(latest.totalNetSalary) : 0;
    const totalEmployees = latest?.totalEmployees || 0;

    return {
      summary: latest
        ? `Latest payroll run (${latest.payrollMonth}): ${totalEmployees} employees, gross ${totalGross}, net ${totalNet} (${latest.currency || 'AED'}).`
        : 'No payroll runs found for this tenant.',
      details: latest
        ? `Status: ${latest.status}. Gross: ${totalGross}. Deductions: ${Number(latest.totalDeductions)}. Net: ${totalNet}.`
        : 'Process a payroll run to enable payroll analytics.',
      impact: 'MEDIUM',
      metrics: [
        { name: 'Employees Paid', value: totalEmployees, trend: 'stable' },
        { name: 'Gross Payroll', value: totalGross, trend: 'stable' },
        { name: 'Net Payroll', value: totalNet, trend: 'stable' },
      ],
      recommendations: latest
        ? ['Review overtime and deduction variance in Payroll module']
        : ['Complete a payroll run to unlock analytics'],
      visualizations: [],
      confidence: latest ? 0.9 : 0.4,
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
    const { prisma } = await import('@aura/database');
    // Prefer Prediction rows tagged for performance if present
    const predictions = await prisma.prediction
      .findMany({
        where: {
          tenantId,
          isDeleted: false,
          OR: [
            { entityType: { contains: 'performance', mode: 'insensitive' } },
            { entityType: { contains: 'PERF', mode: 'insensitive' } },
          ],
        },
        take: 100,
        select: { predictedValue: true, confidence: true },
      })
      .catch(() => []);

    const avgScore = predictions.length
      ? predictions.reduce((s, p) => s + p.predictedValue, 0) / predictions.length
      : 0;

    return {
      summary: predictions.length
        ? `Based on ${predictions.length} performance-related predictions; average predicted value ${avgScore.toFixed(2)}.`
        : 'No performance prediction records found. Connect Performance module data to enable insights.',
      details: `Performance analytics uses Prediction rows for this tenant. Count: ${predictions.length}.`,
      impact: predictions.length ? 'HIGH' : 'LOW',
      metrics: [
        { name: 'Prediction Count', value: predictions.length, trend: 'stable' },
        { name: 'Avg Predicted Score', value: Math.round(avgScore * 100) / 100, trend: 'stable' },
      ],
      recommendations: predictions.length
        ? ['Review high/low performers in Performance module']
        : ['Run performance forecasting to populate Prediction records'],
      visualizations: [],
      confidence: predictions.length ? 0.8 : 0.35,
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
    const { prisma } = await import('@aura/database');
    const headcount = await prisma.employee.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const departments = await prisma.department.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const byDept = await prisma.employee
      .groupBy({
        by: ['departmentId'],
        where: { isDeleted: false, company: { tenantId } },
        _count: { id: true },
      })
      .catch(() => []);

    const labels: string[] = [];
    const values: number[] = [];
    for (const row of byDept.slice(0, 8)) {
      const dept = await prisma.department
        .findFirst({
          where: { id: row.departmentId },
          select: { name: true },
        })
        .catch(() => null);
      labels.push(dept?.name || row.departmentId);
      values.push(row._count.id);
    }

    return {
      summary: `Workforce: ${headcount} employees across ${departments} departments (live tenant counts).`,
      details: `Headcount and department distribution sourced from Employee and Department tables.`,
      impact: 'MEDIUM',
      metrics: [
        { name: 'Total Employees', value: headcount, trend: 'stable' },
        { name: 'Departments', value: departments, trend: 'stable' },
      ],
      recommendations:
        headcount === 0
          ? ['Add employees to enable workforce analytics']
          : ['Review department headcount balance in Org Structure'],
      visualizations: labels.length
        ? [
            {
              type: 'BAR',
              title: 'Headcount by Department',
              data: { labels, datasets: [{ values }] },
            },
          ]
        : [],
      confidence: headcount > 0 ? 0.92 : 0.4,
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
    const metric = this.metrics.find((m) => m.id === metricId) || {
      id: metricId,
      name: metricId,
      category: 'workforce',
      description: metricId,
      calculation: 'count',
      format: 'NUMBER' as const,
      trend: 'NEUTRAL' as const,
    };

    const dataPoints = await this.loadTrendData(tenantId, period, granularity);

    if (dataPoints.length < 2) {
      return {
        metric,
        data: dataPoints,
        trend: { direction: 'STABLE', changePercent: 0, significance: 'LOW' },
        forecast: [],
        insights: [
          'Insufficient historical data to compute a trend. More attendance or workforce records are needed.',
        ],
      };
    }

    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const changePercent = firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100;

    const direction = changePercent > 2 ? 'UP' : changePercent < -2 ? 'DOWN' : 'STABLE';
    const significance =
      Math.abs(changePercent) > 10 ? 'HIGH' : Math.abs(changePercent) > 5 ? 'MEDIUM' : 'LOW';

    const forecast = this.projectLinearForecast(dataPoints, 3);
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
   * Load trend data from attendance present counts by period
   */
  private static async loadTrendData(
    tenantId: string,
    period: { start: Date; end: Date },
    granularity: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER'
  ): Promise<{ date: Date; value: number }[]> {
    const { prisma } = await import('@aura/database');
    const records = await prisma.attendanceRecord
      .findMany({
        where: {
          tenantId,
          isDeleted: false,
          date: { gte: period.start, lte: period.end },
          status: { in: ['PRESENT', 'Present', 'WFH', 'HALF_DAY'] },
        },
        select: { date: true },
      })
      .catch(() => []);

    if (!records.length) {
      // Fall back to monthly headcount snapshots via employee createdAt if no attendance
      const employees = await prisma.employee
        .findMany({
          where: { isDeleted: false, company: { tenantId }, createdAt: { lte: period.end } },
          select: { createdAt: true },
        })
        .catch(() => []);
      if (!employees.length) return [];

      const buckets = new Map<string, number>();
      const cursor = new Date(period.start);
      while (cursor <= period.end) {
        const key = cursor.toISOString().slice(0, 7);
        const count = employees.filter((e) => e.createdAt <= cursor).length;
        buckets.set(key, count);
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return [...buckets.entries()].map(([k, value]) => ({
        date: new Date(`${k}-01`),
        value,
      }));
    }

    const buckets = new Map<string, number>();
    for (const r of records) {
      const d = new Date(r.date);
      let key: string;
      if (granularity === 'DAY') key = d.toISOString().slice(0, 10);
      else if (granularity === 'WEEK') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else if (granularity === 'QUARTER') {
        const q = Math.floor(d.getMonth() / 3) + 1;
        key = `${d.getFullYear()}-Q${q}`;
      } else {
        key = d.toISOString().slice(0, 7);
      }
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        date: key.includes('Q')
          ? new Date(
              `${key.slice(0, 4)}-${String((Number(key.slice(-1)) - 1) * 3 + 1).padStart(2, '0')}-01`
            )
          : new Date(key.length === 7 ? `${key}-01` : key),
        value,
      }));
  }

  /**
   * Linear projection from last known points (no invented base values)
   */
  private static projectLinearForecast(
    historicalData: { date: Date; value: number }[],
    periods: number
  ): { date: Date; value: number; confidence: number }[] {
    if (historicalData.length < 2) return [];
    const forecast: { date: Date; value: number; confidence: number }[] = [];
    const lastDate = historicalData[historicalData.length - 1].date;
    const lastValue = historicalData[historicalData.length - 1].value;
    const trend = (lastValue - historicalData[0].value) / historicalData.length;

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      forecast.push({
        date: forecastDate,
        value: Math.round((lastValue + trend * i) * 10) / 10,
        confidence: Math.max(0.4, 0.85 - i * 0.1),
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

    const isPositive =
      (metric.trend === 'HIGHER_BETTER' && direction === 'UP') ||
      (metric.trend === 'LOWER_BETTER' && direction === 'DOWN');

    if (direction === 'STABLE') {
      insights.push(`${metric.name} has remained stable with minimal variation.`);
    } else {
      insights.push(
        `${metric.name} has ${direction === 'UP' ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%.`
      );

      if (isPositive) {
        insights.push("This trend is favorable based on the metric's target direction.");
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
    const { prisma } = await import('@aura/database');
    const anomalies: {
      id: string;
      metric: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      description: string;
      expectedValue: number;
      actualValue: number;
      deviation: number;
      timestamp: Date;
      recommendations: string[];
    }[] = [];

    // Attendance late-rate anomaly (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendance = await prisma.attendanceRecord
      .findMany({
        where: { tenantId, isDeleted: false, date: { gte: since } },
        select: { isLate: true, overtimeHours: true },
      })
      .catch(() => []);

    if (attendance.length >= 20) {
      const lateRate = attendance.filter((a) => a.isLate).length / attendance.length;
      if (lateRate > 0.25) {
        anomalies.push({
          id: crypto.randomUUID(),
          metric: 'Late Attendance Rate',
          severity: lateRate > 0.4 ? 'HIGH' : 'MEDIUM',
          description: `${(lateRate * 100).toFixed(1)}% of attendance records in the last 30 days are marked late (${attendance.length} records).`,
          expectedValue: 15,
          actualValue: Math.round(lateRate * 100),
          deviation: Math.round(((lateRate * 100 - 15) / 15) * 1000) / 10,
          timestamp: new Date(),
          recommendations: [
            'Review shift start times and grace periods',
            'Investigate departments with elevated late rates',
          ],
        });
      }

      const avgOt = attendance.reduce((s, a) => s + (a.overtimeHours || 0), 0) / attendance.length;
      if (avgOt > 2) {
        anomalies.push({
          id: crypto.randomUUID(),
          metric: 'Average Overtime Hours',
          severity: avgOt > 4 ? 'HIGH' : 'MEDIUM',
          description: `Average overtime ${avgOt.toFixed(1)} hours per attendance record over the last 30 days.`,
          expectedValue: 1,
          actualValue: Math.round(avgOt * 10) / 10,
          deviation: Math.round(((avgOt - 1) / 1) * 1000) / 10,
          timestamp: new Date(),
          recommendations: ['Review workload distribution', 'Check overtime policy compliance'],
        });
      }
    }

    // Pending leave backlog
    const pendingLeave = await prisma.leaveRequest
      .count({
        where: { tenantId, status: 'PENDING', isDeleted: false },
      })
      .catch(() => 0);
    if (pendingLeave > 25) {
      anomalies.push({
        id: crypto.randomUUID(),
        metric: 'Pending Leave Requests',
        severity: pendingLeave > 50 ? 'HIGH' : 'MEDIUM',
        description: `${pendingLeave} leave requests are pending approval.`,
        expectedValue: 10,
        actualValue: pendingLeave,
        deviation: Math.round(((pendingLeave - 10) / 10) * 1000) / 10,
        timestamp: new Date(),
        recommendations: ['Clear leave approval backlog', 'Remind managers of pending items'],
      });
    }

    return {
      anomalies,
      summary: anomalies.length
        ? `Detected ${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'} from live ${domain} data.`
        : 'No anomalies detected from available tenant data.',
    };
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  /**
   * Generate report
   */
  static async generateReport(
    reportType:
      | 'HR_DASHBOARD'
      | 'RECRUITMENT_SUMMARY'
      | 'PAYROLL_ANALYSIS'
      | 'WORKFORCE_REVIEW'
      | 'CUSTOM',
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
        sections: [
          'Executive Summary',
          'Headcount Analysis',
          'Attrition Trends',
          'Engagement Metrics',
        ],
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
    const insight = await this.analyzeData(
      reportType === 'RECRUITMENT_SUMMARY'
        ? 'RECRUITMENT'
        : reportType === 'PAYROLL_ANALYSIS'
          ? 'PAYROLL'
          : reportType === 'WORKFORCE_REVIEW'
            ? 'WORKFORCE'
            : 'HR',
      tenantId
    );

    const reportId = crypto.randomUUID();
    return {
      id: reportId,
      name: config.name,
      type: reportType,
      generatedAt: new Date(),
      sections: config.sections.map((title, index) => ({
        title,
        content: index === 0 ? insight.summary : insight.details,
        metrics: insight.metrics.map((m) => ({
          name: m.name,
          value: m.value,
          change: m.change != null ? String(m.change) : undefined,
        })),
      })),
      downloadUrl: `/dashboard/analytics?report=${reportId}`,
    };
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
        {
          id: '1',
          type: 'quick_reply',
          label: 'Generate report',
          value: 'Generate HR dashboard report',
        },
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
    const { prisma } = await import('@aura/database');
    const headcount = await prisma.employee.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const openJobs = await prisma.jobPosting.count({
      where: { isDeleted: false, status: { in: ['OPEN', 'Open', 'Published', 'ACTIVE'] } },
    });
    const pendingLeave = await prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING', isDeleted: false },
    });

    const valueMap: Record<string, number> = {
      headcount,
      open_positions: openJobs,
      pending_leave: pendingLeave,
    };

    return metricIds.map((id) => {
      const metric = this.metrics.find((m) => m.id === id) || this.metrics[0];
      const value = valueMap[id] ?? headcount;
      return { metric, value, previousValue: value };
    });
  }

  /**
   * Generate forecast report from live headcount
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
    const { prisma } = await import('@aura/database');
    const headcount = await prisma.employee.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const openJobs = await prisma.jobPosting.count({
      where: { isDeleted: false, status: { in: ['OPEN', 'Open', 'Published', 'ACTIVE'] } },
    });

    const forecasts =
      headcount > 0
        ? [1, 2, 3, 4].map((q) => ({
            period: `Q${q}`,
            value: headcount + Math.round(openJobs * 0.25 * q),
            confidence: Math.max(0.5, 0.9 - q * 0.1),
          }))
        : [];

    return {
      metric: metricId || 'Headcount',
      currentValue: headcount,
      forecasts,
      factors: [
        `Current headcount: ${headcount}`,
        `Open positions: ${openJobs}`,
        'Projection assumes fraction of open roles fill over successive quarters',
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
      const emoji =
        (metric.trend === 'HIGHER_BETTER' && change > 0) ||
        (metric.trend === 'LOWER_BETTER' && change < 0)
          ? '✅'
          : metric.trend === 'NEUTRAL'
            ? '➡️'
            : '⚠️';

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

    const arrow =
      trend.trend.direction === 'UP' ? '↗️' : trend.trend.direction === 'DOWN' ? '↘️' : '➡️';

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
    const { prisma } = await import('@aura/database');
    const headcount = await prisma.employee.count({
      where: { isDeleted: false, company: { tenantId } },
    });
    const openJobs = await prisma.jobPosting.count({
      where: { isDeleted: false, status: { in: ['OPEN', 'Open', 'Published', 'ACTIVE'] } },
    });
    const applications = await prisma.candidateApplication.count({ where: { isDeleted: false } });
    const pendingLeave = await prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING', isDeleted: false },
    });

    let result = '**Period Snapshot (live tenant data)**\n\n';
    result += '| Metric | Current |\n';
    result += '|--------|--------|\n';
    result += `| Headcount | ${headcount} |\n`;
    result += `| Open Positions | ${openJobs} |\n`;
    result += `| Applications | ${applications} |\n`;
    result += `| Pending Leave | ${pendingLeave} |\n`;
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
      const icon = anomaly.severity === 'HIGH' ? '🔴' : anomaly.severity === 'MEDIUM' ? '🟡' : '🟢';

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
