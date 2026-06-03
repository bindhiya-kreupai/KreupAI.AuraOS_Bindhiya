/**
 * CloudCostService.rollup — pure rollup logic tests. (#114)
 */

import { describe, it, expect } from 'vitest';
import { CloudCostService } from '../cloud-cost.service';

const svc = new CloudCostService();

describe('CloudCostService.rollup', () => {
  it('returns an empty rollup when no rows', () => {
    const r = svc.rollup([]);
    expect(r.total).toBe(0);
    expect(r.byService).toEqual({});
  });

  it('aggregates by service, provider, region', () => {
    const r = svc.rollup([
      {
        costAmount: 100,
        service: 'COMPUTE',
        provider: 'AWS',
        region: 'us-east-1',
        currency: 'USD',
      },
      {
        costAmount: 50.25,
        service: 'STORAGE',
        provider: 'AWS',
        region: 'us-east-1',
        currency: 'USD',
      },
      {
        costAmount: 75,
        service: 'COMPUTE',
        provider: 'GCP',
        region: 'eu-west-1',
        currency: 'USD',
      },
    ]);
    expect(r.total).toBeCloseTo(225.25, 2);
    expect(r.byService.COMPUTE).toBeCloseTo(175, 2);
    expect(r.byService.STORAGE).toBeCloseTo(50.25, 2);
    expect(r.byProvider.AWS).toBeCloseTo(150.25, 2);
    expect(r.byProvider.GCP).toBeCloseTo(75, 2);
    expect(r.byRegion['us-east-1']).toBeCloseTo(150.25, 2);
    expect(r.byRegion['eu-west-1']).toBeCloseTo(75, 2);
  });

  it('handles decimal-as-string amounts from Prisma', () => {
    const r = svc.rollup([
      {
        costAmount: '100.50',
        service: 'COMPUTE',
        provider: 'AWS',
        region: 'us-east-1',
        currency: 'USD',
      },
    ]);
    expect(r.total).toBeCloseTo(100.5, 2);
  });
});
