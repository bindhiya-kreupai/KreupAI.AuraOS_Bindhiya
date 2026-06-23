import { describe, it, expect } from 'vitest';
import {
  aggregateFlagsByCountryEntity,
  buildRiskHeatmap,
  computeRiskScore,
  type FlagSnapshot,
} from '../drill-down.service';

const flag = (
  id: string,
  domain: string,
  country: string,
  severity: FlagSnapshot['severity'],
  status: FlagSnapshot['status'] = 'OPEN',
  legalEntityId = 'E1',
  departmentId = 'D1'
): FlagSnapshot => ({
  id,
  domain,
  countryCode: country,
  severity,
  status,
  legalEntityId,
  departmentId,
  raisedAt: new Date('2026-06-10'),
});

describe('computeRiskScore', () => {
  it('returns 0 when no flags', () => {
    expect(computeRiskScore({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 })).toBe(0);
  });

  it('one CRITICAL produces a meaningful score', () => {
    const s = computeRiskScore({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 1 });
    expect(s).toBeGreaterThan(50);
    expect(s).toBeLessThanOrEqual(80);
  });

  it('one LOW barely registers but is non-zero', () => {
    const s = computeRiskScore({ LOW: 1, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(50);
  });

  it('clamps to 100', () => {
    const s = computeRiskScore({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 1000 });
    expect(s).toBe(100);
  });
});

describe('aggregateFlagsByCountryEntity — EPIC-31 drill-down', () => {
  it('drops RESOLVED and WAIVED flags from the rollup', () => {
    const root = aggregateFlagsByCountryEntity([
      flag('1', 'PAYROLL', 'AE', 'CRITICAL'),
      flag('2', 'PAYROLL', 'AE', 'HIGH', 'RESOLVED'),
      flag('3', 'PAYROLL', 'AE', 'MEDIUM', 'WAIVED'),
    ]);
    expect(root.flagCount).toBe(1);
  });

  it('groups by country → entity → department', () => {
    const root = aggregateFlagsByCountryEntity([
      flag('1', 'PAYROLL', 'AE', 'HIGH', 'OPEN', 'E1', 'D1'),
      flag('2', 'PAYROLL', 'AE', 'MEDIUM', 'OPEN', 'E1', 'D2'),
      flag('3', 'EOSB', 'SA', 'CRITICAL', 'OPEN', 'E2', 'D3'),
    ]);
    expect(root.children).toHaveLength(2); // AE + SA
    const ae = root.children!.find((c) => c.key === 'AE')!;
    expect(ae.children).toHaveLength(1); // E1
    expect(ae.children![0].children).toHaveLength(2); // D1 + D2
  });

  it('computes per-country max severity', () => {
    const root = aggregateFlagsByCountryEntity([
      flag('1', 'PAYROLL', 'AE', 'LOW'),
      flag('2', 'PAYROLL', 'AE', 'HIGH'),
    ]);
    const ae = root.children!.find((c) => c.key === 'AE')!;
    expect(ae.maxSeverity).toBe('HIGH');
  });

  it('emits topFive sorted by severity weight', () => {
    const root = aggregateFlagsByCountryEntity([
      flag('1', 'PAYROLL', 'AE', 'LOW'),
      flag('2', 'EOSB', 'AE', 'CRITICAL'),
      flag('3', 'LEAVE', 'AE', 'HIGH'),
      flag('4', 'GOSI', 'AE', 'MEDIUM'),
      flag('5', 'WPS', 'AE', 'HIGH'),
      flag('6', 'ATTEND', 'AE', 'LOW'),
    ]);
    expect(root.topFive.map((f) => f.severity).slice(0, 3)).toEqual(['CRITICAL', 'HIGH', 'HIGH']);
    expect(root.topFive).toHaveLength(5);
  });
});

describe('buildRiskHeatmap — EPIC-31 2D heatmap', () => {
  it('produces one cell per (domain, country) pair', () => {
    const cells = buildRiskHeatmap([
      flag('1', 'PAYROLL', 'AE', 'HIGH'),
      flag('2', 'PAYROLL', 'SA', 'CRITICAL'),
      flag('3', 'EOSB', 'AE', 'MEDIUM'),
    ]);
    expect(cells).toHaveLength(3);
    const keys = new Set(cells.map((c) => `${c.domain}/${c.country}`));
    expect(keys).toEqual(new Set(['PAYROLL/AE', 'PAYROLL/SA', 'EOSB/AE']));
  });

  it('sorts cells by riskScore desc', () => {
    const cells = buildRiskHeatmap([
      flag('1', 'PAYROLL', 'AE', 'LOW'),
      flag('2', 'EOSB', 'SA', 'CRITICAL'),
    ]);
    expect(cells[0].domain).toBe('EOSB');
    expect(cells[0].riskScore).toBeGreaterThan(cells[1].riskScore);
  });

  it('aggregates multiple flags per cell into one count', () => {
    const cells = buildRiskHeatmap([
      flag('1', 'PAYROLL', 'AE', 'HIGH'),
      flag('2', 'PAYROLL', 'AE', 'HIGH'),
      flag('3', 'PAYROLL', 'AE', 'CRITICAL'),
    ]);
    expect(cells).toHaveLength(1);
    expect(cells[0].flagCount).toBe(3);
    expect(cells[0].maxSeverity).toBe('CRITICAL');
  });

  it('excludes RESOLVED + WAIVED from the heatmap', () => {
    const cells = buildRiskHeatmap([
      flag('1', 'PAYROLL', 'AE', 'HIGH', 'RESOLVED'),
      flag('2', 'PAYROLL', 'AE', 'HIGH', 'WAIVED'),
    ]);
    expect(cells).toHaveLength(0);
  });
});
