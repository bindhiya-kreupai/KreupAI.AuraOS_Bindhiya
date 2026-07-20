import type { LeaveForecastDashboard } from './leave-forecasting-types';
import { LEAVE_FORECAST_MODEL_VERSION } from './leave-forecasting-rules';

export function emptyLeaveForecastDashboard(): LeaveForecastDashboard {
  return {
    forecast: [],
    peakPeriods: [],
    recommendations: [
      'Insufficient leave history — submit leave requests to improve forecast accuracy.',
    ],
    seasonal: [],
    summary: {
      historyMonths: 0,
      forecastNextMonth: 0,
      totalRequestsLastYear: 0,
      modelVersion: LEAVE_FORECAST_MODEL_VERSION,
      lastRunAt: null,
    },
    needsRecompute: true,
  };
}
