/**
 * Cloud FinOps — Cost Tracker
 *
 * Provides resource cost visibility, per-tenant attribution, budget status,
 * anomaly detection, cost forecasting, optimisation recommendations, and
 * carbon footprint estimation.
 *
 * In production this module would integrate with AWS Cost Explorer,
 * Azure Cost Management, or GCP Billing APIs. This implementation uses
 * deterministic in-memory data to provide a working skeleton.
 *
 * @module @aura/cloud
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CostPeriod {
  from: string;   // ISO date YYYY-MM-DD
  to: string;
}

export type AWSService =
  | 'EC2' | 'ECS' | 'RDS' | 'ElastiCache' | 'S3'
  | 'CloudFront' | 'ALB' | 'WAF' | 'Route53'
  | 'CloudWatch' | 'Secrets Manager' | 'KMS' | 'VPC' | 'Other';

export interface ServiceCostEntry {
  service: AWSService;
  usageType: string;
  amount: number;
  unit: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

export interface ResourceCostSummary {
  period: CostPeriod;
  totalCost: number;
  currency: string;
  breakdown: ServiceCostEntry[];
  comparedToPrevious?: {
    delta: number;
    percentageChange: number;
  };
}

export interface TenantCostSummary {
  tenantId: string;
  period: CostPeriod;
  totalCost: number;
  currency: string;
  breakdown: Record<string, number>;  // service → cost
  taggingCoverage: number;            // % of resources with tenant tag
}

export interface BudgetStatus {
  departmentId: string;
  budgetName: string;
  period: string;
  budgetAmount: number;
  actualSpend: number;
  forecastedSpend: number;
  currency: string;
  percentUsed: number;
  status: 'under_budget' | 'at_risk' | 'over_budget';
  alerts: string[];
}

export interface CostAnomaly {
  id: string;
  service: AWSService;
  detectedAt: string;
  period: CostPeriod;
  expectedCost: number;
  actualCost: number;
  deltaPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possibleCause: string;
}

export interface CostForecast {
  months: number;
  monthlyForecasts: Array<{
    month: string;          // YYYY-MM
    projectedCost: number;
    lowerBound: number;
    upperBound: number;
    currency: string;
  }>;
  totalProjectedCost: number;
  confidenceLevel: number;  // 0-1
  currency: string;
}

export type OptimizationType =
  | 'right_sizing'
  | 'reserved_instances'
  | 'savings_plans'
  | 'idle_resources'
  | 'storage_tiering'
  | 'data_transfer';

export interface OptimizationRecommendation {
  id: string;
  type: OptimizationType;
  service: AWSService;
  resource: string;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  description: string;
  action: string;
  currency: string;
}

export interface CarbonFootprint {
  period: CostPeriod;
  totalCO2eKg: number;
  breakdown: Array<{
    service: AWSService;
    co2eKg: number;
    percentOfTotal: number;
  }>;
  region: string;
  gridEmissionFactor: number; // kgCO2e/kWh
  renewableEnergyPercent: number;
  trend: 'improving' | 'stable' | 'worsening';
}

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------

function generateMockCosts(period: CostPeriod): ServiceCostEntry[] {
  const days = Math.ceil(
    (new Date(period.to).getTime() - new Date(period.from).getTime()) / 86_400_000
  ) || 30;

  const dailyFactor = days / 30;

  return [
    { service: 'ECS',           usageType: 'Fargate-vCPU-Hours',     amount: 1_240.50 * dailyFactor, unit: 'vCPU-hours', currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'RDS',           usageType: 'Multi-AZ-db.r6g.large',  amount: 890.20  * dailyFactor, unit: 'hours',      currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'ElastiCache',   usageType: 'cache.r6g.large-hours',  amount: 420.80  * dailyFactor, unit: 'hours',      currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'S3',            usageType: 'StandardStorage',        amount: 145.60  * dailyFactor, unit: 'GB-month',   currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'CloudFront',    usageType: 'DataTransfer-Out',       amount: 230.40  * dailyFactor, unit: 'GB',         currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'ALB',           usageType: 'LoadBalancerCapacityUnits', amount: 95.20 * dailyFactor, unit: 'LCU-hours', currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'WAF',           usageType: 'WebACL-Rules',           amount: 25.00   * dailyFactor, unit: 'rules',      currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'CloudWatch',    usageType: 'Logs-Ingestion',         amount: 55.30   * dailyFactor, unit: 'GB',         currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'KMS',           usageType: 'KMS-Key-Requests',       amount: 12.80   * dailyFactor, unit: 'requests',   currency: 'USD', periodStart: period.from, periodEnd: period.to },
    { service: 'Other',         usageType: 'Misc',                   amount: 80.00   * dailyFactor, unit: 'USD',        currency: 'USD', periodStart: period.from, periodEnd: period.to },
  ];
}

// ---------------------------------------------------------------------------
// Cost Tracker
// ---------------------------------------------------------------------------

export class CostTracker {

  /**
   * Get total resource costs broken down by service for a given period.
   */
  getResourceCosts(period: CostPeriod): ResourceCostSummary {
    const breakdown = generateMockCosts(period);
    const totalCost = breakdown.reduce((s, e) => s + e.amount, 0);

    // Mock previous period comparison
    const prevTotal = totalCost * 0.92;

    return {
      period,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: 'USD',
      breakdown,
      comparedToPrevious: {
        delta: Math.round((totalCost - prevTotal) * 100) / 100,
        percentageChange: Math.round(((totalCost - prevTotal) / prevTotal) * 1000) / 10,
      },
    };
  }

  /**
   * Get per-tenant cost attribution for a period.
   *
   * Uses resource tagging (TenantId tag) to attribute costs.
   */
  getPerTenantCosts(tenantId: string, period: CostPeriod): TenantCostSummary {
    const allCosts = generateMockCosts(period);
    // Simulate ~40% of total attributed to this tenant (multi-tenant shared infra)
    const tenantShare = 0.40;

    const breakdown: Record<string, number> = {};
    let totalCost = 0;

    for (const entry of allCosts) {
      const tenantCost = entry.amount * tenantShare;
      breakdown[entry.service] = Math.round(tenantCost * 100) / 100;
      totalCost += tenantCost;
    }

    return {
      tenantId,
      period,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: 'USD',
      breakdown,
      taggingCoverage: 0.87, // 87% of resources have TenantId tag
    };
  }

  /**
   * Get budget status for a department.
   */
  getBudgetStatus(departmentId: string): BudgetStatus {
    // Mock budget data; in production: fetch from AWS Budgets or internal DB
    const budgets: Record<string, Omit<BudgetStatus, 'departmentId' | 'alerts'>> = {
      'engineering': {
        budgetName: 'Engineering Cloud Budget Q1-2025',
        period: '2025-Q1',
        budgetAmount: 15_000,
        actualSpend: 12_450,
        forecastedSpend: 14_800,
        currency: 'USD',
        percentUsed: 83,
        status: 'at_risk',
      },
      'default': {
        budgetName: 'Default Cloud Budget',
        period: '2025-Q1',
        budgetAmount: 10_000,
        actualSpend: 7_200,
        forecastedSpend: 9_100,
        currency: 'USD',
        percentUsed: 72,
        status: 'under_budget',
      },
    };

    const budget = budgets[departmentId] ?? budgets['default'];
    const alerts: string[] = [];

    if (budget.percentUsed >= 80) {
      alerts.push(`Budget utilisation at ${budget.percentUsed}% — consider reviewing spend`);
    }
    if (budget.forecastedSpend > budget.budgetAmount) {
      alerts.push(`Forecasted spend (${budget.forecastedSpend}) exceeds budget (${budget.budgetAmount})`);
    }

    return { ...budget, departmentId, alerts };
  }

  /**
   * Detect cost anomalies (unexpected spikes) in the given period.
   */
  getCostAnomalies(period: CostPeriod): CostAnomaly[] {
    // Mock: return one realistic anomaly for demonstration
    return [
      {
        id: 'anomaly-001',
        service: 'S3',
        detectedAt: new Date().toISOString(),
        period,
        expectedCost: 145,
        actualCost: 580,
        deltaPercent: 300,
        severity: 'high',
        possibleCause: 'Unexpected S3 data egress — possible misconfigured batch export or data leak',
      },
      {
        id: 'anomaly-002',
        service: 'EC2',
        detectedAt: new Date().toISOString(),
        period,
        expectedCost: 200,
        actualCost: 310,
        deltaPercent: 55,
        severity: 'medium',
        possibleCause: 'EC2 instance type mismatch after ASG scale-out event',
      },
    ];
  }

  /**
   * Forecast costs for the next N months based on trend analysis.
   */
  getForecast(months: number): CostForecast {
    const baseMonthlyCost = 3_196;
    const growthRate = 0.05; // 5% month-over-month growth

    const monthlyForecasts = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      const month = date.toISOString().slice(0, 7);
      const projected = baseMonthlyCost * Math.pow(1 + growthRate, i + 1);
      const variance = projected * 0.10;

      return {
        month,
        projectedCost: Math.round(projected * 100) / 100,
        lowerBound: Math.round((projected - variance) * 100) / 100,
        upperBound: Math.round((projected + variance) * 100) / 100,
        currency: 'USD',
      };
    });

    const totalProjectedCost = monthlyForecasts.reduce((s, m) => s + m.projectedCost, 0);

    return {
      months,
      monthlyForecasts,
      totalProjectedCost: Math.round(totalProjectedCost * 100) / 100,
      confidenceLevel: 0.80,
      currency: 'USD',
    };
  }

  /**
   * Get right-sizing, reserved instances, and idle resource recommendations.
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    return [
      {
        id: 'opt-001',
        type: 'right_sizing',
        service: 'RDS',
        resource: 'auraos-prod-rds (db.r6g.large)',
        currentMonthlyCost: 890,
        projectedMonthlyCost: 540,
        monthlySavings: 350,
        annualSavings: 4_200,
        effort: 'medium',
        risk: 'low',
        description: 'RDS instance is consistently below 30% CPU utilisation. Downsize to db.r6g.medium.',
        action: 'Modify DB instance class to db.r6g.medium during next maintenance window',
        currency: 'USD',
      },
      {
        id: 'opt-002',
        type: 'reserved_instances',
        service: 'ECS',
        resource: 'Fargate Compute (auraos-production cluster)',
        currentMonthlyCost: 1_240,
        projectedMonthlyCost: 868,
        monthlySavings: 372,
        annualSavings: 4_464,
        effort: 'low',
        risk: 'low',
        description: 'Switch from On-Demand Fargate to Savings Plans (1-year compute) for 30% saving.',
        action: 'Purchase 1-year Compute Savings Plan covering ECS Fargate workloads',
        currency: 'USD',
      },
      {
        id: 'opt-003',
        type: 'idle_resources',
        service: 'ElastiCache',
        resource: 'auraos-staging-redis (cache.r6g.large)',
        currentMonthlyCost: 210,
        projectedMonthlyCost: 0,
        monthlySavings: 210,
        annualSavings: 2_520,
        effort: 'low',
        risk: 'low',
        description: 'Staging ElastiCache cluster has zero connections for the past 14 days.',
        action: 'Schedule cluster to run only during business hours or delete unused staging cluster',
        currency: 'USD',
      },
      {
        id: 'opt-004',
        type: 'storage_tiering',
        service: 'S3',
        resource: 'auraos-documents-bucket',
        currentMonthlyCost: 145,
        projectedMonthlyCost: 58,
        monthlySavings: 87,
        annualSavings: 1_044,
        effort: 'low',
        risk: 'low',
        description: '68% of objects in Standard tier are not accessed for > 90 days.',
        action: 'Enable S3 Intelligent-Tiering or add lifecycle policy to transition to S3-IA after 90 days',
        currency: 'USD',
      },
    ];
  }

  /**
   * Estimate carbon footprint for the given period.
   *
   * Uses AWS published emission factors for us-east-1 region.
   */
  getCarbonFootprint(period: CostPeriod): CarbonFootprint {
    const breakdown = generateMockCosts(period);

    // Simplified kgCO2e = cost * emission_factor_per_usd
    const emissionFactors: Partial<Record<AWSService, number>> = {
      ECS:         0.12,
      RDS:         0.15,
      ElastiCache: 0.10,
      S3:          0.03,
      CloudFront:  0.02,
      ALB:         0.08,
      EC2:         0.12,
    };

    const footprintBreakdown = breakdown.map((entry) => {
      const factor = emissionFactors[entry.service] ?? 0.08;
      const co2eKg = entry.amount * factor;
      return { service: entry.service, co2eKg, percentOfTotal: 0 };
    });

    const totalCO2eKg = footprintBreakdown.reduce((s, e) => s + e.co2eKg, 0);

    // Calculate percentages
    for (const entry of footprintBreakdown) {
      entry.percentOfTotal = totalCO2eKg > 0
        ? Math.round((entry.co2eKg / totalCO2eKg) * 1000) / 10
        : 0;
    }

    return {
      period,
      totalCO2eKg: Math.round(totalCO2eKg * 100) / 100,
      breakdown: footprintBreakdown,
      region: 'us-east-1',
      gridEmissionFactor: 0.4155, // kgCO2e/kWh (AWS us-east-1 2023)
      renewableEnergyPercent: 100, // AWS 100% renewable target
      trend: 'stable',
    };
  }
}
