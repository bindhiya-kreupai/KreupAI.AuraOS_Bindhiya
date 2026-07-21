export type LeaveForecastPoint = {
  date: string;
  actual: number | null;
  predicted: number;
  capacity: number;
  month?: string;
};

export type LeavePeakPeriod = {
  date: string;
  reason: string;
  shortage: string;
  status: 'Critical' | 'Warning' | 'Info';
  count?: number;
};

export type LeaveSeasonalSlice = {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
};

export type LeaveForecastDashboard = {
  forecast: LeaveForecastPoint[];
  peakPeriods: LeavePeakPeriod[];
  recommendations: string[];
  seasonal?: LeaveSeasonalSlice[];
  summary: {
    historyMonths: number;
    forecastNextMonth: number;
    totalRequestsLastYear: number;
    modelVersion: string;
    lastRunAt: string | null;
  };
  needsRecompute?: boolean;
};
