/**
 * Attrition Prediction — degraded scoring / last-good snapshot helpers
 */

import type {
  AttritionDashboardData,
  AttritionDistributionSlice,
  AttritionDriver,
  AttritionSummary,
} from './attrition-types';
import { ATTRITION_MODEL_VERSION } from './attrition-rules';

export function emptyDashboard(horizonDays: 90 | 180 | 365 = 180): AttritionDashboardData {
  const summary: AttritionSummary = {
    totalEmployees: 0,
    atRiskCount: 0,
    atRiskPercentage: 0,
    replacementCostEstimate: 0,
    modelAccuracy: null,
    modelVersion: ATTRITION_MODEL_VERSION,
    lastRunAt: null,
    byRiskLevel: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    horizonDays,
  };
  const distribution: AttritionDistributionSlice[] = [
    { name: 'High Risk', value: 0, color: '#ef4444' },
    { name: 'Medium Risk', value: 0, color: '#f59e0b' },
    { name: 'Low Risk', value: 0, color: '#10b981' },
  ];
  const drivers: AttritionDriver[] = [];
  return { summary, distribution, drivers, needsRecompute: true };
}

/** When domain aggregates fail mid-batch, keep prior prediction payload if present */
export function isUsableStoredPayload(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return typeof o.riskScore === 'number' && typeof o.employeeId === 'string';
}
