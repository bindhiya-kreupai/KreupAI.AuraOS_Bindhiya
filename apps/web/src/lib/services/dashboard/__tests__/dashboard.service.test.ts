/**
 * DashboardService — unit tests against the actual API.
 * Service is at `src/lib/services/reporting/dashboard.service.ts` and
 * is pure: hardcoded analytics fixtures, no prisma calls.
 */

import { describe, it, expect } from 'vitest';
import { DashboardService } from '../../reporting/dashboard.service';

const TENANT_A = 'tenant-A';
const PERIOD: any = {
  id: 'monthly',
  name: 'Monthly',
  type: 'MONTHLY',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-30'),
};

describe('DashboardService.getHRMetrics', () => {
  it('returns an array of metric objects', async () => {
    const metrics = await DashboardService.getHRMetrics(TENANT_A, PERIOD);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics[0]).toHaveProperty('id');
    expect(metrics[0]).toHaveProperty('value');
    expect(metrics[0]).toHaveProperty('formattedValue');
  });

  it('includes the total_employees metric', async () => {
    const metrics = await DashboardService.getHRMetrics(TENANT_A, PERIOD);
    const m = metrics.find((x) => x.id === 'total_employees');
    expect(m).toBeDefined();
    expect(typeof m!.value).toBe('number');
  });
});

describe('DashboardService.getPayrollMetrics', () => {
  it('returns payroll-related metrics', async () => {
    const metrics = await DashboardService.getPayrollMetrics(TENANT_A, PERIOD);
    expect(metrics.length).toBeGreaterThan(0);
  });
});

describe('DashboardService.getAttendanceMetrics', () => {
  it('returns attendance metrics', async () => {
    const metrics = await DashboardService.getAttendanceMetrics(TENANT_A, PERIOD);
    expect(metrics.length).toBeGreaterThan(0);
  });
});

describe('DashboardService.getLeaveMetrics', () => {
  it('returns leave metrics', async () => {
    const metrics = await DashboardService.getLeaveMetrics(TENANT_A, PERIOD);
    expect(metrics.length).toBeGreaterThan(0);
  });
});

describe('DashboardService.getRecruitmentMetrics', () => {
  it('returns recruitment metrics', async () => {
    const metrics = await DashboardService.getRecruitmentMetrics(TENANT_A, PERIOD);
    expect(metrics.length).toBeGreaterThan(0);
  });
});

describe('DashboardService.getDepartmentBreakdown', () => {
  it('returns department headcount data', async () => {
    const data = await DashboardService.getDepartmentBreakdown(TENANT_A, PERIOD);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('DashboardService.getTrendData', () => {
  it('returns weekly trend points (7 days)', async () => {
    const data = await DashboardService.getTrendData(TENANT_A, 'headcount', 'week');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(7);
    expect(data[0]).toHaveProperty('label');
    expect(data[0]).toHaveProperty('value');
  });

  it('returns monthly trend points (4 weeks)', async () => {
    const data = await DashboardService.getTrendData(TENANT_A, 'headcount', 'month');
    expect(data.length).toBe(4);
  });

  it('returns yearly trend points (4 quarters)', async () => {
    const data = await DashboardService.getTrendData(TENANT_A, 'headcount', 'year');
    expect(data.length).toBe(4);
    expect(data[0].label).toBe('Q1');
  });
});

describe('DashboardService.createDefaultDashboard', () => {
  it('returns a dashboard config with required properties', async () => {
    const dash = await DashboardService.createDefaultDashboard(TENANT_A, 'HR', 'user-1');
    expect(dash).toHaveProperty('id');
    expect(dash).toHaveProperty('name');
    expect(dash).toHaveProperty('widgets');
    expect(Array.isArray(dash.widgets)).toBe(true);
  });
});

describe('DashboardService.getAnalyticsPeriods', () => {
  it('returns the standard analytics periods', () => {
    const periods = DashboardService.getAnalyticsPeriods();
    expect(periods.length).toBeGreaterThan(0);
    expect(periods[0]).toHaveProperty('label');
    expect(periods[0]).toHaveProperty('labelAr');
    expect(periods[0]).toHaveProperty('startDate');
    expect(periods[0]).toHaveProperty('endDate');
  });

  it('includes a "Today" period', () => {
    const periods = DashboardService.getAnalyticsPeriods();
    expect(periods.some((p: any) => p.label === 'Today')).toBe(true);
  });
});
