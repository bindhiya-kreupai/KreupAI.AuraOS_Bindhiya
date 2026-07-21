/**
 * Leave Forecasting — moving-average inference + Prediction persist
 */

import { prisma } from '@aura/database';
import {
  LEAVE_FORECAST_ALGORITHM,
  LEAVE_FORECAST_MODEL_CODE,
  LEAVE_FORECAST_MODEL_TYPE,
  LEAVE_FORECAST_MODEL_VERSION,
  buildRecommendations,
  capacityFromForecast,
  peakStatus,
} from './leave-forecasting-rules';
import { retrieveLeaveHistory } from './leave-forecasting-retrieval';
import { emptyLeaveForecastDashboard } from './leave-forecasting-fallback';
import type {
  LeaveForecastDashboard,
  LeaveForecastPoint,
  LeavePeakPeriod,
  LeaveSeasonalSlice,
} from './leave-forecasting-types';

async function ensureModel(tenantId: string, userId: string) {
  const existing = await prisma.predictiveModel.findFirst({
    where: {
      tenantId,
      code: LEAVE_FORECAST_MODEL_CODE,
      isDeleted: false,
    },
  });
  if (existing) {
    if (!existing.isActive) {
      return prisma.predictiveModel.update({
        where: { id: existing.id },
        data: { isActive: true, updatedBy: userId },
      });
    }
    return existing;
  }
  return prisma.predictiveModel.create({
    data: {
      tenantId,
      code: LEAVE_FORECAST_MODEL_CODE,
      name: 'Leave Forecast Moving Average v1',
      description: 'Monthly moving-average leave volume forecast',
      modelType: LEAVE_FORECAST_MODEL_TYPE,
      algorithm: LEAVE_FORECAST_ALGORITHM,
      trainingDataset: { source: 'leave_request_history' },
      features: { families: ['leave_volume', 'seasonality'] },
      targetVariable: 'leave_request_count',
      parameters: { windowMonths: 3 },
      version: LEAVE_FORECAST_MODEL_VERSION,
      status: 'ACTIVE',
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
    },
  });
}

function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export async function getLeaveForecastDashboard(
  tenantId: string,
  opts?: { userId?: string; persist?: boolean }
): Promise<LeaveForecastDashboard> {
  const userId = opts?.userId || 'system';
  const { series, byLeaveType, total } = await retrieveLeaveHistory(tenantId);

  if (!series.length) {
    return emptyLeaveForecastDashboard();
  }

  const recent = series.slice(-3);
  const forecastNext = Math.round(
    recent.reduce((s, m) => s + m.count, 0) / Math.max(recent.length, 1)
  );
  const maxCount = Math.max(...series.map((s) => s.count), forecastNext, 1);

  const lastMonth = series[series.length - 1].month;
  const forecast: LeaveForecastPoint[] = [];

  for (const bucket of series.slice(-6)) {
    forecast.push({
      date: monthLabel(bucket.month),
      month: bucket.month,
      actual: bucket.count,
      predicted: bucket.count,
      capacity: capacityFromForecast(bucket.count, maxCount),
    });
  }

  for (let i = 1; i <= 3; i++) {
    const ym = addMonths(lastMonth, i);
    const seasonalBoost = i === 1 ? 1 : i === 2 ? 1.05 : 1.1;
    const predicted = Math.round(forecastNext * seasonalBoost);
    forecast.push({
      date: monthLabel(ym),
      month: ym,
      actual: null,
      predicted,
      capacity: capacityFromForecast(predicted, maxCount),
    });
  }

  const peakPeriods: LeavePeakPeriod[] = forecast
    .filter((f) => f.actual === null || (f.actual != null && f.actual >= maxCount * 0.75))
    .map((f) => {
      const count = f.actual ?? f.predicted;
      const status = peakStatus(count, maxCount);
      const shortage = Math.max(0, Math.round(count - maxCount * 0.5));
      return {
        date: f.month || f.date,
        reason:
          status === 'Critical'
            ? 'Projected leave volume near historical peak'
            : 'Elevated leave volume vs baseline',
        shortage: shortage > 0 ? `-${shortage} Staff` : 'Monitor',
        status,
        count,
      };
    })
    .filter((p) => p.status !== 'Info')
    .slice(0, 8);

  const recommendations = buildRecommendations(peakPeriods);

  const seasonal: LeaveSeasonalSlice[] = byLeaveType.slice(0, 6).map((t) => ({
    subject: t.leaveType.replace(/_/g, ' ').slice(0, 16),
    A: t.count,
    B: Math.round(t.count * 1.1),
    fullMark: Math.max(t.count * 1.5, 10),
  }));

  const dashboard: LeaveForecastDashboard = {
    forecast,
    peakPeriods,
    recommendations,
    seasonal,
    summary: {
      historyMonths: series.length,
      forecastNextMonth: forecastNext,
      totalRequestsLastYear: total,
      modelVersion: LEAVE_FORECAST_MODEL_VERSION,
      lastRunAt: new Date().toISOString(),
    },
  };

  if (opts?.persist !== false) {
    try {
      const model = await ensureModel(tenantId, userId);
      const started = Date.now();
      await prisma.prediction.create({
        data: {
          modelId: model.id,
          tenantId,
          entityType: 'Tenant',
          entityId: tenantId,
          predictedValue: forecastNext,
          confidence: series.length >= 3 ? 0.75 : 0.45,
          predictedDate: new Date(),
          inputFeatures: { series, forecastNext, dashboard },
          createdBy: userId,
        },
      });
      await prisma.aIRunRecord.create({
        data: {
          tenantId,
          runType: 'leave_forecast',
          output: {
            forecastNextMonth: forecastNext,
            historyMonths: series.length,
          } as object,
          completedAt: new Date(),
          durationMs: Date.now() - started,
          createdBy: userId,
        },
      });
    } catch (err) {
      console.warn('[leave-forecast] persist skipped', err);
    }
  }

  return dashboard;
}
