export const LEAVE_FORECAST_MODEL_CODE = 'LEAVE_FORECAST_V1';
export const LEAVE_FORECAST_MODEL_TYPE = 'LEAVE_FORECAST';
export const LEAVE_FORECAST_ALGORITHM = 'MOVING_AVERAGE';
export const LEAVE_FORECAST_MODEL_VERSION = '1.0.0';

/** Peak if forecast count >= this share of recent max */
export const PEAK_RATIO = 0.75;
export const CRITICAL_RATIO = 0.9;

export function capacityFromForecast(predicted: number, baselineMax: number): number {
  if (baselineMax <= 0) return 100;
  const load = Math.min(1, predicted / Math.max(baselineMax, 1));
  return Math.max(5, Math.round(100 - load * 80));
}

export function peakStatus(count: number, max: number): 'Critical' | 'Warning' | 'Info' {
  if (max <= 0) return 'Info';
  const ratio = count / max;
  if (ratio >= CRITICAL_RATIO) return 'Critical';
  if (ratio >= PEAK_RATIO) return 'Warning';
  return 'Info';
}

export function buildRecommendations(peaks: { status: string; date: string }[]): string[] {
  const recs: string[] = [];
  const critical = peaks.filter((p) => p.status === 'Critical');
  if (critical.length) {
    recs.push(
      `Schedule backup coverage for ${critical.length} critical peak day(s) (e.g. ${critical[0].date}).`
    );
  }
  if (peaks.some((p) => p.status === 'Warning')) {
    recs.push('Defer non-critical projects overlapping warning peak periods.');
  }
  recs.push('Encourage leave distribution outside peak months where policy allows.');
  recs.push('Set concurrent leave caps per team for high-demand windows.');
  return recs;
}
