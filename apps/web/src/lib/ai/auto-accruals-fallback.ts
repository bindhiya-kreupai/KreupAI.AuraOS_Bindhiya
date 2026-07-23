import type { AccrualDashboard } from './auto-accruals-types';
import { ACCRUAL_RULES } from './auto-accruals-rules';

export function emptyAccrualDashboard(): AccrualDashboard {
  return {
    rules: ACCRUAL_RULES,
    projections: [],
    summary: { recentAccruals: 0, totalDays: 0, nextCycle: new Date().toISOString() },
  };
}
